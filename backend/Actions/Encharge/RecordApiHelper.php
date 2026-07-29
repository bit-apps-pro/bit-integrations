<?php

/**
 * Encharge Record Api
 */

namespace BitApps\Integrations\Actions\Encharge;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert
 */
class RecordApiHelper
{
    private $_defaultHeader;

    private $_integrationID;

    private $_endpoint;

    public function __construct($api_key, $integId)
    {
        $this->_endpoint = 'https://api.encharge.io/v1/people';
        $this->_defaultHeader['Content-Type'] = 'application/json';
        $this->_defaultHeader['X-Encharge-Token'] = $api_key;
        $this->_integrationID = $integId;
    }

    /**
     * serd data to api
     *
     * @param mixed $data
     *
     * @return json response
     */
    public function insertRecord($data)
    {
        return HttpHelper::post($this->_endpoint, $data, $this->_defaultHeader);
    }

    public function execute($fieldValues, $fieldMap, $tags)
    {
        $fieldData = [];

        foreach ($fieldMap as $fieldKey => $fieldPair) {
            if (!empty($fieldPair->enChargeFields)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldData[$fieldPair->enChargeFields] = Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues);
                } elseif (!\is_null($fieldValues[$fieldPair->formField])) {
                    $fieldData[$fieldPair->enChargeFields] = $fieldValues[$fieldPair->formField];
                }
            }
        }
        if ($tags !== null) {
            $fieldData['tags'] = $this->combineTagsWithExisting($tags, $fieldData['email']);
        }
        $recordApiResponse = $this->insertRecord(wp_json_encode($fieldData));
        $type = 'insert';

        if ($recordApiResponse && isset($recordApiResponse->user)) {
            $recordApiResponse = [
                'status' => 'success',
                'email'  => $recordApiResponse->user->email
            ];
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'success', $recordApiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'error', $recordApiResponse);
        }

        return $recordApiResponse;
    }

    private function combineTagsWithExisting($tags, $email)
    {
        $endpoint = $this->_endpoint . '?people[0][email]=' . rawurlencode($email);

        $response = HttpHelper::get($endpoint, null, $this->_defaultHeader);

        if (is_wp_error($response) || empty($response->users[0]->tags ?? '')) {
            return $tags;
        }

        $existingTags = array_filter(array_map('trim', explode(',', $response->users[0]->tags)));
        $newTags = array_filter(array_map('trim', explode(',', $tags)));

        $userTags = array_unique(array_merge($existingTags, $newTags));

        return implode(',', $userTags);
    }
}
