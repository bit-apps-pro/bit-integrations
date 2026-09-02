<?php

namespace BitApps\Integrations\Actions\ElementsKit;

use WP_Error;

class ElementsKitController
{
    /**
     * ElementsKit Lite defines no plugin constant, so the main plugin class is the
     * activation marker. Matches the `class` check the frontend Authorization step uses.
     */
    public static function isExists()
    {
        if (!class_exists('ElementsKit_Lite')) {
            wp_send_json_error(
                __(
                    'ElementsKit is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    /**
     * Dynamic content items, used to pick an optional parent for a new/updated item.
     * A read-only fetch — it stays in Free and fires no Pro hook.
     */
    public function refreshDynamicContents()
    {
        self::isExists();

        $contents = array_map(
            function ($content) {
                return (object) [
                    'content_id'    => $content->ID,
                    'content_title' => $content->post_title,
                ];
            },
            get_posts([
                'post_type'   => 'elementskit_content',
                'post_status' => ['publish', 'draft', 'pending', 'private'],
                'orderby'     => 'title',
                'order'       => 'ASC',
                'numberposts' => -1,
            ])
        );

        wp_send_json_success(['contents' => $contents], 200);
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
}
