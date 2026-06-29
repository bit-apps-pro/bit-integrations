<?php

/**
 * ZohoCrm Record Api
 */

namespace BitApps\Integrations\Actions\ZohoCRM;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\DateTimeHelper;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use stdClass;
use WP_Error;

/**
 * Provide functionality for Record insert,upsert
 */
class RecordApiHelper
{
    private $_defaultHeader;

    private $_apiDomain;

    private $_tokenDetails;

    public function __construct($tokenDetails)
    {
        $this->_defaultHeader['Authorization'] = "Zoho-oauthtoken {$tokenDetails->access_token}";
        $this->_apiDomain = urldecode($tokenDetails->api_domain) . '/crm/v2.1';
        $this->_tokenDetails = $tokenDetails;
    }

    public function upsertRecord($module, $data)
    {
        $insertRecordEndpoint = "{$this->_apiDomain}/{$module}/upsert";
        $data = \is_string($data) ? $data : wp_json_encode($data);

        return HttpHelper::post($insertRecordEndpoint, $data, $this->_defaultHeader);
    }

    public function insertRecord($module, $data)
    {
        $insertRecordEndpoint = "{$this->_apiDomain}/{$module}";
        $data = \is_string($data) ? $data : wp_json_encode($data);

        return HttpHelper::post($insertRecordEndpoint, $data, $this->_defaultHeader);
    }

    public function searchRecord($module, $searchCriteria)
    {
        $searchRecordEndpoint = "{$this->_apiDomain}/{$module}/search";

        return HttpHelper::get($searchRecordEndpoint, ['criteria' => "({$searchCriteria})"], $this->_defaultHeader);
    }

    public function execute($integId, $defaultConf, $module, $layout, $fieldValues, $fieldMap, $actions, $required, $fileMap = [], $isRelated = false)
    {
        $fieldData = [];
        $filesApiHelper = new FilesApiHelper($this->_tokenDetails, $integId);
        foreach ($fieldMap as $fieldKey => $fieldPair) {
            if (!empty($fieldPair->zohoFormField)) {
                if (empty($defaultConf->layouts->{$module}->{$layout}->fields->{$fieldPair->zohoFormField})) {
                    continue;
                }
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldData[$fieldPair->zohoFormField] = $this->formatFieldValue(Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues), $defaultConf->layouts->{$module}->{$layout}->fields->{$fieldPair->zohoFormField});
                } else {
                    $fieldData[$fieldPair->zohoFormField] = $this->formatFieldValue($fieldValues[$fieldPair->formField], $defaultConf->layouts->{$module}->{$layout}->fields->{$fieldPair->zohoFormField});
                }
                if (empty($fieldData[$fieldPair->zohoFormField]) && \in_array($fieldPair->zohoFormField, $required)) {
                    // translators: 1: Field name, 2: Module name
                    $error = new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('%1$s is required for zoho crm, %2$s module', 'bit-integrations'), $fieldPair->zohoFormField, $module));
                    LogHandler::save($integId, wp_json_encode(['type' => 'record', 'type_name' => 'field']), 'validation', wp_json_encode($error));

