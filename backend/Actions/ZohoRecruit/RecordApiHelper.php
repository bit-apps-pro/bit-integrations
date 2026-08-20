<?php

/**
 * ZohoRecruit Record Api
 */

namespace BitApps\Integrations\Actions\ZohoRecruit;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\DateTimeHelper;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class RecordApiHelper
{
    private $_defaultHeader;

    private $_tokenDetails;

    public function __construct($dataCenter, $tokenDetails, $integId)
    {
        $this->_defaultHeader['Authorization'] = "Zoho-oauthtoken {$tokenDetails->access_token}";
        $this->_dataCenter = $dataCenter;
        $this->_tokenDetails = $tokenDetails;
        $this->_integrationID = $integId;
    }

    public function insertRecord($module, $data)
    {
        $insertRecordEndpoint = "https://recruit.zoho.{$this->_dataCenter}/recruit/private/json/{$module}/addRecords";

        return HttpHelper::post($insertRecordEndpoint, $data, $this->_defaultHeader);
    }

    public function execute($defaultConf, $module, $fieldValues, $fieldMap, $actions, $required, $fileMap)
    {
        $fieldData = [];
        foreach ($fieldMap as $fieldKey => $fieldPair) {
            if (!empty($fieldPair->zohoFormField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldData[$fieldPair->zohoFormField] = $this->formatFieldValue($fieldPair->customValue, $defaultConf->moduleData->{$module}->fields->{$fieldPair->zohoFormField});
                } else {
                    $fieldData[$fieldPair->zohoFormField] = $this->formatFieldValue($fieldValues[$fieldPair->formField], $defaultConf->moduleData->{$module}->fields->{$fieldPair->zohoFormField});
                    if ($fieldPair->zohoFormField === 'Zip/Postal Code') {
                        $fieldData['Zip Code'] = $fieldData[$fieldPair->zohoFormField];
                        unset($fieldData[$fieldPair->zohoFormField]);
                    }
                }

                if (empty($fieldData[$fieldPair->zohoFormField]) && \in_array($fieldPair->zohoFormField, $required)) {
                    // translators: 1: Field name, 2: Module name
                    $error = new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('%1$s is required for zoho recruit, %2$s module', 'bit-integrations'), $fieldPair->zohoFormField, $module));
                    LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'field'], 'validation', $error);

