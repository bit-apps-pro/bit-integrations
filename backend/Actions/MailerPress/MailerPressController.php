<?php

/**
 * MailerPress Integration
 */

namespace BitApps\Integrations\Actions\MailerPress;

use BitApps\Integrations\Core\Util\Helper;
use WP_Error;

/**
 * Provide functionality for MailerPress integration
 */
class MailerPressController
{
    /**
     * Validate if MailerPress plugin exists or not. If not exists then terminate
     * request and send an error response.
     *
     * @return void
     */
    public static function isExists()
    {
        if (!class_exists('\MailerPress\Core\Kernel')) {
            wp_send_json_error(
                __(
                    'MailerPress is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    /**
     * Process ajax request for refresh lists
     *
     * @return JSON list data
     */
    public function refreshLists()
    {
        self::isExists();

        $lists = [];

        if (\function_exists('mailerpress_get_lists')) {
            $allLists = mailerpress_get_lists();

            $lists = array_map(
                function ($list) {
                    return (object) [
                        'listId'   => $list->list_id ?? $list['list_id'],
                        'listName' => $list->name ?? $list['name']
                    ];
                },
                $allLists
            );
        }

        $response['lists'] = $lists;
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request for refresh tags
     *
     * @return JSON tag data
     */
    public function refreshTags()
    {
        self::isExists();

        $tags = [];

        if (\function_exists('mailerpress_get_tags')) {
            $allTags = mailerpress_get_tags();

            $tags = array_map(
                function ($tag) {
                    return (object) [
                        'tagId'   => $tag->tag_id ?? $tag['tag_id'],
                        'tagName' => $tag->name ?? $tag['name']
                    ];
                },
                $allTags
            );
        }

        $response['tagList'] = $tags;
        wp_send_json_success($response, 200);
    }

    /**
     * Execute integration
     *
     * @param object $integrationData Integration data
     * @param array  $fieldValues     Field values
     *
     * @return mixed
     */
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $mainAction = $integrationDetails->mainAction ?? '';
        $lists = Helper::convertStringToArray($integrationDetails->lists ?? []);
        $tags = Helper::convertStringToArray($integrationDetails->tags ?? []);

        if (empty($fieldMap)) {
            // translators: %s: Integration name
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('Field map is required for %s api', 'bit-integrations'), 'MailerPress'));
        }

        $recordApiHelper = new RecordApiHelper($integId);

        $mailerPressApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $lists,
            $tags,
            $mainAction
        );

        if (is_wp_error($mailerPressApiResponse)) {
            return $mailerPressApiResponse;
        }

        return $mailerPressApiResponse;
    }
}
