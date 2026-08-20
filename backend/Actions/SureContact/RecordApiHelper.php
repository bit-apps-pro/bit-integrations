<?php

/**
 * SureContact Record Api.
 */

namespace BitApps\Integrations\Actions\SureContact;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Every SureContact action is Pro — this class only builds the payload and fires the
 * matching hook. All API traffic happens in Bit Integrations Pro.
 */
class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    private $apiClient;

    public function __construct($integrationDetails, $integId, ApiClient $apiClient)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->apiClient = $apiClient;
    }

    public function execute($fieldValues, $fieldMap)
    {
        $fieldData = static::generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_contact';
        $settings = $this->settings();
        $default = [
            'success' => false,
            // translators: %s is the plugin name.
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
            'code'    => 400,
        ];

        switch ($mainAction) {
            case 'add_contacts_to_list':
                $response = Hooks::apply(Config::withPrefix('sure_contact_add_contacts_to_list'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'add_contacts_to_tag':
                $response = Hooks::apply(Config::withPrefix('sure_contact_add_contacts_to_tag'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'attach_contacts_to_task':
                $response = Hooks::apply(Config::withPrefix('sure_contact_attach_contacts_to_task'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'attach_lists_to_contact':
                $response = Hooks::apply(Config::withPrefix('sure_contact_attach_lists_to_contact'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'attach_tags_to_contact':
                $response = Hooks::apply(Config::withPrefix('sure_contact_attach_tags_to_contact'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'bulk_delete_campaigns':
                $response = Hooks::apply(Config::withPrefix('sure_contact_bulk_delete_campaigns'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'cancel_purchase':
                $response = Hooks::apply(Config::withPrefix('sure_contact_cancel_purchase'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'copy_list':
                $response = Hooks::apply(Config::withPrefix('sure_contact_copy_list'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_campaign':
                $response = Hooks::apply(Config::withPrefix('sure_contact_create_campaign'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_contact':
                $response = Hooks::apply(Config::withPrefix('sure_contact_create_contact'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_contact_activity':
                $response = Hooks::apply(Config::withPrefix('sure_contact_create_contact_activity'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_contact_note':
                $response = Hooks::apply(Config::withPrefix('sure_contact_create_contact_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_list':
                $response = Hooks::apply(Config::withPrefix('sure_contact_create_list'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_page':
                $response = Hooks::apply(Config::withPrefix('sure_contact_create_page'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_purchase':
                $response = Hooks::apply(Config::withPrefix('sure_contact_create_purchase'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_tag':
                $response = Hooks::apply(Config::withPrefix('sure_contact_create_tag'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_task':
                $response = Hooks::apply(Config::withPrefix('sure_contact_create_task'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_campaign':
                $response = Hooks::apply(Config::withPrefix('sure_contact_delete_campaign'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_contact':
                $response = Hooks::apply(Config::withPrefix('sure_contact_delete_contact'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_list':
                $response = Hooks::apply(Config::withPrefix('sure_contact_delete_list'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_note':
                $response = Hooks::apply(Config::withPrefix('sure_contact_delete_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_page':
                $response = Hooks::apply(Config::withPrefix('sure_contact_delete_page'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_tag':
                $response = Hooks::apply(Config::withPrefix('sure_contact_delete_tag'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_task':
                $response = Hooks::apply(Config::withPrefix('sure_contact_delete_task'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'detach_contacts_from_task':
                $response = Hooks::apply(Config::withPrefix('sure_contact_detach_contacts_from_task'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'detach_lists_from_contact':
                $response = Hooks::apply(Config::withPrefix('sure_contact_detach_lists_from_contact'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'detach_tags_from_contact':
                $response = Hooks::apply(Config::withPrefix('sure_contact_detach_tags_from_contact'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'duplicate_campaign':
                $response = Hooks::apply(Config::withPrefix('sure_contact_duplicate_campaign'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'mark_task_done':
                $response = Hooks::apply(Config::withPrefix('sure_contact_mark_task_done'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'mark_task_undone':
                $response = Hooks::apply(Config::withPrefix('sure_contact_mark_task_undone'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'refund_purchase':
                $response = Hooks::apply(Config::withPrefix('sure_contact_refund_purchase'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'remove_contacts_from_list':
                $response = Hooks::apply(Config::withPrefix('sure_contact_remove_contacts_from_list'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'remove_contacts_from_tag':
                $response = Hooks::apply(Config::withPrefix('sure_contact_remove_contacts_from_tag'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_campaign':
                $response = Hooks::apply(Config::withPrefix('sure_contact_update_campaign'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_contact':
                $response = Hooks::apply(Config::withPrefix('sure_contact_update_contact'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_contact_status':
                $response = Hooks::apply(Config::withPrefix('sure_contact_update_contact_status'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_list':
                $response = Hooks::apply(Config::withPrefix('sure_contact_update_list'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_note':
                $response = Hooks::apply(Config::withPrefix('sure_contact_update_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_page':
                $response = Hooks::apply(Config::withPrefix('sure_contact_update_page'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_tag':
                $response = Hooks::apply(Config::withPrefix('sure_contact_update_tag'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_task':
                $response = Hooks::apply(Config::withPrefix('sure_contact_update_task'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'upsert_contact':
                $response = Hooks::apply(Config::withPrefix('sure_contact_upsert_contact'), $default, $fieldData, $this->apiClient, $settings);

                break;

            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations'), 'code' => 400];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'SureContact', 'type_name' => $mainAction], $responseType, wp_json_encode($response));

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $data = [];

        foreach ($fieldMap as $map) {
            $triggerField = $map->formField;
            $sureContactField = $map->sureContactField;

            if (empty($sureContactField)) {
                continue;
            }

            if ($triggerField === 'custom') {
                $data[$sureContactField] = Common::replaceFieldWithValue($map->customValue, $fieldValues);
            } elseif (isset($fieldValues[$triggerField])) {
                $data[$sureContactField] = $fieldValues[$triggerField];
            }
        }

        return $data;
    }

    /**
     * Everything the node saved that is not a mapped field: the dropdown selections and
     * the Utilities toggles, flattened into one array. Utilities keys are prefixed
     * `selected_`, so they cannot collide with a dropdown key.
     *
     * @return array<string, mixed>
     */
    private function settings()
    {
        $details = $this->_integrationDetails;

        return array_merge(
            (array) ($details->utilities ?? []),
            [
                'list_uuids'     => $details->list_uuids ?? [],
                'tag_uuids'      => $details->tag_uuids ?? [],
                'contact_status' => $details->contact_status ?? '',
                'activity_type'  => $details->activity_type ?? '',
            ]
        );
    }
}
