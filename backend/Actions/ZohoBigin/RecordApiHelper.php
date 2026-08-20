<?php

/**
 * ZohoBigin Record Api
 */

namespace BitApps\Integrations\Actions\ZohoBigin;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\DateTimeHelper;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class RecordApiHelper
{
    private $_defaultHeader;

    private $_apiDomain;

    private $_tokenDetails;

    public function __construct($tokenDetails, $integID)
    {
        $this->_defaultHeader['Authorization'] = "Zoho-oauthtoken {$tokenDetails->access_token}";
        $this->_apiDomain = urldecode($tokenDetails->api_domain);
        $this->_tokenDetails = $tokenDetails;
        $this->_integID = $integID;
    }

    public function insertRecord($module, $data)
    {
        $insertRecordEndpoint = "{$this->_apiDomain}/bigin/v1/{$module}";

        return HttpHelper::post($insertRecordEndpoint, $data, $this->_defaultHeader);
    }

    public function execute($defaultConf, $module, $fieldValues, $fieldMap, $actions, $required, $integrationDetails)
    {
        $fieldData = [];
        foreach ($fieldMap as $fieldKey => $fieldPair) {
            if (!empty($fieldPair->zohoFormField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldData[$fieldPair->zohoFormField] = $this->formatFieldValue($fieldPair->customValue, $defaultConf->moduleData->{$module}->fields->{$fieldPair->zohoFormField});
                } else {
                    $fieldData[$fieldPair->zohoFormField] = $this->formatFieldValue($fieldValues[$fieldPair->formField], $defaultConf->moduleData->{$module}->fields->{$fieldPair->zohoFormField});
                }

                if (empty($fieldData[$fieldPair->zohoFormField]) && \in_array($fieldPair->zohoFormField, $required)) {
                    // translators: 1: Field name, 2: Module name
                    $error = new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('%1$s is required for zoho bigin, %2$s module', 'bit-integrations'), $fieldPair->zohoFormField, $module));
                    LogHandler::save($this->_integID, ['type' => 'record', 'type_name' => 'field'], 'validation', $error);

                    return $error;
                }
            }
        }
        if ($module === 'Deals') {
            $fieldData['Pipeline'] = $integrationDetails->pLayout;
        }

        $requestParams['data'][] = (object) $fieldData;
        $requestParams['trigger'] = [];

        if (!empty($actions->workflow)) {
            $requestParams['trigger'][] = 'workflow';
        }
        if (!empty($actions->approval)) {
            $requestParams['trigger'][] = 'approval';
        }

        $recordApiResponse = $this->insertRecord($module, wp_json_encode($requestParams));
        if ((isset($recordApiResponse->status) && $recordApiResponse->status === 'error') || $recordApiResponse->data[0]->status === 'error') {
            return LogHandler::save($this->_integID, ['type' => 'record', 'type_name' => $module], 'error', $recordApiResponse);
        }
        LogHandler::save($this->_integID, ['type' => 'record', 'type_name' => $module], 'success', $recordApiResponse);

        $recordID = 0;
        if (!empty($recordApiResponse->data[0]->details->id)) {
            $recordID = $recordApiResponse->data[0]->details->id;
            if (isset($actions->note)) {
                $note_title = $actions->note->title ? $actions->note->title : '';
                $note_content = $actions->note->content ? Common::replaceFieldWithValue($actions->note->content, $fieldValues) : '';
                $note = (object) [
                    'Note_Title'   => $note_title,
                    'Note_Content' => $note_content,
                    'Parent_Id'    => $recordID,
                    'se_module'    => $module
                ];
                $requestParams['data'][] = $note;

                $noteApiResponse = $this->insertNote($module, $recordID, wp_json_encode($requestParams));
                if (isset($noteApiResponse->status) && $noteApiResponse->status === 'error') {
                    LogHandler::save($this->_integID, ['type' => 'note', 'type_name' => $module], 'error', $noteApiResponse);
                } else {
                    LogHandler::save($this->_integID, ['type' => 'note', 'type_name' => $module], 'success', $noteApiResponse);
                }
            }
        }

        if (isset($actions->attachments)) {
            $filesApiHelper = new FilesApiHelper($this->_tokenDetails);
            $attachments = explode(',', $actions->attachments);
            $fileFound = 0;
            $responseType = 'success';
            $attachmentApiResponses = [];
            foreach ($attachments as $fileField) {
                if (isset($fieldValues[$fileField]) && !empty($fieldValues[$fileField])) {
                    $fileFound = 1;
                    if (\is_array($fieldValues[$fileField])) {
                        foreach ($fieldValues[$fileField] as $singleFile) {
                            $attachmentApiResponse = $filesApiHelper->uploadFiles($singleFile, $module, $recordID);
                            if (\is_object($attachmentApiResponse) && isset($attachmentApiResponse->status) && $attachmentApiResponse->status === 'error') {
                                $responseType = 'error';
                            }
                            $attachmentApiResponses[] = $attachmentApiResponse;
                        }
                    } else {
                        $attachmentApiResponse = $filesApiHelper->uploadFiles($fieldValues[$fileField], $module, $recordID);
                        if (\is_object($attachmentApiResponse) && isset($attachmentApiResponse->status) && $attachmentApiResponse->status === 'error') {
                            $responseType = 'error';
                        }
                        $attachmentApiResponses[] = $attachmentApiResponse;
                    }
                }
            }
            if ($fileFound) {
                LogHandler::save($this->_integID, ['type' => 'file', 'type_name' => $module], $responseType, $attachmentApiResponses);
            }
        }

        if (isset($actions->selectedTags)) {
            $response = Hooks::apply(Config::withPrefix('zbigin_add_tags_to_records'), $recordID, $module, $actions->selectedTags, $this->_apiDomain, $this->_defaultHeader);

            $response = Hooks::apply('btcbi_zbigin_add_tags_to_records', $response, $module, $actions->selectedTags, $this->_apiDomain, $this->_defaultHeader);

            if ($response === $recordID) {
                // translators: %s: Plugin name
                // translators: %s: Placeholder value
                LogHandler::save($this->_integID, ['type' => 'tags', 'type_name' => $module], 'error', wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'));
            } elseif (\is_object($response) && isset($response->status) && $response->status === 'error') {
                LogHandler::save($this->_integID, ['type' => 'tags', 'type_name' => $module], 'error', $response);
            } else {
                LogHandler::save($this->_integID, ['type' => 'tags', 'type_name' => $module], 'success', __('Tags added successfully', 'bit-integrations'));
            }
        }

        if (isset($actions->photo)) {
            $filesApiHelper = new FilesApiHelper($this->_tokenDetails);
            if (isset($fieldValues[$actions->photo])) {
                $attachmentApiResponse = $filesApiHelper->uploadFiles($fieldValues[$actions->photo], $module, $recordID, true);
                if (\is_object($attachmentApiResponse) && isset($attachmentApiResponse->status) && $attachmentApiResponse->status === 'error') {
                    LogHandler::save($this->_integID, ['type' => 'photo', 'type_name' => $module], 'error', $attachmentApiResponse);
                } else {
                    LogHandler::save($this->_integID, ['type' => 'photo', 'type_name' => $module], 'success', $attachmentApiResponse);
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
            case 'Pick list':
            case 'Lookup':
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

    private function insertNote($module, $recordId, $data)
    {
        $insertRecordEndpoint = "{$this->_apiDomain}/bigin/v1/{$module}/{$recordId}/Notes";

        return HttpHelper::post($insertRecordEndpoint, $data, $this->_defaultHeader);
    }
}
