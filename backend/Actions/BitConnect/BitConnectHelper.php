<?php

namespace BitApps\Integrations\Actions\BitConnect;

class BitConnectHelper
{
    private const ACTIONS_CLASS = 'BitApps\BitConnectPro\Integrations\Actions';

    private const TAG_TAXONOMY = 'bit-connect-tags';

    public static function isExists()
    {
        if (!static::isPluginActive()) {
            wp_send_json_error(static::inactiveMessage(), 400);
        }
    }

    public function refreshOptions()
    {
        self::isExists();

        $lists = \call_user_func([self::ACTIONS_CLASS, 'lists']);

        if (is_wp_error($lists)) {
            wp_send_json_error($lists->get_error_message(), 400);
        }

        $tags = get_terms(['taxonomy' => self::TAG_TAXONOMY, 'hide_empty' => false]);

        wp_send_json_success(
            [
                'topicTypes' => static::toOptions($lists['topic_types'] ?? []),
                'statuses'   => static::toOptions($lists['statuses'] ?? []),
                'stages'     => static::toOptions($lists['stages'] ?? []),
                'badges'     => static::toOptions($lists['badges'] ?? []),
                'groups'     => static::toOptions($lists['groups'] ?? []),
                'tags'       => is_wp_error($tags) ? [] : array_map(
                    function ($term) {
                        return (object) ['value' => (string) $term->term_id, 'label' => $term->name];
                    },
                    $tags
                ),
            ],
            200
        );
    }

    public static function isPluginActive()
    {
        return class_exists(self::ACTIONS_CLASS) && \call_user_func([self::ACTIONS_CLASS, 'available']);
    }

    public static function inactiveMessage()
    {
        if (did_action('bit_connect_loaded') === 0) {
            return __('Bit Connect is not activated or not installed', 'bit-integrations');
        }

        if (!class_exists(self::ACTIONS_CLASS)) {
            return __('Bit Connect Pro is not activated or not installed', 'bit-integrations');
        }

        return __('Bit Connect Pro has no active licence. Activate the Bit Connect Pro licence and try again.', 'bit-integrations');
    }

    private static function toOptions(array $items)
    {
        return array_map(
            function ($item) {
                return (object) ['value' => (string) $item['id'], 'label' => html_entity_decode($item['name'])];
            },
            $items
        );
    }
}
