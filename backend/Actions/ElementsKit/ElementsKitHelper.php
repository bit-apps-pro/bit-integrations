<?php

namespace BitApps\Integrations\Actions\ElementsKit;

class ElementsKitHelper
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
}
