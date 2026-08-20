<?php

/**
 * BuddyBoss Record Api
 */

namespace BitApps\Integrations\Actions\BuddyBoss;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;
use BP_Suspend_Member;

class RecordApiHelper
{
    private const CREATE_GROUP_PRO = 1;

    private const ADD_USER_GROUP = 2;

    private const END_FRIENDSHIP_WITH_USER_PRO = 3;

    private const FOLLOW_USER_PRO = 4;

    private const POST_TOPIC_FORUM_PRO = 5;

    private const REMOVE_USER_FROM_GROUP_PRO = 6;

    private const SEND_FRIENDSHIP_REQ_USER_PRO = 7;

    private const SEND_NOTIFICATION_MEMBER_GRP_PRO = 8;

    private const SEND_PRIVATE_MSG_MEMBER_GRP_PRO = 9;

    private const SEND_PRIVATE_MSG_USER_PRO = 10;

    private const SEND_NOTIFICATION_USER_PRO = 11;

    private const STOP_FOLLOWING_USER_PRO = 12;

    private const SUBSCRIBE_USER_FORUM_PRO = 13;

    private const ADD_POST_GRP_ACTIVITY_STREAM_PRO = 14;

    private const ADD_POST_SITE_WIDE_ACTIVITY_STREAM_PRO = 15;

    private const ADD_POST_USER_ACTIVITY_STREAM_PRO = 16;

    private const POST_REPLY_TOPIC_FORUM_PRO = 17;

    private const SET_USER_STATUS_PRO = 18;

    private static $integrationID;

    private $_integrationDetails;

