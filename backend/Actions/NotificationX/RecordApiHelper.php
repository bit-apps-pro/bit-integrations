<?php

/**
 * NotificationX Record Api
 */

namespace BitApps\Integrations\Actions\NotificationX;

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
        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $fieldData = static::generateDataFromMap($fieldMap, $fieldValues, 'notificationXField');

        $defaultResponse = [
            'success' => false,
            // translators: %s is the plugin name "Bit Integrations Pro"
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        if (\in_array($mainAction, ['add_sales_notification', 'add_reviews', 'add_email_subscription'])) {
            $payload = [
                'notification_id' => absint($this->_integrationDetails->selected_notification_id ?? 0),
                'entry_data'      => $fieldData,
            ];
        } elseif ($mainAction === 'add_notification_entry') {
            $entryMap = isset($this->_integrationDetails->entry_map)
                ? $this->_integrationDetails->entry_map
                : [];
            $entryData = static::generateDataFromMap($entryMap, $fieldValues, 'entryKey', true);
            $payload = [
                'notification_id' => absint($fieldData['notification_id'] ?? 0),
                'entry_data'      => $entryData,
            ];
        }

        switch ($mainAction) {
            case 'add_sales_notification':
                $response = Hooks::apply(Config::withPrefix('notificationx_add_sales_notification'), $defaultResponse, $payload);
                $actionType = 'add_sales_notification';

                break;

            case 'add_reviews':
                $response = Hooks::apply(Config::withPrefix('notificationx_add_reviews'), $defaultResponse, $payload);
                $actionType = 'add_reviews';

                break;

            case 'add_email_subscription':
                $response = Hooks::apply(Config::withPrefix('notificationx_add_email_subscription'), $defaultResponse, $payload);
                $actionType = 'add_email_subscription';

                break;

            case 'delete_notification':
                $response = Hooks::apply(Config::withPrefix('notificationx_delete_notification'), $defaultResponse, $fieldData['notification_id'] ?? '');
                $actionType = 'delete_notification';

                break;

            case 'enable_notification':
                $response = Hooks::apply(Config::withPrefix('notificationx_enable_notification'), $defaultResponse, $fieldData['notification_id'] ?? '');
                $actionType = 'enable_notification';

                break;

            case 'disable_notification':
                $response = Hooks::apply(Config::withPrefix('notificationx_disable_notification'), $defaultResponse, $fieldData['notification_id'] ?? '');
                $actionType = 'disable_notification';

                break;

            case 'add_notification_entry':
                $response = Hooks::apply(Config::withPrefix('notificationx_add_notification_entry'), $defaultResponse, $payload);
                $actionType = 'add_notification_entry';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations'),
                ];
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'Notification', 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private static function generateDataFromMap($map, $fieldValues, $targetKey, $skipEmptyTargetKey = false)
    {
        $data = [];
        foreach ($map as $item) {
            $triggerValue = $item->formField ?? '';
            $targetValue = $item->{$targetKey} ?? '';

            if ($skipEmptyTargetKey && empty($targetValue)) {
                continue;
            }

            $data[$targetValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $data;
    }
}
