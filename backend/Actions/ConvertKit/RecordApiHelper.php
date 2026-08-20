<?php

/**
 * Convert Kit Record Api
 */

namespace BitApps\Integrations\Actions\ConvertKit;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationDetails;

    private $_defaultHeader;

    private $_integrationID;

    private $_apiEndpoint;

    public function __construct($integrationDetails, $api_secret, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_defaultHeader = $api_secret;
        $this->_apiEndpoint = 'https://api.convertkit.com/v3';
        $this->_integrationID = $integId;
    }

    public function storeOrModifyRecord($method, $formId, $data)
    {
        $queries = $this->httpBuildQuery($data);
        $insertRecordEndpoint = "{$this->_apiEndpoint}/forms/{$formId}/{$method}?{$queries}";

        return HttpHelper::post($insertRecordEndpoint, null);
    }

    public function updateRecord($id, $data)
    {
        $queries = $this->httpBuildQuery($data);
        $updateRecordEndpoint = "{$this->_apiEndpoint}/subscribers/{$id}?" . $queries;

        return HttpHelper::request($updateRecordEndpoint, 'PUT', null);
    }

    public function addTagToSubscriber($email, $tags)
    {
        $queries = http_build_query([
            'api_secret' => $this->_defaultHeader,
            'email'      => $email,
        ]);

        foreach ($tags as $tagId) {
            $searchEndPoint = "{$this->_apiEndpoint}/tags/{$tagId}/subscribe?{$queries}";
            $recordApiResponse = HttpHelper::post($searchEndPoint, null);
        }

        return $recordApiResponse;
    }

    public function removeTagToSubscriber($email, $tags)
    {
        $queries = http_build_query([
            'api_secret' => $this->_defaultHeader,
            'email'      => $email,
        ]);

        foreach ($tags as $tagId) {
            $searchEndPoint = "{$this->_apiEndpoint}/tags/{$tagId}/unsubscribe?{$queries}";
            $recordApiResponse = HttpHelper::post($searchEndPoint, null);
        }

        return $recordApiResponse;
    }

    public function execute($fieldValues, $fieldMap, $actions, $formId, $tags)
    {
        $convertKit = (object) $this->setFieldMapping($fieldMap, $fieldValues);
        $module = empty($this->_integrationDetails->module) ? 'add_subscriber_to_a_form' : $this->_integrationDetails->module;
        $existSubscriber = !empty($actions->update) ? $this->existSubscriber($convertKit->email) : false;
        $type = $typeName = null;
        $recordApiResponse = null;

        switch ($module) {
            case 'add_subscriber_to_a_form':
                if (!empty($actions->update) && !empty($existSubscriber)) {
                    $recordApiResponse = $this->updateRecord($existSubscriber->id, $convertKit);
                    $typeName = 'update';
                } elseif (empty($existSubscriber)) {
                    $recordApiResponse = $this->storeOrModifyRecord('subscribe', $formId, $convertKit);
                    $typeName = 'insert';
                } else {
                    $recordApiResponse = (object) ['error' => __('Email address already exists in the system', 'bit-integrations')];
                    $typeName = 'insert';
                }
                if (isset($tags) && (\count($tags)) > 0 && isset($recordApiResponse) && !isset($recordApiResponse->error)) {
                    $this->addTagToSubscriber($convertKit->email, $tags);
                }

                $type = 'Add subscriber to a form';

                break;

            case 'update_a_subscriber':
                $recordApiResponse = $existSubscriber ? $this->updateRecord($existSubscriber->id, $convertKit) : (object) ['error' => 'Subscriber not found!'];

                if (isset($tags) && (\count($tags)) > 0 && isset($recordApiResponse) && !isset($recordApiResponse->error)) {
                    $this->addTagToSubscriber($convertKit->email, $tags);
                }

                $type = 'Update subscriber';
                $typeName = 'update';

                break;

            case 'add_tags_to_a_subscriber':
                $recordApiResponse = $this->addTagToSubscriber($convertKit->email, $tags);
                $type = 'Add tags to subscriber';
                $typeName = 'insert';

                break;

            case 'remove_tags_to_a_subscriber':
                $recordApiResponse = $this->removeTagToSubscriber($convertKit->email, $tags);
                $type = 'Remove tags from subscriber';
                $typeName = 'insert';

                break;
        }

        if (isset($existSubscriber->error)) {
            LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => 'insert'], 'error', $existSubscriber->error);
        } elseif ($recordApiResponse && isset($recordApiResponse->error)) {
            LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $typeName], 'error', $recordApiResponse->error);
        } else {
            LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $typeName], 'success', $recordApiResponse);
        }

        return $recordApiResponse;
    }

    private function setFieldMapping($fieldMap, $fieldValues)
    {
        $fieldData = [];
        $customFields = [];

        foreach ($fieldMap as $fieldKey => $fieldPair) {
            if (!empty($fieldPair->convertKitField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue) && !is_numeric($fieldPair->convertKitField)) {
                    $fieldData[$fieldPair->convertKitField] = Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues);
                } elseif (is_numeric($fieldPair->convertKitField) && $fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $customFields[] = ['field' => (int) $fieldPair->convertKitField, 'value' => Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues)];
                } elseif (is_numeric($fieldPair->convertKitField)) {
                    $customFields[] = ['field' => (int) $fieldPair->convertKitField, 'value' => $fieldValues[$fieldPair->formField]];
                } else {
                    $fieldData[$fieldPair->convertKitField] = $fieldValues[$fieldPair->formField];
                }
            }
        }

        if (!empty($customFields)) {
            $fieldData['fieldValues'] = $customFields;
        }

        return $fieldData;
    }

    private function httpBuildQuery($data)
    {
        $query = [
            'api_secret' => $this->_defaultHeader,
            'email'      => $data->email,
            'first_name' => $data->firstName,
        ];

        foreach ($data as $key => $value) {
            $key = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $key));
            $array_keys = array_keys($query);
            if (!(\in_array($key, $array_keys))) {
                $query['fields'][$key] = $value;
            }
        }

        return http_build_query($query);
    }

    private function existSubscriber($email, $page = 1)
    {
        $queries = http_build_query([
            'api_secret'    => $this->_defaultHeader,
            'email_address' => $email,
            'page'          => 1,
            'status'        => 'all',
        ]);

        $response = HttpHelper::get("{$this->_apiEndpoint}/subscribers?{$queries}", null);

        if (is_wp_error($response) || empty($response->subscribers)) {
            return false;
        }

        return \is_array($response->subscribers) && \count($response->subscribers) > 0 ? $response->subscribers[0] : $response->subscribers;
    }
}
