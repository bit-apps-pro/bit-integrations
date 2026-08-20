<?php

/**
 * FluentPlayer Record Api
 */

namespace BitApps\Integrations\Actions\FluentPlayer;

use BitApps\Integrations\Config;
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

    /**
     * Execute the integration.
     *
     * Each action is handed only the arguments it actually consumes: the mapped
     * field data always, the Utilities selections when it has any, and the
     * integration config when it renders record/option dropdowns.
     *
     * @param array $fieldValues Field values from form
     * @param array $fieldMap    Field mapping
     * @param array $utilities   Optional option selects
     *
     * @return array
     */
    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!\defined('FLUENT_PLAYER')) {
            return [
                'success' => false,
                'message' => __('FluentPlayer is not installed or activated', 'bit-integrations'),
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_media';
        $integrationDetails = $this->_integrationDetails;

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'create_media':
                $response = Hooks::apply(Config::withPrefix('fluent_player_create_media'), $defaultResponse, $fieldData, $utilities, $integrationDetails);

                break;

            case 'update_media':
                $response = Hooks::apply(Config::withPrefix('fluent_player_update_media'), $defaultResponse, $fieldData, $utilities, $integrationDetails);

                break;

            case 'trash_media':
                $response = Hooks::apply(Config::withPrefix('fluent_player_trash_media'), $defaultResponse, $fieldData);

                break;

            case 'restore_media':
                $response = Hooks::apply(Config::withPrefix('fluent_player_restore_media'), $defaultResponse, $fieldData);

                break;

            case 'delete_media':
                $response = Hooks::apply(Config::withPrefix('fluent_player_delete_media'), $defaultResponse, $fieldData);

                break;

            case 'change_media_status':
                $response = Hooks::apply(Config::withPrefix('fluent_player_change_media_status'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'create_tag':
                $response = Hooks::apply(Config::withPrefix('fluent_player_create_tag'), $defaultResponse, $fieldData);

                break;

            case 'rename_tag':
                $response = Hooks::apply(Config::withPrefix('fluent_player_rename_tag'), $defaultResponse, $fieldData);

                break;

            case 'delete_tag':
                $response = Hooks::apply(Config::withPrefix('fluent_player_delete_tag'), $defaultResponse, $fieldData);

                break;

            case 'set_media_tags':
                $response = Hooks::apply(Config::withPrefix('fluent_player_set_media_tags'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'add_media_tags':
                $response = Hooks::apply(Config::withPrefix('fluent_player_add_media_tags'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'remove_media_tags':
                $response = Hooks::apply(Config::withPrefix('fluent_player_remove_media_tags'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'create_playlist':
                $response = Hooks::apply(Config::withPrefix('fluent_player_create_playlist'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'update_playlist':
                $response = Hooks::apply(Config::withPrefix('fluent_player_update_playlist'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'trash_playlist':
                $response = Hooks::apply(Config::withPrefix('fluent_player_trash_playlist'), $defaultResponse, $fieldData);

                break;

            case 'restore_playlist':
                $response = Hooks::apply(Config::withPrefix('fluent_player_restore_playlist'), $defaultResponse, $fieldData);

                break;

            case 'delete_playlist':
                $response = Hooks::apply(Config::withPrefix('fluent_player_delete_playlist'), $defaultResponse, $fieldData);

                break;

            case 'change_playlist_status':
                $response = Hooks::apply(Config::withPrefix('fluent_player_change_playlist_status'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'add_media_to_playlist':
                $response = Hooks::apply(Config::withPrefix('fluent_player_add_media_to_playlist'), $defaultResponse, $fieldData);

                break;

            case 'remove_media_from_playlist':
                $response = Hooks::apply(Config::withPrefix('fluent_player_remove_media_from_playlist'), $defaultResponse, $fieldData);

                break;

            case 'create_email_submission':
                $response = Hooks::apply(Config::withPrefix('fluent_player_create_email_submission'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'subscribe_email_to_providers':
                $response = Hooks::apply(Config::withPrefix('fluent_player_subscribe_email_to_providers'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'record_watch_progression':
                $response = Hooks::apply(Config::withPrefix('fluent_player_record_watch_progression'), $defaultResponse, $fieldData, $utilities);

                break;

            case 'record_visit':
                $response = Hooks::apply(Config::withPrefix('fluent_player_record_visit'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'save_preset':
                $response = Hooks::apply(Config::withPrefix('fluent_player_save_preset'), $defaultResponse, $fieldData);

                break;

            case 'delete_preset':
                $response = Hooks::apply(Config::withPrefix('fluent_player_delete_preset'), $defaultResponse, $integrationDetails);

                break;

            default:
                $response = $defaultResponse;

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'FluentPlayer', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $data = [];

        foreach ($fieldMap as $map) {
            if (!empty($map->formField) && !empty($map->fluentPlayerField)) {
                if ($map->formField === 'custom') {
                    $data[$map->fluentPlayerField] = $map->customValue ?? '';
                } else {
                    $data[$map->fluentPlayerField] = $fieldValues[$map->formField] ?? '';
                }
            }
        }

        return $data;
    }
}