    private $assignment_list;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        self::$integrationID = $integId;
    }

    public static function getIntegrationId()
    {
        return $integrationID = self::$integrationID;
    }

    public function getAssignmentList()
    {
        return $assignment_list = $this->assignment_list;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->buddyBossFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function createGroup($privacyId, $finalData)
    {
        switch ($privacyId) {
            case '1':
                $privacy = 'public';

                break;
            case '2':
                $privacy = 'private';

                break;
            case '3':
                $privacy = 'hidden';

                break;
        }

        $user_id = get_current_user_id();
        $data = [
            'creator_id' => $user_id,
            'name'       => $finalData['group_name'],
            'status'     => $privacy
        ];

        return groups_create_group($data);
    }

    public static function addUserToGroup($groupId)
    {
        $user_id = get_current_user_id();
        if (\function_exists('groups_join_group')) {
            $response = groups_join_group($groupId, $user_id);
            if ($response) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'add-user-to-group']), 'success', wp_json_encode(__('Successfully add user to group', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'add-user-to-group']), 'error', wp_json_encode(__('Unauthorized user', 'bit-integrations')));
            }
        } else {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'add-user-to-group']), 'error', wp_json_encode(__('Failed to add user to group', 'bit-integrations')));
        }
    }

    public static function EndFriendshipWithUser($friendId)
    {
        $user_id = get_current_user_id();
        if (\function_exists('friends_remove_friend')) {
            friends_remove_friend($user_id, $friendId);
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'friend', 'type_name' => 'end-friendship-with-user']), 'success', wp_json_encode(__('Successfully end friendship with user', 'bit-integrations')));
        } else {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'friend', 'type_name' => 'end-friendship-with-user']), 'error', wp_json_encode(__('Failed to end friendship with user', 'bit-integrations')));
        }
    }

    public static function FollowUser($friendId)
    {
        $user_id = get_current_user_id();

        $data = [
            'follower_id' => $user_id,
            'leader_id'   => $friendId,
        ];

        if ($user_id === $friendId) {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'friend', 'type_name' => 'follow-user']), 'error', wp_json_encode(__('A user can not follow itself.', 'bit-integrations')));

            return;
        }

        if (bp_is_active('follow') && \function_exists('bp_follow_start_following')) {
            $following = bp_follow_start_following($data);
        } elseif (\function_exists('bp_start_following')) {
            $following = bp_start_following($data);
        }
        if ($following) {
            // translators: %s: Placeholder value
            return LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'friend', 'type_name' => 'follow-user']), 'success', wp_json_encode(wp_sprintf(__('The user successfully start following a member ID - %s', 'bit-integrations'), $friendId)));
        }
        // translators: %s: Placeholder value
        LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'friend', 'type_name' => 'follow-user']), 'error', wp_json_encode(wp_sprintf(__('The user was already following a member ID - %s', 'bit-integrations'), $friendId)));
    }

    public static function posTopicForum($forum_id, $finalData)
    {
        $user_id = get_current_user_id();
        $data = [
            'forum_id'      => $forum_id,
            'topic_title'   => do_shortcode($finalData['topic_title']),
            'topic_content' => do_shortcode($finalData['topic_content']),
            'topic_author'  => $user_id,
        ];

        if (!empty($forum_id)) {
            if (bbp_is_forum_category($forum_id)) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'topic', 'type_name' => 'post-topic-forum']), 'error', wp_json_encode(__('Sorry, This forum is a category. No discussions can be created in this forum.', 'bit-integrations')));

                return;
            }
            if (bbp_is_forum_closed($forum_id) && !current_user_can('edit_forum', $forum_id)) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'topic', 'type_name' => 'post-topic-forum']), 'error', wp_json_encode(__('Sorry, This forum has been closed to new discussions.', 'bit-integrations')));

                return;
            }

            $is_member = false;
            $group_ids = [];
            if (\function_exists('bbp_get_forum_group_ids')) {
                $group_ids = bbp_get_forum_group_ids($forum_id);
                if (!empty($group_ids)) {
                    foreach ($group_ids as $group_id) {
                        if (groups_is_user_member($user_id, $group_id)) {
                            $is_member = true;

                            break;
                        }
                    }
                }
            }

            if (bbp_is_forum_private($forum_id) && !bbp_is_user_keymaster()) {
                if (
                    (empty($group_ids) && !current_user_can('read_private_forums'))
                    || (!empty($group_ids) && !$is_member)
                ) {
                    LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'topic', 'type_name' => 'post-topic-forum']), 'error', wp_json_encode(__('Sorry, This forum is private and you do not have the capability to read or create new discussions in it.', 'bit-integrations')));

                    return;
                }
            } elseif (bbp_is_forum_hidden($forum_id) && !bbp_is_user_keymaster()) {
                if (
                    (empty($group_ids) && !current_user_can('read_hidden_forums'))
                    || (!empty($group_ids) && !$is_member)
                ) {
                    LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'topic', 'type_name' => 'post-topic-forum']), 'error', wp_json_encode(__('Sorry, This forum is hidden and you do not have the capability to read or create new discussions in it.', 'bit-integrations')));

                    return;
                }
            }
        }

        if (!bbp_check_for_duplicate(
            [
                'post_type'    => bbp_get_topic_post_type(),
                'post_author'  => $user_id,
                'post_content' => do_shortcode($finalData['topic_content'])
            ]
        )) {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'topic', 'type_name' => 'post-topic-forum']), 'error', wp_json_encode(__('Duplicate discussion detected; it looks as though you\'ve already said that!', 'bit-integrations')));

            return;
        }

        if (!bbp_check_for_blacklist(null, $user_id, do_shortcode($finalData['topic_title']), do_shortcode($finalData['topic_content']))) {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'topic', 'type_name' => 'post-topic-forum']), 'error', wp_json_encode(__('Sorry, Your discussion cannot be created at this time.', 'bit-integrations')));

            return;
        }

        $topic_data = apply_filters(
            'bbp_new_topic_pre_insert',
            [
                'post_author'    => $user_id,
                'post_title'     => $data['topic_title'],
                'post_content'   => $data['topic_content'],
                'post_status'    => 'publish',
                'post_parent'    => $forum_id,
                'post_type'      => bbp_get_topic_post_type(),
                'tax_input'      => [],
                'comment_status' => 'closed',
            ]
        );

        $topic_id = wp_insert_post($topic_data);

        if (empty($topic_id) || is_wp_error($topic_id)) {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'topic', 'type_name' => 'post-topic-forum']), 'error', wp_json_encode(__('We are facing a problem to creating a topic.', 'bit-integrations')));

            return;
        }
        // translators: %s: Placeholder value
        LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'topic', 'type_name' => 'post-topic-forum']), 'success', wp_json_encode(wp_sprintf(__('Post created successfully and id is %s', 'bit-integrations'), $topic_id)));

        if (
            (bbp_get_trash_status_id() === get_post_field('post_status', $forum_id))
            || (bbp_get_trash_status_id() === $topic_data['post_status'])
        ) {
            wp_trash_post($topic_id);
        }

        if (bbp_get_spam_status_id() === $topic_data['post_status']) {
            add_post_meta($topic_id, '_bbp_spam_meta_status', bbp_get_public_status_id());
        }

        remove_action('bbp_new_topic', 'bbp_notify_forum_subscribers', 11);

        do_action('bbp_new_topic', $topic_id, $forum_id, null, $user_id);

        if (bbp_is_subscriptions_active()) {
            $author_id = bbp_get_user_id(0, true, true);
            $subscribed = bbp_is_user_subscribed($author_id, $topic_id);

            if (true === $subscribed && empty($topic->bbp_topic_subscription)) {
                bbp_remove_user_subscription($author_id, $topic_id);
            } elseif (false === $subscribed && !empty($topic->bbp_topic_subscription)) {
                bbp_add_user_subscription($author_id, $topic_id);
            }
        }

        do_action('bbp_new_topic_post_extras', $topic_id);

        if (\function_exists('bbp_notify_forum_subscribers')) {
            bbp_notify_forum_subscribers($topic_id, $forum_id, null, $user_id);
        }
    }

    public static function removeUserFromGroup($group_id)
    {
        $user_id = get_current_user_id();

        if ($group_id === 'any') {
            $all_user_groups = groups_get_user_groups($user_id);
            if (!empty($all_user_groups['groups'])) {
                foreach ($all_user_groups['groups'] as $group) {
                    $result = groups_leave_group($group, $user_id);
                }
            }
        } else {
            $result = groups_leave_group($group_id, $user_id);
        }

        return $result;
    }

    public static function sendFriendshipRequestUser($friendId)
    {
        $user_id = get_current_user_id();
        if (\function_exists('friends_add_friend')) {
            return friends_add_friend($user_id, $friendId);
        }

        return false;
    }

    public static function sendNotificationMembersGroup($group_id, $friendId, $finalData)
    {
        $user_id = get_current_user_id();
        $data = [
            'group_id'             => $group_id,
            'friend_id'            => $friendId,
            'notification_content' => do_shortcode($finalData['notification_content']),
            'notification_link'    => do_shortcode($finalData['notification_link']),
        ];

        if (\function_exists('groups_get_group_members')) {
            $members = groups_get_group_members([
                'group_id'       => $group_id,
                'per_page'       => 999999,
                'type'           => 'last_joined',
                'exclude_banned' => true
            ]);

            if (isset($members['members'])) {
                if (\function_exists('bp_notifications_add_notification')) {
                    foreach ($members['members'] as $member) {
                        $notification_id = '';
                        $notification_id = bp_notifications_add_notification(
                            [
                                'user_id'           => $member->ID,
                                'item_id'           => 1,
                                'secondary_item_id' => $user_id,
                                'component_name'    => 'bit-integrations',
                                'component_action'  => 'bit_integrations_send_notification',
                                'date_notified'     => bp_core_current_time(),
                                'is_new'            => 1,
                                'allow_duplicate'   => true,
                            ]
                        );
                        bp_notifications_update_meta($notification_id, 'uo_notification_content', $data['notification_content']);
                        bp_notifications_update_meta($notification_id, 'uo_notification_link', $data['notification_link']);
                    }

                    return true;
                }
            }
        } else {
            return false;
        }
    }

    public static function SendPrivateMessageMembersGroup($group_id, $friendId, $finalData)
    {
        $user_id = get_current_user_id();
        $data = [
            'group_id'        => $group_id,
            'friend_id'       => $friendId,
            'message_content' => do_shortcode($finalData['message_content']),
            'message_subject' => do_shortcode($finalData['message_subject']),
        ];

        if (\function_exists('groups_get_group_members')) {
            $members = groups_get_group_members(['group_id' => $group_id, 'per_page' => -1, 'type' => 'last_joined', 'exclude_banned' => true]);

            if (isset($members['members'])) {
                foreach ($members['members'] as $member) {
                    $members_ids[] = $member->ID;
                }

                $msg = [
                    'sender_id'  => $friendId,
                    'recipients' => $members_ids,
                    'subject'    => $data['message_subject'],
                    'content'    => $data['message_content'],
                    'error_type' => 'wp_error',
                ];

                if (\function_exists('messages_new_message')) {
                    $send = messages_new_message($msg);
                    if (is_wp_error($send)) {
                        $messages = $send->get_error_messages();
                        $err = [];
                        if ($messages) {
                            foreach ($messages as $msg) {
                                $err[] = $msg;
                            }
                        }

                        return false;
                    }

                    return $send;
                }
            }
        } else {
            return false;
        }
    }

    public static function SendPrivateMessageUser($friendId, $finalData, $fieldValues, $recipientUserId = null)
    {
        $user_id = (empty($recipientUserId) || $recipientUserId === 'loggedInUser') ? get_current_user_id() : Common::replaceFieldWithValue($recipientUserId, $fieldValues);
        $data = [
            'sender_id'       => $friendId,
            'message_content' => do_shortcode($finalData['message_content']),
            'message_subject' => do_shortcode($finalData['message_subject']),
        ];

        $msg = [
            'sender_id'  => $data['sender_id'],
            'recipients' => [$user_id],
            'subject'    => $data['message_subject'],
            'content'    => $data['message_content'],
            'error_type' => 'wp_error',
        ];

        if (\function_exists('messages_new_message')) {
            $send = messages_new_message($msg);
            if (is_wp_error($send)) {
                $messages = $send->get_error_messages();
                $err = [];
                if ($messages) {
                    foreach ($messages as $msg) {
                        $err[] = $msg;
                    }
                }

                return false;
            }

            return $send;
        }

        return false;
    }

    public static function sendNotificationUser($finalData)
    {
        $user_id = get_current_user_id();

        if (\function_exists('bp_notifications_add_notification')) {
            $notification_id = bp_notifications_add_notification(
                [
                    'user_id'           => $user_id,
                    'item_id'           => 1,
                    'secondary_item_id' => $user_id,
                    'component_name'    => 'bit-integrations',
                    'component_action'  => 'bit_integrations_send_notification',
                    'date_notified'     => bp_core_current_time(),
                    'is_new'            => 1,
                    'allow_duplicate'   => true,
                ]
            );

            $data = [
                'notification_content' => do_shortcode($finalData['notification_content']),
                'notification_link'    => do_shortcode($finalData['notification_link']),
            ];

            if (is_wp_error($notification_id)) {
                return false;
            }
            if (!empty($data['notification_link'])) {
                $notification_content = '<a href="' . esc_attr(esc_url($data['notification_link'])) . '" title="' . esc_attr(wp_strip_all_tags($data['notification_content'])) . '">' . ($data['notification_content']) . '</a>';
            }

            bp_notifications_update_meta($notification_id, 'uo_notification_content', $notification_content);
            bp_notifications_update_meta($notification_id, 'uo_notification_link', $data['notification_link']);

            return true;
        }

        return false;
    }

    public static function stopFollowingUser($friendId)
    {
        $user_id = get_current_user_id();
        $follower_ids = explode(',', $friendId);

        if (\function_exists('bp_stop_following') || (bp_is_active('follow') && \function_exists('bp_follow_stop_following'))) {
            foreach ($follower_ids as $k => $follower_id) {
                if ((int) $follower_id == $user_id) {
                    continue;
                }
                $message = '';
                $data = [
                    'follower_id' => $user_id,
                    'leader_id'   => (int) $follower_id
                ];
                if (bp_is_active('follow') && \function_exists('bp_follow_stop_following')) {
                    $following = bp_follow_stop_following($data);
                } elseif (\function_exists('bp_stop_following')) {
                    $following = bp_stop_following($data);
                }
                if ($following == false) {
                    $message .= 'The user was not following a member id is - ' . $follower_id . '. ';
                    LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'follow', 'type_name' => 'stop-follow-user']), 'error', wp_json_encode($message));
                } else {
                    LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'follow', 'type_name' => 'stop-follow-user']), 'success', wp_json_encode(__('Stop following users successfully .', 'bit-integrations')));
                }
            }
        }
    }

    public static function subscribeForum($forumId)
    {
        if (bbp_is_subscriptions_active() === false) {
            return;
        }
        $user_id = get_current_user_id();
        $forum_ids = explode(',', $forumId);

        if (!empty($forum_ids)) {
            foreach ($forum_ids as $forum_id) {
                $is_subscription = bbp_is_user_subscribed($user_id, (int) $forum_id);
                $success = false;

                if (true === $is_subscription) {
                    LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'subscribed', 'type_name' => 'subscribe-forum']), 'error', wp_json_encode(__('The user is already subscribed to the specified forum.', 'bit-integrations')));

                    return;
                }
                $success = bbp_add_user_subscription($user_id, (int) $forum_id);
                // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- Using BuddyBoss's own hook for compatibility
                do_action('buddyBoss_subscriptions_handler', $success, $user_id, (int) $forum_id, 'bbp_subscribe');

                if ($success === false && $is_subscription === false) {
                    LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'subscribed', 'type_name' => 'subscribe-forum']), 'error', wp_json_encode(__('There was a problem subscribing to that forum!', 'bit-integrations')));

                    return;
                }

                return $success;
            }
        }
    }

    public static function addPostToGroup($group_id, $friendId, $finalData)
    {
        $action_author = $friendId;
        $data = [
            'action'         => $finalData['activity_action'],
            'action_content' => $finalData['activity_content'],
        ];

        if (empty($group_id)) {
            return false;
        }
        $activity = false;

        if ('any' === $group_id) {
            global $wpdb;
            $cache_key = Config::withPrefix('buddyboss_groups_all_statuses');
            $cache_group = Config::VAR_PREFIX;
            $results = wp_cache_get($cache_key, $cache_group);

            if (false === $results) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Dynamic IN clause with sprintf for placeholders.
                $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}bp_groups WHERE status IN ('public', 'private', 'hidden')");
                wp_cache_set($cache_key, $results, $cache_group, 10 * MINUTE_IN_SECONDS);
            }
            if ($results) {
                foreach ($results as $result) {
                    $hide_sitewide = false;
                    if (\in_array($result->status, ['private', 'hidden'], true)) {
                        $hide_sitewide = true;
                    }
                    $activity = bp_activity_add([
                        'action'        => $data['action'],
                        'content'       => $data['action_content'],
                        'primary_link'  => null,
                        'component'     => 'groups',
                        'item_id'       => $result->id,
                        'type'          => 'activity_update',
                        'user_id'       => $action_author,
                        'hide_sitewide' => $hide_sitewide,
                    ]);
                    if (is_wp_error($activity)) {
                        break;
                    }
                    if (!$activity) {
                        break;
                    }
                }
            }
        } else {
            global $wpdb;
            $cache_key = Config::withPrefix('buddyboss_group_') . absint($group_id);
            $cache_group = Config::VAR_PREFIX;
            $results = wp_cache_get($cache_key, $cache_group);

            if (false === $results) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for BuddyBoss groups.
                $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}bp_groups WHERE id = %d", $group_id));
                wp_cache_set($cache_key, $results, $cache_group, 10 * MINUTE_IN_SECONDS);
            }
            if ($results) {
                foreach ($results as $result) {
                    $hide_sitewide = false;
                    if (\in_array($result->status, ['private', 'hidden'], true)) {
                        $hide_sitewide = true;
                    }
                    $activity = bp_activity_add([
                        'action'        => $data['action'],
                        'content'       => $data['action_content'],
                        'primary_link'  => null,
                        'component'     => 'groups',
                        'item_id'       => $result->id,
                        'type'          => 'activity_update',
                        'user_id'       => $action_author,
                        'hide_sitewide' => $hide_sitewide,
                    ]);
                    if (is_wp_error($activity)) {
                        break;
                    }
                    if (!$activity) {
                        break;
                    }
                }
            }
        }
        if (is_wp_error($activity)) {
            $error_message = $activity->get_error_message();

            return $error_message;
        } elseif (!$activity) {
            return $error_message = __('There is an error on posting stream.', 'bit-integrations');
        }

        return $activity;
    }

    public static function postActivityStream($friendId, $finalData)
    {
        $data = [
            'action'         => $finalData['activity_action'],
            'action_link'    => $finalData['activity_link'],
            'action_content' => $finalData['activity_content'],
        ];

        return bp_activity_add([
            'action'        => $data['action'],
            'content'       => $data['action_content'],
            'primary_link'  => $data['action_link'],
            'component'     => 'activity',
            'type'          => 'activity_update',
            'user_id'       => (int) $friendId,
            'hide_sitewide' => false,
        ]);
    }

    public static function postActivityUsersStream($friendId, $finalData)
    {
        $data = [
            'action'         => $finalData['activity_action'],
            'action_link'    => $finalData['activity_link'],
            'action_content' => $finalData['activity_content'],
        ];

        return bp_activity_add([
            'action'        => $data['action'],
            'content'       => $data['action_content'],
            'primary_link'  => $data['action_link'],
            'component'     => 'activity',
            'type'          => 'activity_update',
            'user_id'       => (int) $friendId,
            'hide_sitewide' => true,
        ]);
    }

    public static function postReplyTopicForum($forum_id, $topic_id, $finalData)
    {
        $data = [
            'forum_id'       => $forum_id,
            'topic_id'       => $topic_id,
            'reply_content'  => $finalData['reply_content'],
            'reply_author'   => get_current_user_id(),
            'anonymous_data' => 0,
            'reply_title'    => '',
            'reply_to'       => 0,
        ];

        if (!bbp_get_topic($topic_id)) {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'error', wp_json_encode(__('Sorry, Discussion does not exist.', 'bit-integrations')));

            return;
        }

        if (!bbp_get_forum($forum_id)) {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'error', wp_json_encode(__('Sorry, Forum does not exist.', 'bit-integrations')));

            return;
        }
        if (!empty($forum_id)) {
            if (bbp_is_forum_category($forum_id)) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'error', wp_json_encode(__('Sorry, This forum is a category. No discussions can be created in this forum.', 'bit-integrations')));

                return;
            }
            if (bbp_is_forum_closed($forum_id) && !current_user_can('edit_forum', $forum_id)) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'error', wp_json_encode(__('Sorry, This forum has been closed to new discussions.', 'bit-integrations')));

                return;
            }

            $is_member = false;
            $group_ids = [];
            if (\function_exists('bbp_get_forum_group_ids')) {
                $group_ids = bbp_get_forum_group_ids($forum_id);
                if (!empty($group_ids)) {
                    foreach ($group_ids as $group_id) {
                        if (groups_is_user_member($reply_author, $group_id)) {
                            $is_member = true;

                            break;
                        }
                    }
                }
            }

            if (bbp_is_forum_private($forum_id) && !bbp_is_user_keymaster()) {
                if (
                    (empty($group_ids) && !current_user_can('read_private_forums'))
                    || (!empty($group_ids) && !$is_member)
                ) {
                    LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'error', wp_json_encode(__('Sorry, This forum is private and you do not have the capability to read or create new discussions in it.', 'bit-integrations')));

                    return;
                }
            } elseif (bbp_is_forum_hidden($forum_id) && !bbp_is_user_keymaster()) {
                if (
                    (empty($group_ids) && !current_user_can('read_hidden_forums'))
                    || (!empty($group_ids) && !$is_member)
                ) {
                    LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'error', wp_json_encode(__('Sorry, This forum is hidden and you do not have the capability to read or create new discussions in it.', 'bit-integrations')));

                    return;
                }
            }
        }

        $reply_content = apply_filters('bbp_new_reply_pre_content', $data['reply_content']);

        if (!bbp_check_for_duplicate(
            [
                'post_type'      => bbp_get_reply_post_type(),
                'post_author'    => $data['reply_author'],
                'post_content'   => $reply_content,
                'post_parent'    => $topic_id,
                'anonymous_data' => $data['anonymous_data'],
            ]
        )) {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'error', wp_json_encode("Duplicate reply detected; it looks as though you've already said that!"));

            return;
        }

        if (bbp_is_topic_closed($topic_id) && !current_user_can('moderate')) {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'error', wp_json_encode(__('Sorry, Discussion is closed.', 'bit-integrations')));

            return;
        }

        if (!bbp_check_for_blacklist($data['anonymous_data'], $data['reply_author'], $data['reply_title'], $reply_content)) {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'error', wp_json_encode(__('Sorry, Your reply cannot be created at this time.', 'bit-integrations')));

            return;
        }

        if (!bbp_check_for_moderation($data['anonymous_data'], $data['reply_author'], $data['reply_title'], $reply_content)) {
            $reply_status = bbp_get_pending_status_id();
        } else {
            $reply_status = bbp_get_public_status_id();
        }

        if (bbp_is_topic_closed($topic_id) && !current_user_can('moderate')) {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'error', wp_json_encode(__('Sorry, Discussion is closed.', 'bit-integrations')));

            return;
        }
        $reply_data = apply_filters(
            'bbp_new_reply_pre_insert',
            [
                'post_author'    => $data['reply_author'],
                'post_title'     => $data['reply_title'],
                'post_content'   => $data['reply_content'],
                'post_status'    => $reply_status,
                'post_parent'    => $topic_id,
                'post_type'      => bbp_get_reply_post_type(),
                'comment_status' => 'closed',
                'menu_order'     => bbp_get_topic_reply_count($topic_id, false) + 1,
            ]
        );

        $reply_id = wp_insert_post($reply_data);

        if (empty($reply_id) || is_wp_error($reply_id)) {
            $append_error = (
                (is_wp_error($reply_id) && $reply_id->get_error_message())
                ? __('The following problems have been found with your reply:', 'bit-integrations') . ' ' . $reply_id->get_error_message()
                : __('We are facing a problem to creating a reply.', 'bit-integrations')
            );

            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'error', wp_json_encode($append_error));

            return;
        }

        if (bbp_is_topic_trash($topic_id) || (bbp_get_trash_status_id() === $reply_data['post_status'])) {
            wp_trash_post($reply_id);

            if (bbp_is_topic_trash($topic_id)) {
                $pre_trashed_replies = (array) get_post_meta($topic_id, '_bbp_pre_trashed_replies', true);

                $pre_trashed_replies[] = $reply_id;

                update_post_meta($topic_id, '_bbp_pre_trashed_replies', $pre_trashed_replies);
            }
        } elseif (bbp_is_topic_spam($topic_id) || (bbp_get_spam_status_id() === $reply_data['post_status'])) {
            add_post_meta($reply_id, '_bbp_spam_meta_status', bbp_get_public_status_id());

            if (bbp_is_topic_spam($topic_id)) {
                $pre_spammed_replies = (array) get_post_meta($topic_id, '_bbp_pre_spammed_replies', true);

                $pre_spammed_replies[] = $reply_id;

                update_post_meta($topic_id, '_bbp_pre_spammed_replies', $pre_spammed_replies);
            }
        }

        remove_action('bbp_new_reply', 'bbp_notify_topic_subscribers', 11);

        do_action('bbp_new_reply', $reply_id, $topic_id, $forum_id, $data['anonymous_data'], $data['reply_author'], false, $data['reply_to']);

        do_action('bbp_new_reply_post_extras', $reply_id);

        return $reply_id;
    }

    public static function setUserStatus($userStatusId)
    {
        $user_id = get_current_user_id();
        $set_user_status = $userStatusId === '1' ? 'active' : 'suspend';
        if (bp_is_active('moderation')) {
            if ('suspend' === $set_user_status) {
                BP_Suspend_Member::suspend_user($user_id);
            } elseif (bp_moderation_is_user_suspended($user_id)) {
                BP_Suspend_Member::unsuspend_user($user_id);
            }

            return true;
        }

        return false;
    }

    public function execute(
        $mainAction,
        $fieldValues,
        $fieldMap,
        $integrationDetails
    ) {
        $fieldData = [];
        $apiResponse = null;
        if ($mainAction == static::CREATE_GROUP_PRO) {
            $privacyId = $integrationDetails->privacyId;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = self::createGroup(
                $privacyId,
                $finalData
            );
            if ($apiResponse !== 0) {
                // translators: %s: Placeholder value
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'create-group']), 'success', wp_json_encode(wp_sprintf(__('Group created successfully and is is %s', 'bit-integrations'), $apiResponse)));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'create-group']), 'error', wp_json_encode($apiResponse));
            }
        }
        if ($mainAction == static::ADD_USER_GROUP) {
            $groupId = $integrationDetails->groupId;
            self::addUserToGroup(
                $groupId
            );
        }
        if ($mainAction == static::END_FRIENDSHIP_WITH_USER_PRO) {
            $friendId = $integrationDetails->friendId;
            self::EndFriendshipWithUser(
                $friendId
            );
        }
        if ($mainAction == static::FOLLOW_USER_PRO) {
            $friendId = $integrationDetails->friendId;
            self::FollowUser(
                $friendId
            );
        }
        if ($mainAction == static::POST_TOPIC_FORUM_PRO) {
            $forumId = $integrationDetails->forumId;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            self::posTopicForum(
                $forumId,
                $finalData
            );
        }
        if ($mainAction == static::REMOVE_USER_FROM_GROUP_PRO) {
            $groupId = $integrationDetails->groupId;
            $apiResponse = self::removeUserFromGroup(
                $groupId
            );
            if ($apiResponse) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'user', 'type_name' => 'user-remove-group']), 'success', wp_json_encode(__('User removed from group successfully .', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'user', 'type_name' => 'user-remove-group']), 'error', wp_json_encode(__('Failed to remove user form group .', 'bit-integrations')));
            }
        }
        if ($mainAction == static::SEND_FRIENDSHIP_REQ_USER_PRO) {
            $friendId = $integrationDetails->friendId;
            $apiResponse = self::sendFriendshipRequestUser(
                $friendId
            );
            if ($apiResponse) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'user', 'type_name' => 'send-friend-request']), 'success', wp_json_encode(__('Send friend request successfully .', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'user', 'type_name' => 'send-friend-request']), 'error', wp_json_encode(__('Failed to send friend request to user .', 'bit-integrations')));
            }
        }
        if ($mainAction == static::SEND_NOTIFICATION_MEMBER_GRP_PRO) {
            $group_id = $integrationDetails->groupId;
            $friendId = $integrationDetails->friendId;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = self::sendNotificationMembersGroup($group_id, $friendId, $finalData);
            if ($apiResponse) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'notification', 'type_name' => 'send-notification-allMember']), 'success', wp_json_encode(__('Notification are send successfully .', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'notification', 'type_name' => 'send-notification-allMember']), 'error', wp_json_encode(__('BuddyBoss notification module is not active.', 'bit-integrations')));
            }
        }
        if ($mainAction == static::SEND_PRIVATE_MSG_MEMBER_GRP_PRO) {
            $group_id = $integrationDetails->groupId;
            $friendId = $integrationDetails->friendId;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = self::SendPrivateMessageMembersGroup($group_id, $friendId, $finalData);
            if ($apiResponse) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'message', 'type_name' => 'send-private-message']), 'success', wp_json_encode(__('Send private message to all group member successfully .', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'message', 'type_name' => 'send-private-message']), 'error', wp_json_encode(__('BuddyBoss message module is not active.', 'bit-integrations')));
            }
        }
        if ($mainAction == static::SEND_PRIVATE_MSG_USER_PRO) {
            $friendId = $integrationDetails->friendId;
            $recipientUserId = $integrationDetails->recipientUserId ?? null;

            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = self::SendPrivateMessageUser($friendId, $finalData, $fieldValues, $recipientUserId);

            if ($apiResponse) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'message', 'type_name' => 'send-private-message']), 'success', wp_json_encode(__('Send private message to user successfully .', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'message', 'type_name' => 'send-private-message']), 'error', wp_json_encode(__('BuddyBoss message module is not active.', 'bit-integrations')));
            }
        }
        if ($mainAction == static::SEND_NOTIFICATION_USER_PRO) {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = self::sendNotificationUser($finalData);
            if ($apiResponse) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'notification', 'type_name' => 'send-notification-allMember']), 'success', wp_json_encode(__('Notification are send successfully .', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'notification', 'type_name' => 'send-notification-allMember']), 'error', wp_json_encode(__('BuddyBoss message module is not active.', 'bit-integrations')));
            }
        }
        if ($mainAction == static::STOP_FOLLOWING_USER_PRO) {
            $friendId = $integrationDetails->friendId;
            $apiResponse = self::stopFollowingUser(
                $friendId
            );
        }
        if ($mainAction == static::SUBSCRIBE_USER_FORUM_PRO) {
            $forum_id = $integrationDetails->forumId;
            $apiResponse = self::subscribeForum(
                $forum_id
            );
            if ($apiResponse) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'subscribe', 'type_name' => 'subscribe-forum']), 'success', wp_json_encode(__('Forum subscribe successfully .', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'subscribe', 'type_name' => 'subscribe-forum']), 'error', wp_json_encode(__('Failed to subscribe Forum .', 'bit-integrations')));
            }
        }
        if ($mainAction == static::ADD_POST_GRP_ACTIVITY_STREAM_PRO) {
            $group_id = $integrationDetails->groupId;
            $friendId = $integrationDetails->friendId;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = self::addPostToGroup($group_id, $friendId, $finalData);
            if (\gettype($apiResponse) === 'integer') {
                // translators: %s: Placeholder value
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'post', 'type_name' => 'add-post-to-group']), 'success', wp_json_encode(wp_sprintf(__('Post added to group successfully and id is -> %s', 'bit-integrations'), $apiResponse)));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'post', 'type_name' => 'add-post-to-group']), 'error', wp_json_encode($apiResponse));
            }
        }
        if ($mainAction == static::ADD_POST_SITE_WIDE_ACTIVITY_STREAM_PRO) {
            $friendId = $integrationDetails->friendId;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = self::postActivityStream($friendId, $finalData);
            if (\gettype($apiResponse) === 'integer') {
                // translators: %s: Placeholder value
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'post', 'type_name' => 'add-post-sitewide-activity']), 'success', wp_json_encode(wp_sprintf(__('Post added to sitewide activity stream successfully and id is -> %s', 'bit-integrations'), $apiResponse)));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'post', 'type_name' => 'add-post-sitewide-activity']), 'error', wp_json_encode($apiResponse));
            }
        }
        if ($mainAction == static::ADD_POST_USER_ACTIVITY_STREAM_PRO) {
            $friendId = $integrationDetails->friendId;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = self::postActivityUsersStream($friendId, $finalData);
            if (\gettype($apiResponse) === 'integer') {
                // translators: %s: Placeholder value
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'post', 'type_name' => 'add-post-user-activity']), 'success', wp_json_encode(wp_sprintf(__('Post added to Users activity stream successfully and id is -> %s', 'bit-integrations'), $apiResponse)));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'post', 'type_name' => 'add-post-user-activity']), 'error', wp_json_encode($apiResponse));
            }
        }
        if ($mainAction == static::POST_REPLY_TOPIC_FORUM_PRO) {
            $forum_id = $integrationDetails->forumId;
            $topic_id = $integrationDetails->topicId;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = self::postReplyTopicForum($forum_id, $topic_id, $finalData);
            if (\gettype($apiResponse) === 'integer') {
                // translators: %s: Placeholder value
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'success', wp_json_encode(wp_sprintf(__('Reply forum topic successfully and id is -> %s', 'bit-integrations'), $apiResponse)));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'reply', 'type_name' => 'reply-forum-topic']), 'error', wp_json_encode(__('Failed to reply forum topic.', 'bit-integrations')));
            }
        }
        if ($mainAction == static::SET_USER_STATUS_PRO) {
            $userStatusId = $integrationDetails->userStatusId;
            $apiResponse = self::setUserStatus($userStatusId);
            if ($apiResponse) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'user', 'type_name' => 'user-specific-status']), 'success', wp_json_encode(__('Change user status successfully .', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'user', 'type_name' => 'user-specific-status']), 'error', wp_json_encode(__('To change members status in your network, please activate the Moderation component.', 'bit-integrations')));
            }
        }

        return $apiResponse;
    }
}
