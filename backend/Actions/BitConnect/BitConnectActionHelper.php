<?php

namespace BitApps\Integrations\Actions\BitConnect;

use BitApps\BitConnectPro\Integrations\Actions;
use WP_Error;

final class BitConnectActionHelper
{
    public static function createPost($fieldData, $integrationDetails = null)
    {
        $missing = self::missingRequired($fieldData, ['post_title', 'author_email']);

        if ($missing) {
            return self::requiredError($missing);
        }

        $tags = array_values(
            array_filter(
                array_map(
                    function ($tag) {
                        $tag = trim((string) $tag);

                        return ctype_digit($tag) ? (int) $tag : $tag;
                    },
                    explode(',', (string) self::conf($integrationDetails, 'selectedTags'))
                )
            )
        );

        $input = array_filter(
            [
                'post_title'   => (string) $fieldData['post_title'],
                'post_content' => (string) ($fieldData['post_content'] ?? ''),
                'post_name'    => (string) ($fieldData['post_name'] ?? ''),
                'topic-types'  => absint(self::conf($integrationDetails, 'selectedTopicType')),
                'groups'       => absint(self::conf($integrationDetails, 'selectedGroup')),
                'tags'         => $tags,
                'author_email' => $fieldData['author_email'],
            ]
        );

        $post = Actions::createTopic($input);

        if (is_wp_error($post) && self::hasFieldError($post, 'topic-types') && empty($input['topic-types'])) {
            return self::error(__('This forum needs a topic type for each post. Select a topic type.', 'bit-integrations'));
        }

        return self::respond($post, __('Post created successfully', 'bit-integrations'));
    }

    public static function setPostStatus($fieldData, $integrationDetails = null)
    {
        $missing = self::missingRequired($fieldData, ['post_id']);

        if ($missing) {
            return self::requiredError($missing);
        }

        $input = array_filter(
            [
                'status_id' => absint(self::conf($integrationDetails, 'selectedStatus')),
                'stage_id'  => absint(self::conf($integrationDetails, 'selectedStage')),
            ]
        );

        if (empty($input)) {
            return self::error(__('Status and stage are empty. Select a status, a stage, or both.', 'bit-integrations'));
        }

        return self::respond(Actions::setTopicStatus(absint($fieldData['post_id']), $input), __('Post status updated successfully', 'bit-integrations'));
    }

    public static function voteForPost($fieldData)
    {
        $missing = self::missingRequired($fieldData, ['post_id', 'author_email']);

        if ($missing) {
            return self::requiredError($missing);
        }

        return self::respond(
            Actions::voteTopic(absint($fieldData['post_id']), ['author_email' => $fieldData['author_email']]),
            __('Vote added successfully', 'bit-integrations')
        );
    }

    public static function addComment($fieldData)
    {
        $missing = self::missingRequired($fieldData, ['post_id', 'content', 'author_email']);

        if ($missing) {
            return self::requiredError($missing);
        }

        $input = array_filter(
            [
                'content'      => (string) $fieldData['content'],
                'parent_id'    => absint($fieldData['parent_id'] ?? 0),
                'author_email' => $fieldData['author_email'],
            ]
        );

        return self::respond(Actions::addComment(absint($fieldData['post_id']), $input), __('Comment added successfully', 'bit-integrations'));
    }

    public static function awardBadge($fieldData, $integrationDetails = null)
    {
        $missing = self::missingRequired($fieldData, ['email']);

        if ($missing) {
            return self::requiredError($missing);
        }

        $badgeId = (string) self::conf($integrationDetails, 'selectedBadge');

        if ($badgeId === '') {
            return self::error(__('Badge is empty. Select a badge.', 'bit-integrations'));
        }

        $member = Actions::findMember(['email' => $fieldData['email']]);

        if (is_wp_error($member)) {
            return self::error($member->get_error_message());
        }

        return self::respond(Actions::awardBadge((int) $member['member_id'], $badgeId), __('Badge awarded successfully', 'bit-integrations'));
    }

    public static function addMemberToGroup($fieldData, $integrationDetails = null)
    {
        $missing = self::missingRequired($fieldData, ['email']);

        if ($missing) {
            return self::requiredError($missing);
        }

        $groupId = absint(self::conf($integrationDetails, 'selectedGroup'));

        if (!$groupId) {
            return self::error(__('Group is empty. Select a group.', 'bit-integrations'));
        }

        $role = self::conf($integrationDetails, 'selectedRole') === 'moderator' ? 'moderator' : 'member';

        return self::respond(
            Actions::addToGroup($groupId, ['email' => $fieldData['email'], 'role' => $role]),
            __('Member added to the group successfully', 'bit-integrations')
        );
    }

    public static function removeMemberFromGroup($fieldData, $integrationDetails = null)
    {
        $missing = self::missingRequired($fieldData, ['email']);

        if ($missing) {
            return self::requiredError($missing);
        }

        $groupId = absint(self::conf($integrationDetails, 'selectedGroup'));

        if (!$groupId) {
            return self::error(__('Group is empty. Select a group.', 'bit-integrations'));
        }

        return self::respond(
            Actions::removeFromGroup($groupId, ['email' => $fieldData['email']]),
            __('Member removed from the group successfully', 'bit-integrations')
        );
    }

    private static function conf($integrationDetails, $key)
    {
        return \is_object($integrationDetails) ? ($integrationDetails->{$key} ?? '') : '';
    }

    private static function respond($result, $message)
    {
        if (is_wp_error($result)) {
            return self::error($result->get_error_message());
        }

        return ['success' => true, 'message' => $message, 'data' => $result];
    }

    private static function hasFieldError(WP_Error $error, $field)
    {
        $data = $error->get_error_data();

        return \is_array($data) && isset($data['errors'][$field]);
    }

    private static function missingRequired($fieldData, array $required)
    {
        return array_values(
            array_filter(
                $required,
                function ($key) use ($fieldData) {
                    return !isset($fieldData[$key]) || $fieldData[$key] === '';
                }
            )
        );
    }

    private static function requiredError(array $missing)
    {
        $fieldLabels = [
            'post_title'   => __('Post Title', 'bit-integrations'),
            'post_id'      => __('Post ID', 'bit-integrations'),
            'content'      => __('Comment Content', 'bit-integrations'),
            'author_email' => __('Member Email', 'bit-integrations'),
            'email'        => __('Member Email', 'bit-integrations'),
        ];

        $labels = array_map(
            function ($key) use ($fieldLabels) {
                return $fieldLabels[$key] ?? $key;
            },
            $missing
        );

        // translators: %s is the comma separated list of missing field names.
        return self::error(\sprintf(__('These required fields are empty: %s. Map these fields.', 'bit-integrations'), implode(', ', $labels)));
    }

    private static function error($message)
    {
        return ['success' => false, 'message' => $message];
    }
}
