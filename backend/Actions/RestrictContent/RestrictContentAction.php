<?php

namespace BitApps\Integrations\Actions\RestrictContent;

use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class RestrictContentAction
{
    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap)
        ) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('field map are required for restrict content', 'bit-integrations'));
            LogHandler::save($this->_integrationID, 'record', 'validation', $error);

            return $error;
        }

        $recordApiHelper = new RestrictContentService($this->_integrationID, $actionName, $integrationDetails);

        $restrictApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $integrationDetails
        );

        if (is_wp_error($restrictApiResponse)) {
            return $restrictApiResponse;
        }

        return $restrictApiResponse;
    }
}