                    return $error;
                }
            }
        }

        $xmlData = "<{$module}><row no='1'>";

        foreach ($fieldData as $field => $value) {
            $xmlData .= "<FL val='{$field}'>{$value}</FL>";
        }

        if (!empty($actions->recordOwner)) {
            $xmlData .= "<FL val='SMOWNERID'>{$actions->recordOwner}</FL>";
        }
        $xmlData .= "</row></{$module}>";
        $requestParams['scope'] = 'ZohoRecruit.modules.all';
        $requestParams['version'] = 4;

        $requestParams['xmlData'] = $xmlData;
        if (!empty($actions->workflow)) {
            $requestParams['wfTrigger'] = 'true';
        }
        if (!empty($actions->upsert)) {
            $requestParams['duplicateCheck'] = 2;
        }
        if (!empty($actions->approval)) {
            $requestParams['isApproval'] = 'true';
        }

        $recordApiResponse = $this->insertRecord($module, $requestParams);
        if (isset($recordApiResponse->response->error)) {
            return LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $module], 'error', $recordApiResponse);
        }
        LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $module], 'success', $recordApiResponse);

        if (isset($recordApiResponse->response->error)) {
            return new WP_Error('INSERT_ERROR', $recordApiResponse->response->error->message);
        }
        if (!empty($recordApiResponse->response->result->row->success->details->FL[0]) && $recordApiResponse->response->result->row->success->details->FL[0]->val === 'Id') {
            $recordID = $recordApiResponse->response->result->row->success->details->FL[0]->content;
            if (isset($actions->note) && !empty($actions->note->type)) {
                $noteDetails = $actions->note;
                $typeDetails = explode('__', $noteDetails->type);
                $content = Common::replaceFieldWithValue($noteDetails->content, $fieldValues);
                $xmlData = "<Notes><row no='1'>";
                $xmlData .= "<FL val='entityId'>{$recordID}</FL>";
                $xmlData .= "<FL val='Note Type'>{$typeDetails[1]}</FL>";
                $xmlData .= "<FL val='Type Id'>{$typeDetails[0]}</FL>";
                $xmlData .= "<FL val='Note Content'>{$content}</FL>";
                $xmlData .= "<FL val='Parent Module'>{$module}</FL>";
                $xmlData .= '</row></Notes>';
                $requestParams['version'] = 2;
                $requestParams['xmlData'] = $xmlData;

                $noteApiResponse = $this->insertRecord('Notes', $requestParams);
                if (isset($noteApiResponse->response->error)) {
                    LogHandler::save($this->_integrationID, ['type' => 'note', 'type_name' => $module], 'error', $noteApiResponse);
                } else {
                    LogHandler::save($this->_integrationID, ['type' => 'note', 'type_name' => $module], 'success', $noteApiResponse);
                }
            }

            $filesApiHelper = new FilesApiHelper($module, $this->_dataCenter, $this->_tokenDetails);
            if (\count($fileMap)) {
                $fileFound = 0;
                $responseType = 'success';
                $fileUpResponses = [];
                foreach ($fileMap as $fileKey => $filePair) {
                    if (!empty($filePair->zohoFormField) && !empty($fieldValues[$filePair->formField])) {
                        $fileFound = 1;
                        if (@property_exists($defaultConf->moduleData->{$module}->fileUploadFields, $filePair->zohoFormField) && $defaultConf->moduleData->{$module}->fileUploadFields->{$filePair->zohoFormField}->data_type === 'UploadText') {
                            $fileUpResponse = $filesApiHelper->uploadFiles($fieldValues[$filePair->formField], $recordID, $filePair->zohoFormField);
                            if (isset($fileUpResponse->response->error)) {
                                $responseType = 'error';
                            }
                            $fileUpResponses[] = $fileUpResponse;
                        }
                    }
                }
                if ($fileFound) {
                    LogHandler::save($this->_integrationID, ['type' => 'file', 'type_name' => $module], $responseType, $fileUpResponses);
                }
            }
        }

        return $recordApiResponse;
    }

    public function formatFieldValue($value, $formatSpecs)
    {
        if (empty($value)) {
            return '';
        }

        switch ($formatSpecs->data_type) {
            case 'AutoNumber':
                $apiFormat = 'integer';

                break;

            case 'Text':
            case 'Picklist':
            case 'Email':
            case 'Website':
            case 'Currency':
            case 'TextArea':
                $apiFormat = 'string';

                break;

            case 'Date':
                $apiFormat = 'date';

                break;

            case 'DateTime':
                $apiFormat = 'datetime';

                break;

            case 'Double':
                $apiFormat = 'double';

                break;

            case 'Boolean':
                $apiFormat = 'boolean';

                break;

            default:
                $apiFormat = $formatSpecs->data_type;

                break;
        }

        $formatedValue = '';
        $fieldFormat = \gettype($value);
        if ($fieldFormat === $apiFormat && $formatSpecs->data_type !== 'datetime') {
            $formatedValue = $value;
        } else {
            if ($apiFormat === 'string' && $formatSpecs->data_type !== 'datetime') {
                $formatedValue = !\is_string($value) ? wp_json_encode($value) : $value;
            } elseif ($apiFormat === 'datetime') {
                $dateTimeHelper = new DateTimeHelper();
                $formatedValue = $dateTimeHelper->getFormated($value, 'Y-m-d\TH:i', DateTimeHelper::wp_timezone(), 'Y-m-d H:i:s', null);
            } elseif ($apiFormat === 'date') {
                $dateTimeHelper = new DateTimeHelper();
                $formatedValue = $dateTimeHelper->getFormated($value, 'Y-m-d', DateTimeHelper::wp_timezone(), 'm/d/Y', null);
            } else {
                $stringyfiedValue = !\is_string($value) ? wp_json_encode($value) : $value;

                switch ($apiFormat) {
                    case 'double':
                        $formatedValue = (float) $stringyfiedValue;

                        break;

                    case 'boolean':
                        $formatedValue = (bool) $stringyfiedValue;

                        break;

                    case 'integer':
                        $formatedValue = (int) $stringyfiedValue;

                        break;

                    default:
                        $formatedValue = $stringyfiedValue;

                        break;
                }
            }
        }
        $formatedValueLenght = $apiFormat === 'array' || $apiFormat === 'object' ? (is_countable($formatedValue) ? \count($formatedValue) : @\count($formatedValue)) : \strlen($formatedValue);
        if ($formatedValueLenght > $formatSpecs->length) {
            $formatedValue = $apiFormat === 'array' || $apiFormat === 'object' ? \array_slice($formatedValue, 0, $formatSpecs->length) : substr($formatedValue, 0, $formatSpecs->length);
        }

        return $formatedValue;
    }
}
