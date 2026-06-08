<?php

/**
 * Zendesk Support Record Api
 */

namespace BitApps\Integrations\Actions\ZendeskSupport;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Zendesk Support record actions.
 *
 * Free side never calls the Zendesk API. It only builds the mapped field
 * data and fires a hook that the Pro plugin handles.
 */
class RecordApiHelper
{
    /**
     * Maps each action slug to its dedicated hook name. Each event uses a
     * separate hook so the Pro side can register one handler per action.
     */
    private static $hookMap = [
        'createTicket'         => 'zendesk_support_create_ticket',
        'updateTicket'         => 'zendesk_support_update_ticket',
        'deleteTicket'         => 'zendesk_support_delete_ticket',
        'addTicketComment'     => 'zendesk_support_add_ticket_comment',
        'addTagsToTicket'      => 'zendesk_support_add_tags_to_ticket',
        'removeTagsFromTicket' => 'zendesk_support_remove_tags_from_ticket',
        'createUser'           => 'zendesk_support_create_user',
        'updateUser'           => 'zendesk_support_update_user',
        'createOrUpdateUser'   => 'zendesk_support_create_or_update_user',
        'deleteUser'           => 'zendesk_support_delete_user',
        'suspendUser'          => 'zendesk_support_suspend_user',
        'createOrganization'   => 'zendesk_support_create_organization',
        'updateOrganization'   => 'zendesk_support_update_organization',
        'deleteOrganization'   => 'zendesk_support_delete_organization',
        'createGroup'          => 'zendesk_support_create_group',
        'updateGroup'          => 'zendesk_support_update_group',
        'deleteGroup'          => 'zendesk_support_delete_group',
    ];

    private $_integrationDetails;

    private $_integrationID;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            if (empty($value->zendeskSupportField)) {
                continue;
            }

            $triggerValue = $value->formField;
            $actionValue = $value->zendeskSupportField;

            if ($triggerValue === 'custom' && isset($value->customValue)) {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $fieldValues);
            } elseif (isset($fieldValues[$triggerValue])) {
                $dataFinal[$actionValue] = $fieldValues[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        if (!isset(self::$hookMap[$actionName])) {
            return ['success' => false, 'message' => __('Zendesk Support action not found.', 'bit-integrations'), 'code' => 400];
        }

        $fieldData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $utilities = (array) ($this->_integrationDetails->utilities ?? []);
        $default = ['success' => false, 'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')];

        $response = Hooks::apply(
            Config::withPrefix(self::$hookMap[$actionName]),
            $default,
            $fieldData,
            $utilities,
            $this->_integrationDetails,
        );

        if (is_wp_error($response)) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'ZendeskSupport', 'type_name' => $actionName]), 'error', $response->get_error_message());
        } elseif (\is_array($response) && empty($response['success'])) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'ZendeskSupport', 'type_name' => $actionName]), 'error', wp_json_encode($response));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'ZendeskSupport', 'type_name' => $actionName]), 'success', wp_json_encode($response));
        }

        return $response;
    }
}
