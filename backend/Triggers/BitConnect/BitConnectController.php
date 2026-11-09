<?php

namespace BitApps\Integrations\Triggers\BitConnect;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Flow\Flow;

final class BitConnectController
{
    private const ANY_EVENT_TASK = 'bit_connect_event';

    private const PRO_EVENT_TASKS = [
        'bit_connect_poll_voted',
        'bit_connect_comment_voted',
        'bit_connect_badge_awarded',
        'bit_connect_group_joined',
        'bit_connect_group_left',
    ];

    private static $runningTasks = [];

    public static function info()
    {
        return [
            'name'              => 'Bit Connect',
            'title'             => __('Community forum for feature requests, feedback and support', 'bit-integrations'),
            'type'              => 'custom_form_submission',
            'is_active'         => static::isPluginInstalled(),
            'tutorial_url'      => '#',
            'tasks'             => [
                'action' => 'bit_connect/get',
                'method' => 'get',
            ],
            'fetch' => [
                'action' => 'trigger/test',
                'method' => 'post',
            ],
            'fetch_remove' => [
                'action' => 'trigger/test/remove',
                'method' => 'post',
            ],
            'isPro' => false,
        ];
    }

    public function getAllTasks()
    {
        if (!static::isPluginInstalled()) {
            // translators: %s: Plugin name
            wp_send_json_error(\sprintf(__('%s is not installed or activated', 'bit-integrations'), 'Bit Connect'));
        }

        $proNote = ' ' . __('Bit Connect Pro sends this event.', 'bit-integrations');

        $tasks = [
            ['form_name' => __('Post Published', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_topic_created', 'skipPrimaryKey' => true, 'note' => __('Runs when a new post becomes public.', 'bit-integrations')],
            ['form_name' => __('Post Status or Stage Changed', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_topic_status_changed', 'skipPrimaryKey' => true, 'note' => __('Runs when the status or the stage of a post changes.', 'bit-integrations')],
            ['form_name' => __('Post Voted', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_topic_voted', 'skipPrimaryKey' => true, 'note' => __('Runs when a member votes for a post.', 'bit-integrations')],
            ['form_name' => __('Poll Voted', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_poll_voted', 'skipPrimaryKey' => true, 'note' => __('Runs when a member votes in a poll.', 'bit-integrations') . $proNote],
            ['form_name' => __('Comment Added', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_comment_created', 'skipPrimaryKey' => true, 'note' => __('Runs when a member adds a comment to a post.', 'bit-integrations')],
            ['form_name' => __('Comment Voted', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_comment_voted', 'skipPrimaryKey' => true, 'note' => __('Runs when a member votes for a comment.', 'bit-integrations') . $proNote],
            ['form_name' => __('Member Registered', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_member_registered', 'skipPrimaryKey' => true, 'note' => __('Runs when a person registers on the forum.', 'bit-integrations')],
            ['form_name' => __('Member Logged In', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_member_logged_in', 'skipPrimaryKey' => true, 'note' => __('Runs when a member logs in on the forum.', 'bit-integrations')],
            ['form_name' => __('Badge Awarded', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_badge_awarded', 'skipPrimaryKey' => true, 'note' => __('Runs when a member gets a badge.', 'bit-integrations') . $proNote],
            ['form_name' => __('Member Joined Group', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_group_joined', 'skipPrimaryKey' => true, 'note' => __('Runs when a member joins a group.', 'bit-integrations') . $proNote],
            ['form_name' => __('Member Left Group', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_group_left', 'skipPrimaryKey' => true, 'note' => __('Runs when a member leaves a group or is removed from it.', 'bit-integrations') . $proNote],
            ['form_name' => __('Report Filed', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_report_filed', 'skipPrimaryKey' => true, 'note' => __('Runs when a member reports a post or a comment.', 'bit-integrations')],
            ['form_name' => __('Reports Resolved', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_report_resolved', 'skipPrimaryKey' => true, 'note' => __('Runs when a moderator closes the reports on a post or a comment.', 'bit-integrations')],
            ['form_name' => __('Moderation Action Taken', 'bit-integrations'), 'triggered_entity_id' => 'bit_connect_moderation_action', 'skipPrimaryKey' => true, 'note' => __('Runs when a moderator or the forum acts on a post or a comment.', 'bit-integrations')],
            ['form_name' => __('Any Forum Event', 'bit-integrations'), 'triggered_entity_id' => self::ANY_EVENT_TASK, 'skipPrimaryKey' => true, 'note' => __('Runs for every forum event. Use conditional logic on the event field to select events.', 'bit-integrations')],
        ];

        if (!static::isProActive()) {
            $tasks = array_values(
                array_filter(
                    $tasks,
                    function ($task) {
                        return !\in_array($task['triggered_entity_id'], self::PRO_EVENT_TASKS, true);
                    }
                )
            );
        }

        wp_send_json_success($tasks);
    }

    public static function handleForumEvent($payload)
    {
        if (empty($payload['event']) || !\is_array($payload)) {
            return;
        }

        return static::flowExecute('bit_connect_' . $payload['event'], $payload);
    }

    public static function handleAnyEvent($event, $payload)
    {
        if (empty($event) || empty($payload) || !\is_array($payload)) {
            return;
        }

        return static::flowExecute(self::ANY_EVENT_TASK, $payload);
    }

    private static function flowExecute($triggeredEntityId, $formData)
    {
        $formData = Helper::prepareFetchFormatFields($formData);

        if (empty($formData) || !\is_array($formData)) {
            return;
        }

        Helper::setTestData(Config::withPrefix("{$triggeredEntityId}_test"), array_values($formData));

        $flows = Flow::exists('BitConnect', $triggeredEntityId);

        if (empty($flows) || isset(self::$runningTasks[$triggeredEntityId])) {
            return;
        }

        self::$runningTasks[$triggeredEntityId] = true;

        try {
            Flow::execute('BitConnect', $triggeredEntityId, array_column($formData, 'value', 'name'), $flows);
        } finally {
            unset(self::$runningTasks[$triggeredEntityId]);
        }

        return ['type' => 'success'];
    }

    private static function isProActive()
    {
        $actionsClass = 'BitApps\\BitConnectPro\\Integrations\\Actions';

        return class_exists($actionsClass) && \call_user_func([$actionsClass, 'available']);
    }

    private static function isPluginInstalled()
    {
        return did_action('bit_connect_loaded') > 0;
    }
}