                    return $error;
                }
                if (!empty($fieldData[$fieldPair->zohoFormField])) {
                    $requiredLength = $defaultConf->layouts->{$module}->{$layout}->fields->{$fieldPair->zohoFormField}->length;
                    if (\is_array($fieldData[$fieldPair->zohoFormField]) || \is_object($fieldData[$fieldPair->zohoFormField])) {
                        $currentLength = is_countable($fieldData[$fieldPair->zohoFormField]) ? \count($fieldData[$fieldPair->zohoFormField]) : \count(get_object_vars($fieldData[$fieldPair->zohoFormField]));
                    } else {
                        $currentLength = \strlen($fieldData[$fieldPair->zohoFormField]);
                    }
                    if ($currentLength > $requiredLength) {
                        // translators: 1: Field name, 2: Maximum length, 3: Given length
                        $error = new WP_Error('REQ_FIELD_LENGTH_EXCEEDED', wp_sprintf(__('zoho crm field %1$s\'s maximum length is %2$s, Given %3$s', 'bit-integrations'), $fieldPair->zohoFormField, $module));
                        LogHandler::save($integId, wp_json_encode(['type' => 'length', 'type_name' => 'field']), 'validation', wp_json_encode($error));

                        return $error;
                    }
                }
            }
        }

        foreach ($fileMap as $fileKey => $filePair) {
            if (!empty($filePair->zohoFormField)) {
                if (($defaultConf->layouts->{$module}->{$layout}->fileUploadFields->{$filePair->zohoFormField}->data_type === 'fileupload'
                        || $defaultConf->layouts->{$module}->{$layout}->fileUploadFields->{$filePair->zohoFormField}->data_type === 'imageupload')
                    && !empty($fieldValues[$filePair->formField])
                ) {
                    $files = $fieldValues[$filePair->formField];

                    $fileLength = $defaultConf->layouts->{$module}->{$layout}->fileUploadFields->{$filePair->zohoFormField}->length;
                    if (\is_array($files) && \count($files) !== $fileLength) {
                        $files = \array_slice($fieldValues[$filePair->formField], 0, $fileLength);
                    }
                    $uploadsIDs = $filesApiHelper->uploadFiles(
                        $files,
                        $defaultConf->layouts->{$module}->{$layout}->fileUploadFields->{$filePair->zohoFormField}->data_type
                    );
                    if ($uploadsIDs) {
                        $fieldData[$filePair->zohoFormField] = $uploadsIDs;
                    }
                }
            }
        }
        if (!empty($defaultConf->layouts->{$module}->{$layout}->id)) {
            $fieldData['Layout']['id'] = $defaultConf->layouts->{$module}->{$layout}->id;
        }
        if (!empty($actions->gclid)) {
            $gclid = '';
            if (isset($fieldValues['gclid'])) {
                $gclid = $fieldValues['gclid'];
            } elseif (isset($fieldValues['zc_gad'])) {
                $gclid = $fieldValues['zc_gad'];
            } elseif (isset($_REQUEST['zc_gad'])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
                $zc_gad = wp_unslash($_REQUEST['zc_gad']); // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized on next line
                $gclid = sanitize_text_field($zc_gad);
            }
            if (!empty($gclid)) {
                $fieldData['$gclid'] = $gclid;
            }
        }
        if (!empty($actions->rec_owner)) {
            $fieldData['Owner']['id'] = $actions->rec_owner;
        }
        $requestParams['data'][] = (object) $fieldData;
        $requestParams['trigger'] = [];
        if (!empty($actions->workflow)) {
            $requestParams['trigger'][] = 'workflow';
        }
        if (!empty($actions->approval)) {
            $requestParams['trigger'][] = 'approval';
        }
        if (!empty($actions->blueprint)) {
            $requestParams['trigger'][] = 'blueprint';
        }
        if (!empty($actions->assignment_rules)) {
            $requestParams['lar_id'] = $actions->assignment_rules;
        }
        $recordApiResponse = '';
        if (!empty($actions->upsert)) {
            $requestParams['duplicate_check_fields'] = [];
            if (!empty($actions->upsert) && !empty($actions->upsert->crmField)) {
                $duplicateCheckFields = [];
                $searchCriteria = '';
                foreach ($actions->upsert->crmField as $fieldInfo) {
                    if (!empty($fieldInfo->name) && $fieldData[$fieldInfo->name]) {
                        $duplicateCheckFields[] = $fieldInfo->name;
                        if (empty($searchCriteria)) {
                            $searchCriteria .= "({$fieldInfo->name}:equals:{$fieldData[$fieldInfo->name]})";
                        } else {
                            $searchCriteria .= "and({$fieldInfo->name}:equals:{$fieldData[$fieldInfo->name]})";
                        }
                    }
                }
                if (isset($actions->upsert->overwrite) && !$actions->upsert->overwrite && !empty($searchCriteria)) {
                    $searchRecordApiResponse = $this->searchRecord($module, $searchCriteria);
                    if (!empty($searchRecordApiResponse) && !empty($searchRecordApiResponse->data)) {
                        $previousData = $searchRecordApiResponse->data[0];
                        foreach ($fieldData as $apiName => $currentValue) {
                            if (!empty($previousData->{$apiName})) {
                                $fieldData[$apiName] = $previousData->{$apiName};
                            }
                        }
                        $requestParams['data'][] = (object) $fieldData;
                    }
                }
                $requestParams['duplicate_check_fields'] = $duplicateCheckFields;
            }
            $recordApiResponse = $this->upsertRecord($module, (object) $requestParams);
        } elseif ($isRelated) {
            $recordApiResponse = $this->insertRecord($module, (object) $requestParams);
        } else {
            $recordApiResponse = $this->insertRecord($module, (object) $requestParams);
        }

        if ((isset($recordApiResponse->status) && $recordApiResponse->status === 'error')
            || (isset($recordApiResponse->data[0]->status)
                && $recordApiResponse->data[0]->status === 'error')
        ) {
            LogHandler::save($integId, wp_json_encode(['type' => 'record', 'type_name' => $module]), 'error', wp_json_encode($recordApiResponse));
        } else {
            LogHandler::save($integId, wp_json_encode(['type' => 'record', 'type_name' => $module]), 'success', wp_json_encode($recordApiResponse));
        }
        if (
            !empty($recordApiResponse->data)
            && !empty($recordApiResponse->data[0]->code)
            && $recordApiResponse->data[0]->code === 'SUCCESS'
            && !empty($recordApiResponse->data[0]->details->id)
        ) {
            if (!empty($actions->tag_rec) && class_exists('BitApps\Integrations\Actions\ZohoCRM\TagApiHelper')) {
                $tags = '';
                $tag_rec = explode(',', $actions->tag_rec);
                foreach ($tag_rec as $tag) {
                    if (\is_string($tag) && substr($tag, 0, 2) === '${' && $tag[\strlen($tag) - 1] === '}') {
                        $tags .= (!empty($tags) ? ',' : '') . $fieldValues[substr($tag, 2, \strlen($tag) - 3)];
                    } else {
                        $tags .= (!empty($tags) ? ',' : '') . $tag;
                    }
                }
                $tagApiHelper = new TagApiHelper($this->_tokenDetails, $module);
                $addTagResponse = $tagApiHelper->addTagsSingleRecord($recordApiResponse->data[0]->details->id, $tags);
                if (isset($addTagResponse->status) && $addTagResponse->status === 'error') {
                    LogHandler::save($integId, wp_json_encode(['type' => 'tag', 'type_name' => $module]), 'error', wp_json_encode($addTagResponse));
                } else {
                    LogHandler::save($integId, wp_json_encode(['type' => 'tag', 'type_name' => $module]), 'success', wp_json_encode($addTagResponse));
                }
            }
            if (!empty($actions->attachment)) {
                $fileFound = 0;
                $responseType = 'success';
                $attachmentApiResponses = [];
                $attachment = explode(',', $actions->attachment);
                foreach ($attachment as $fileField) {
                    if (isset($fieldValues[$fileField]) && !empty($fieldValues[$fileField])) {
                        $fileFound = 1;
                        if (\is_array($fieldValues[$fileField])) {
                            foreach ($fieldValues[$fileField] as $singleFile) {
                                $attachmentApiResponse = $filesApiHelper->uploadFiles($singleFile, 'fileupload', true, $module, $recordApiResponse->data[0]->details->id);
                                if ($attachmentApiResponse instanceof stdClass && isset($attachmentApiResponse->status) && $attachmentApiResponse->status === 'error') {
                                    $responseType = 'error';
                                }
                            }
                        } else {
                            $attachmentApiResponse = $filesApiHelper->uploadFiles($fieldValues[$fileField], 'fileupload', true, $module, $recordApiResponse->data[0]->details->id);
                            if ($attachmentApiResponse instanceof stdClass && isset($attachmentApiResponse->status) && $attachmentApiResponse->status === 'error') {
                                $responseType = 'error';
                            }
                        }
                    }
                }
                if ($fileFound) {
                    LogHandler::save($integId, wp_json_encode(['type' => 'attachment', 'type_name' => $module]), $responseType, wp_json_encode($attachmentApiResponses));
                }
            }
        }

        return $recordApiResponse;
    }

    public function formatFieldValue($value, $formatSpecs)
    {
        if (empty($value)) {
            return $value;
        }

        switch ($formatSpecs->json_type) {
            case 'jsonarray':
                $apiFormat = 'array';

                break;
            case 'jsonobject':
                $apiFormat = 'object';

                break;

            default:
                $apiFormat = $formatSpecs->json_type;

                break;
        }
        $formatedValue = '';
        $fieldFormat = \gettype($value);
        if ($fieldFormat === $apiFormat && $formatSpecs->data_type !== 'datetime' && $formatSpecs->data_type !== 'date') {
            $formatedValue = $fieldFormat === 'string' ? html_entity_decode($value) : $value;
        } else {
            if ($apiFormat === 'array' || $apiFormat === 'object') {
                if ($fieldFormat === 'string') {
                    if (strpos($value, ',') === -1) {
                        $formatedValue = json_decode($value);
                    } else {
                        $formatedValue = explode(',', $value);
                    }
                    $formatedValue = \is_null($formatedValue) && !\is_null($value) ? [$value] : $formatedValue;
                } else {
                    $formatedValue = $value;
                }

                if ($apiFormat === 'object') {
                    $formatedValue = (object) $formatedValue;
                }
            } elseif ($apiFormat === 'string' && $formatSpecs->data_type !== 'datetime' && $formatSpecs->data_type !== 'date') {
                $formatedValue = \is_array($value) || \is_object($value) ? implode(',', (array) $value) : html_entity_decode($value);
            } elseif ($formatSpecs->data_type === 'datetime') {
                $getDateFormat = self::setDateFormat($value);
                $date_format = $getDateFormat['date_format'];
                $value = $getDateFormat['value'];

                $dateTimeHelper = new DateTimeHelper();
                $formatedValue = $dateTimeHelper->getFormated($value, $date_format, DateTimeHelper::wp_timezone(), 'Y-m-d\TH:i:sP', null);
                $formatedValue = !$formatedValue ? null : $formatedValue;
            } elseif ($formatSpecs->data_type === 'date') {
                $getDateFormat = self::setDateFormat($value);
                $date_format = $getDateFormat['date_format'];
                $value = $getDateFormat['value'];

                $dateTimeHelper = new DateTimeHelper();
                $formatedValue = $dateTimeHelper->getFormated($value, $date_format, DateTimeHelper::wp_timezone(), 'Y-m-d', null);
                $formatedValue = !$formatedValue ? null : $formatedValue;
            } else {
                $stringyfieldValue = \is_array($value) || \is_object($value) ? implode(',', (array) $value) : $value;

                switch ($apiFormat) {
                    case 'double':
                        $formatedValue = (float) $stringyfieldValue;

                        break;

                    case 'boolean':
                        $formatedValue = (bool) $stringyfieldValue;

                        break;

                    case 'integer':
                        $formatedValue = (int) $stringyfieldValue;

                        break;
                    default:
                        $formatedValue = $stringyfieldValue;

                        break;
                }
            }
        }
        if ($apiFormat === 'array' || $apiFormat === 'object') {
            $formatedValueLenght = is_countable($formatedValue) ? \count($formatedValue) : \count(get_object_vars($formatedValue));
        } else {
            $formatedValueLenght = \strlen($formatedValue);
        }
        if ($formatedValueLenght > $formatSpecs->length) {
            $formatedValue = $apiFormat === 'array' || $apiFormat === 'object' ? \array_slice($formatedValue, 0, $formatSpecs->length) : substr($formatedValue, 0, $formatSpecs->length);
        }

        return $formatedValue;
    }

    private static function setDateFormat($value)
    {
        if (\is_array($value)) {
            if (isset($value['time'], $value['date'])) {
                $value = isset($value['date']) . ' ' . $value['time'];
                $date_format = 'm/d/Y H:i A';
            } elseif (isset($value['date'])) {
                $value = $value['date'];
                $date_format = 'm/d/Y';
            } elseif (isset($value['time'])) {
                $value = $value['time'];
                $date_format = 'H:i A';
            } else {
                $value = '0000-00-00T00:00';
                $date_format = 'Y-m-d\TH:i';
            }
        } else {
            $date_format = 'Y-m-d\TH:i';
        }

        $value = gmdate($date_format, strtotime($value));

        return ['value' => $value, 'date_format' => $date_format];
    }
}
