<?php

/**
 * Mailster Integration
 */

namespace BitApps\Integrations\Actions\Mailster;

use MailsterBlockForms;
use MailsterLists;
use MailsterTags;
use WP_Error;

/**
 * Provide functionality for Mailster integration
 */
class MailsterController
{
    public static function checkedMailsterExists()
    {
        if (!is_plugin_active('mailster/mailster.php')) {
            wp_send_json_error(
                __(
                    'Mailster Plugin is not active or not installed',
                    'bit-integrations'
                ),
                400
            );
        } else {
            return true;
        }
    }

    public function getMailsterFields()
    {
        self::checkedMailsterExists();

        $mailsterBlockForms = new MailsterBlockForms();
        $fields = $mailsterBlockForms->get_fields();

        if (empty($fields) || is_wp_error($fields)) {
            wp_send_json_error(__('Fields fetching failed!', 'bit-integrations'), 400);
        }

        $formattedFields = [];

        foreach ($fields as $field) {
            if ($field['id'] != 'submit') {
                if (isset($field['values']) && !empty($field['values'][0])) {
                    $options = $field['values'];
                } else {
                    $options = [];
                }

                $formattedFields[] = (object) [
                    'key'      => $field['id'],
                    'label'    => $field['name'],
                    'required' => $field['id'] === 'email' ? true : false,
                    'options'  => $options
                ];
            }
        }

        wp_send_json_success($formattedFields, 200);
    }

    public function getMailsterLists()
    {
        self::checkedMailsterExists();

        $mailsterLists = new MailsterLists();

        $getLists = $mailsterLists->get();

        if (empty($getLists) || is_wp_error($getLists)) {
            wp_send_json_error(__('Lists fetching failed!', 'bit-integrations'), 400);
        }

        foreach ($getLists as $list) {
            $lists[] = (object) ['label' => $list->name, 'value' => (string) $list->ID];
        }

        wp_send_json_success($lists, 200);
    }

    public function getMailsterTags()
    {
        self::checkedMailsterExists();

        $mailsterTags = new MailsterTags();

        $getTags = $mailsterTags->get();

        if (empty($getTags) || is_wp_error($getTags)) {
            wp_send_json_error(__('Tags fetching failed!', 'bit-integrations'), 400);
        }

        foreach ($getTags as $tag) {
            $tags[] = (object) ['label' => $tag->name, 'value' => (string) $tag->ID];
        }

        wp_send_json_success($tags, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        self::checkedMailsterExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedStatus = $integrationDetails->selectedStatus;
        $selectedLists = $integrationDetails->selectedLists;
        $selectedTags = $integrationDetails->selectedTags;

        if (empty($fieldMap)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('fields map are required for Mailster', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integId);
        $mailsterResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $selectedStatus,
            $selectedLists,
            $selectedTags
        );

        if (is_wp_error($mailsterResponse)) {
            return $mailsterResponse;
        }

        return $mailsterResponse;
    }
}
