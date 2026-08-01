<?php

namespace BitApps\Integrations\Actions\MailMint;

use BitApps\Integrations\Config;
use Mint\MRM\Constants;
use Mint\MRM\DataBase\Models\ContactGroupModel;
use Mint\MRM\DataBase\Tables\CustomFieldSchema;
use WP_Error;

class MailMintController
{
    public static function pluginActive()
    {
        return (bool) (class_exists('MailMint'))

        ;
    }

    public static function allCustomFields()
    {
        if (class_exists('Mint\MRM\DataBase\Models\ContactGroupModel')) {
            global $wpdb;
            $allFields = [];
            $fields_table = esc_sql($wpdb->prefix . CustomFieldSchema::$table_name);
            $primaryFields = get_option('mint_contact_primary_fields', Constants::$primary_contact_fields);
            $cache_key = Config::withPrefix('mailmint_custom_fields');
            $cache_group = Config::VAR_PREFIX;
            $customFields = wp_cache_get($cache_key, $cache_group);

            if (false === $customFields) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.PreparedSQL.NotPrepared -- Querying MailMint custom field table directly; static table name from plugin schema.
                $customFields = $wpdb->get_results('SELECT title, slug, type, group_id FROM `' . $fields_table . '`', ARRAY_A);
                wp_cache_set($cache_key, $customFields, $cache_group, 10 * MINUTE_IN_SECONDS);
            }

            if (!empty($customFields)) {
                $primaryFields['other'] = array_merge($primaryFields['other'], $customFields);
            }

            foreach ($primaryFields as $moduleKey => $module) {
                foreach ($module as $field) {
                    $allFields[] = (object) [
                        'key'      => $moduleKey !== 'other' ? $field['slug'] : 'custom_meta_field_' . $field['slug'],
                        'label'    => $field['title'],
                        'required' => $field['slug'] == 'email' ? true : false
                    ];
                }
            }
            wp_send_json_success($allFields, 200);
        }
        // translators: %s: Plugin name
        // translators: %s: Placeholder value
        wp_send_json_error(wp_sprintf(__('%s must be activated!', 'bit-integrations'), 'Mail Mint'));
    }

    public static function getAllList()
    {
        $allLists = [];
        if (class_exists('Mint\MRM\DataBase\Models\ContactGroupModel')) {
            $listData = ContactGroupModel::get_all('lists');

            if (!empty($listData)) {
                foreach ($listData['data'] as $list) {
                    $allLists[] = [
                        'id'   => $list['id'],
                        'name' => $list['title'],
                    ];
                }
            }
        }
        wp_send_json_success($allLists, 200);
    }

    public static function getAllTags()
    {
        $allTags = [];
        if (class_exists('Mint\MRM\DataBase\Models\ContactGroupModel')) {
            $tagData = ContactGroupModel::get_all('tags');

            if (!empty($tagData)) {
                foreach ($tagData['data'] as $tag) {
                    $allTags[] = [
                        'id'   => $tag['id'],
                        'name' => $tag['title'],
                    ];
                }
            }
        }
        wp_send_json_success($allTags, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        $fieldMap = $integrationDetails->field_map;
        if (
            empty($integId)
            || empty($mainAction)
        ) {
            // translators: %s: Integration name

            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Mail Mint'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $mailMintApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $fieldMap,
            $integrationDetails
        );

        if (is_wp_error($mailMintApiResponse)) {
            return $mailMintApiResponse;
        }

        return $mailMintApiResponse;
    }
}
