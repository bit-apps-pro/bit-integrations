<?php

namespace BitApps\Integrations\Actions\HighLevel;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class HighLevelAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'gohighlevel',
        'fields'   => [
            'api_key'     => 'token',
            'version'     => 'version',
            'location_id' => 'location_id',
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map;
        $actions = (array) $integrationDetails->actions;

        $apiKey = HighLevelHelper::getApiKey($integrationDetails);
        $version = HighLevelHelper::getVersion($integrationDetails);
        $locationId = HighLevelHelper::getLocationIdIfV2($integrationDetails, $version);
        $selectedTask = HighLevelHelper::getStringParam($integrationDetails, 'selectedTask');

        if (empty($apiKey) || empty($fieldMap)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', \sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'HighLevel'));
        }

        if ($version === 'v2' && $locationId === '') {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', \sprintf(__('module, location_id is required for %s v2 api', 'bit-integrations'), 'HighLevel'));
        }

        $optionKeys = [
            'selectedTags'        => 'selectedTags',
            'selectedContact'     => 'selectedContact',
            'selectedTaskStatus'  => 'selectedTaskStatus',
            'selectedUser'        => 'selectedUser',
            'updateTaskId'        => 'updateTaskId',
            'selectedPipeline'    => 'selectedPipeline',
            'selectedStage'       => 'selectedStage',
            'selectedOpportunity' => 'selectedOpportunity',
        ];

        $selectedOptions = array_map(
            function ($key) use ($integrationDetails) {
                return HighLevelHelper::getStringParam($integrationDetails, $key);
            },
            $optionKeys
        );

        $recordApiHelper = new HighLevelService($apiKey, $this->_integrationID, $version, $locationId);
        $highLevelApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedTask, $selectedOptions, $actions);

        if (is_wp_error($highLevelApiResponse)) {
            return $highLevelApiResponse;
        }

        return $highLevelApiResponse;
    }
}
