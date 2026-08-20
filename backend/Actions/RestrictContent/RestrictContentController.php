<?php

/**
 * Restrict Content Integration
 */

namespace BitApps\Integrations\Actions\RestrictContent;

use BitApps\Integrations\Log\LogHandler;
use WP_Error;

/**
 * Provide functionality for RestricContent integration
 */
class RestrictContentController
{
    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public static function pluginActive($option = null)
    {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';
        if (is_plugin_active('restrict-content-pro/restrict-content-pro.php')) {
            return $option === 'get_name' ? 'restrict-content-pro/restrictcontent-pro.php' : true;
        } elseif (is_plugin_active('restrict-content/restrictcontent.php')) {
            return $option === 'get_name' ? 'restrict-content/restrictcontent.php' : true;
        }

        return false;
    }

    public static function getAllLevels()
    {
        $levels = rcp_get_membership_levels(['number' => 999]);
        $data = [];
        if (!empty($levels)) {
            foreach ($levels as $level) {
                $data[] = (object) [
                    'id'   => $level->get_id(),
                    'name' => $level->get_name()
                ];
            }
            $response['levellists'] = $data;
        }
        wp_send_json_success($response, 200);
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

        $recordApiHelper = new RecordApiHelper($this->_integrationID, $actionName, $integrationDetails);

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
