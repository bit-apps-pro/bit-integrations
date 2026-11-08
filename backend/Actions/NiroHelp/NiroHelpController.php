<?php

namespace BitApps\Integrations\Actions\NiroHelp;

use WP_Error;

class NiroHelpController
{
    public static function isExists()
    {
        if (!\defined('NIROHELP_VERSION')) {
            wp_send_json_error(__('NiroHelp is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public static function niroHelpAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function refreshProducts()
    {
        self::isExists();

        wp_send_json_success(['products' => self::termOptions('nirohelp_product')], 200);
    }

    public function refreshReasons()
    {
        self::isExists();

        wp_send_json_success(['reasons' => self::termOptions('nirohelp_reason')], 200);
    }

    public function refreshTopics()
    {
        self::isExists();

        wp_send_json_success(['topics' => self::termOptions('nirohelp_topic')], 200);
    }

    public function refreshAgents()
    {
        self::isExists();

        $agents = [];

        if (class_exists('\NiroHelp\Models\Agent')) {
            foreach (\NiroHelp\Models\Agent::holders() as $agent) {
                $agents[] = (object) ['value' => (string) $agent['id'], 'label' => $agent['name']];
            }
        }

        wp_send_json_success(['agents' => $agents], 200);
    }

    public function refreshUsers()
    {
        self::isExists();

        $users = array_map(
            function ($user) {
                return (object) [
                    'value' => (string) $user->ID,
                    'label' => $user->display_name . ' (' . $user->user_email . ')',
                ];
            },
            get_users(
                [
                    'orderby'      => 'display_name',
                    'fields'       => ['ID', 'display_name', 'user_email'],
                    'role__not_in' => ['nirohelp_user'],
                ]
            )
        );

        wp_send_json_success(['users' => $users], 200);
    }

    public function refreshCustomFields()
    {
        self::isExists();

        $customFields = [];

        foreach ((array) nirohelp_ticket_form_fields() as $field) {
            $key = \is_array($field) ? (string) ($field['key'] ?? '') : '';

            if (strpos($key, 'cf_') === 0 && !empty($field['enabled'])) {
                $customFields[] = (object) ['key' => $key, 'label' => (string) ($field['label'] ?? $key), 'required' => false];
            }
        }

        wp_send_json_success(['customFields' => $customFields], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }

    private static function termOptions($taxonomy)
    {
        $terms = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => false]);

        if (is_wp_error($terms)) {
            return [];
        }

        return array_map(
            function ($term) {
                return (object) ['value' => (string) $term->term_id, 'label' => $term->name];
            },
            $terms
        );
    }
}
