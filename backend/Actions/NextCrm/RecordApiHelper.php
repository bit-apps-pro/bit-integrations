<?php

/**
 * NextCrm Record Api
 */

namespace BitApps\Integrations\Actions\NextCrm;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert, update
 */
class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    /**
     * Execute the integration
     *
     * @param array $fieldValues Field values from trigger
     * @param array $fieldMap    Field mapping
     * @param array $utilities   Optional actions to perform
     *
     * @return array
     */
    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!\defined('NEXTCRM_VERSION')) {
            return [
                'success' => false,
                'message' => __('NextCRM is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_contact';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_contact':
                $response = Hooks::apply(Config::withPrefix('next_crm_create_contact'), $defaultResponse, $fieldData, $utilities);
                $type = 'contact';

                break;

            case 'update_contact':
                $response = Hooks::apply(Config::withPrefix('next_crm_update_contact'), $defaultResponse, $fieldData, $utilities);
                $type = 'contact';

                break;

            case 'create_or_update_contact':
                $response = Hooks::apply(Config::withPrefix('next_crm_create_or_update_contact'), $defaultResponse, $fieldData, $utilities);
                $type = 'contact';

                break;

            case 'delete_contact':
                $response = Hooks::apply(Config::withPrefix('next_crm_delete_contact'), $defaultResponse, $fieldData);
                $type = 'contact';

                break;

            case 'change_contact_status':
                $response = Hooks::apply(Config::withPrefix('next_crm_change_contact_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'contact';

                break;

            case 'update_contact_field':
                $response = Hooks::apply(Config::withPrefix('next_crm_update_contact_field'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'contact';

                break;

            case 'set_contact_meta':
                $response = Hooks::apply(Config::withPrefix('next_crm_set_contact_meta'), $defaultResponse, $fieldData);
                $type = 'contact';

                break;

            case 'delete_contact_meta':
                $response = Hooks::apply(Config::withPrefix('next_crm_delete_contact_meta'), $defaultResponse, $fieldData);
                $type = 'contact';

                break;

            case 'add_contact_activity':
                $response = Hooks::apply(Config::withPrefix('next_crm_add_contact_activity'), $defaultResponse, $fieldData, $utilities);
                $type = 'activity';

                break;

            case 'create_tag':
                $response = Hooks::apply(Config::withPrefix('next_crm_create_tag'), $defaultResponse, $fieldData);
                $type = 'tag';

                break;

            case 'add_tag_to_contact':
                $response = Hooks::apply(Config::withPrefix('next_crm_add_tag_to_contact'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'tag';

                break;

            case 'remove_tag_from_contact':
                $response = Hooks::apply(Config::withPrefix('next_crm_remove_tag_from_contact'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'tag';

                break;

            case 'create_list':
                $response = Hooks::apply(Config::withPrefix('next_crm_create_list'), $defaultResponse, $fieldData);
                $type = 'list';

                break;

            case 'add_contact_to_list':
                $response = Hooks::apply(Config::withPrefix('next_crm_add_contact_to_list'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'list';

                break;

            case 'remove_contact_from_list':
                $response = Hooks::apply(Config::withPrefix('next_crm_remove_contact_from_list'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'list';

                break;

            case 'send_campaign_email':
                $response = Hooks::apply(Config::withPrefix('next_crm_send_campaign_email'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'campaign';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'NextCrm';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->nextCrmField;

            if (empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
