<?php

/**
 * SEOPress Record Api
 */

namespace BitApps\Integrations\Actions\SeoPress;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap)
    {
        if (!\defined('SEOPRESS_VERSION')) {
            return [
                'success' => false,
                'message' => __('SEOPress is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::setFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'update_post_meta';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations')
        ];

        switch ($mainAction) {
            case 'update_post_meta':
                $response = Hooks::apply(Config::withPrefix('seopress_update_post_meta'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_seopress_update_post_meta` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_seopress_update_post_meta', $response, $fieldData);

                $actionType = 'update_post_meta';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $actionType = 'unknown';

                break;
        }

        $responseType = $response['success'] ? 'success' : 'error';

        LogHandler::save($this->_integrationID, ['type' => 'SEOPress', 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    /**
     * Prepare field data from field map
     *
     * @param array $fieldMap    Field mapping
     * @param array $fieldValues Field values
     *
     * @return array
     */
    private static function setFieldMap($fieldMap, $fieldValues)
    {
        $fieldData = [];

        foreach ($fieldMap as $fieldPair) {
            if (!isset($fieldPair->seoPressField) || \is_null($fieldPair->seoPressField) || $fieldPair->seoPressField === '') {
                continue;
            }

            $fieldData[$fieldPair->seoPressField] = ($fieldPair->formField == 'custom' && isset($fieldPair->customValue))
                ? Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues)
                : $fieldValues[$fieldPair->formField];
        }

        return $fieldData;
    }
}
