<?php

namespace BitApps\Integrations\Actions\Eventbrite;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private const SETTING_KEYS = [
        'organization_id',
        'event_id',
        'venue_id',
        'category_id',
        'subcategory_id',
        'format_id',
        'timezone',
        'currency',
        'ticket_type',
        'ticket_class_ids',
        'ticket_group_id',
        'ticket_group_ids',
        'question_type',
        'canned_type',
        'is_required',
        'discount_type',
        'frequency',
        'text_code',
        'image_type',
    ];

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
        $mainAction = $this->_integrationDetails->mainAction ?? '';
        $settings = $this->settings();
        $default = [
            'success' => false,
            // translators: %s is the plugin name.
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
            'code'    => 400,
        ];

        switch ($mainAction) {
            case 'create_event':
                $response = Hooks::apply(Config::withPrefix('eventbrite_create_event'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_event':
                $response = Hooks::apply(Config::withPrefix('eventbrite_update_event'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'copy_event':
                $response = Hooks::apply(Config::withPrefix('eventbrite_copy_event'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'publish_event':
                $response = Hooks::apply(Config::withPrefix('eventbrite_publish_event'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'unpublish_event':
                $response = Hooks::apply(Config::withPrefix('eventbrite_unpublish_event'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'cancel_event':
                $response = Hooks::apply(Config::withPrefix('eventbrite_cancel_event'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_event':
                $response = Hooks::apply(Config::withPrefix('eventbrite_delete_event'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_event_schedule':
                $response = Hooks::apply(Config::withPrefix('eventbrite_create_event_schedule'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_display_settings':
                $response = Hooks::apply(Config::withPrefix('eventbrite_update_display_settings'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_capacity_tier':
                $response = Hooks::apply(Config::withPrefix('eventbrite_update_capacity_tier'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_ticket_buyer_settings':
                $response = Hooks::apply(Config::withPrefix('eventbrite_update_ticket_buyer_settings'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'set_event_description':
                $response = Hooks::apply(Config::withPrefix('eventbrite_set_event_description'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_ticket_class':
                $response = Hooks::apply(Config::withPrefix('eventbrite_create_ticket_class'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_ticket_class':
                $response = Hooks::apply(Config::withPrefix('eventbrite_update_ticket_class'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_ticket_group':
                $response = Hooks::apply(Config::withPrefix('eventbrite_create_ticket_group'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_ticket_group':
                $response = Hooks::apply(Config::withPrefix('eventbrite_update_ticket_group'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'set_ticket_class_ticket_groups':
                $response = Hooks::apply(Config::withPrefix('eventbrite_set_ticket_class_ticket_groups'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_ticket_group':
                $response = Hooks::apply(Config::withPrefix('eventbrite_delete_ticket_group'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_inventory_tier':
                $response = Hooks::apply(Config::withPrefix('eventbrite_create_inventory_tier'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_inventory_tier':
                $response = Hooks::apply(Config::withPrefix('eventbrite_update_inventory_tier'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_inventory_tier':
                $response = Hooks::apply(Config::withPrefix('eventbrite_delete_inventory_tier'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_custom_question':
                $response = Hooks::apply(Config::withPrefix('eventbrite_create_custom_question'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_custom_question':
                $response = Hooks::apply(Config::withPrefix('eventbrite_delete_custom_question'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_default_question':
                $response = Hooks::apply(Config::withPrefix('eventbrite_create_default_question'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_default_question':
                $response = Hooks::apply(Config::withPrefix('eventbrite_update_default_question'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_default_question':
                $response = Hooks::apply(Config::withPrefix('eventbrite_delete_default_question'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_discount':
                $response = Hooks::apply(Config::withPrefix('eventbrite_create_discount'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_discount':
                $response = Hooks::apply(Config::withPrefix('eventbrite_update_discount'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_discount':
                $response = Hooks::apply(Config::withPrefix('eventbrite_delete_discount'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_venue':
                $response = Hooks::apply(Config::withPrefix('eventbrite_create_venue'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_venue':
                $response = Hooks::apply(Config::withPrefix('eventbrite_update_venue'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_text_override':
                $response = Hooks::apply(Config::withPrefix('eventbrite_create_text_override'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_seat_map':
                $response = Hooks::apply(Config::withPrefix('eventbrite_create_seat_map'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'upload_image':
                $response = Hooks::apply(Config::withPrefix('eventbrite_upload_image'), $default, $fieldData, $this->apiClient, $settings);

                break;

            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations'), 'code' => 400];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'Eventbrite', 'type_name' => $mainAction], $responseType, wp_json_encode($response));

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $data = [];

        foreach ($fieldMap as $map) {
            $triggerField = $map->formField ?? '';
            $eventbriteField = $map->eventbriteField ?? '';

            if (empty($eventbriteField)) {
                continue;
            }

            if ($triggerField === 'custom') {
                $data[$eventbriteField] = Common::replaceFieldWithValue($map->customValue ?? '', $fieldValues);
            } elseif (isset($fieldValues[$triggerField])) {
                $data[$eventbriteField] = $fieldValues[$triggerField];
            }
        }

        return $data;
    }

    private function settings()
    {
        $details = $this->_integrationDetails;
        $settings = [];

        foreach (self::SETTING_KEYS as $key) {
            if (isset($details->{$key}) && $details->{$key} !== '' && $details->{$key} !== []) {
                $settings[$key] = $details->{$key};
            }
        }

        foreach ((array) ($details->utilities ?? []) as $key => $value) {
            if ($value !== '' && $value !== null && $value !== []) {
                $settings[preg_replace('/^selected_/', '', (string) $key)] = $value;
            }
        }

        return $settings;
    }
}
