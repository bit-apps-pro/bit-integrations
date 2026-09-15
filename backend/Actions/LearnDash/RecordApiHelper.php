<?php

/**
 * trello Record Api
 */

namespace BitApps\Integrations\Actions\LearnDash;

use BitApps\Integrations\Actions\Mail\MailController;
use BitApps\Integrations\Core\Util\ActionUser;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Post;
use BitApps\Integrations\Log\LogHandler;
use LDLMS_DB;

class RecordApiHelper
{
    private static $integrationID;

    private $_integrationDetails;

    private $quiz_list;

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
            $actionValue = $value->learnDeshFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public static function createGroup(
        $finalData,
        $courseIds,
        $userRole,
        $user_id
    ) {
        $group_title = $finalData['title'];

        $ld_group_args = [
            'post_type' => 'groups',
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- Using external plugin hook for compatibility
            'post_status'  => apply_filters('uo_create_new_group_status', 'publish'),
            'post_title'   => $group_title,
            'post_content' => '',
            'post_author'  => $user_id,
        ];

        $group_id = wp_insert_post($ld_group_args);
        if (is_wp_error($group_id)) {
            return;
        }

        $user = get_user_by('ID', $user_id);

        switch ($userRole) {
            case '2':
                $user->add_role('group_leader');

                break;
            case '3':
                $user->set_role('group_leader');

                break;
        }
        ld_update_leader_group_access($user_id, $group_id);

        $group_courses = explode(',', $courseIds);

        if (!empty($group_courses)) {
            foreach ($group_courses as $course_id) {
                ld_update_course_group_access((int) $course_id, (int) $group_id, false);
                $transient_key = 'learndash_course_groups_' . $course_id;
                delete_transient($transient_key);
            }
        }

        return $group_id;
    }

    public static function enrollTheUserInACourse($courseIds, $user_id)
    {

        if (!\function_exists('ld_update_course_access')) {
            return __('The function ld_update_course_access does not exist', 'bit-integrations');
        }

        $course_id = $courseIds;

        return ld_update_course_access($user_id, $course_id);
    }

    public static function makeThUserTheLeaderOfGroup($leaderRole, $leaderOfGroup, $user_id)
    {
        $user = get_user_by('ID', $user_id);

        if (is_wp_error($user)) {
            return;
        }

        if (user_can($user, 'group_leader')) {
            ld_update_leader_group_access($user_id, $leaderOfGroup);

            return;
        }

        switch ($leaderRole) {
            case '2':
                $user->add_role('group_leader');
                $apiResponse = ld_update_leader_group_access($user_id, $leaderOfGroup);

                break;
            case '3':
                $user->set_role('group_leader');
                $apiResponse = ld_update_leader_group_access($user_id, $leaderOfGroup);

                break;
        }

        return $apiResponse;
    }

    public static function mark_quiz_complete($user_id, $course_id = null)
    {
        $quizzes = learndash_get_course_quiz_list($course_id, $user_id);
        if ($quizzes) {
            foreach ($quizzes as $quiz) {
                $quiz_list[$quiz['post']->ID] = 0;
            }
        }
        $quizz_progress = [];
        if (!empty($quiz_list)) {
            $usermeta = get_user_meta($user_id, '_sfwd-quizzes', true);
            $quizz_progress = empty($usermeta) ? [] : $usermeta;

            foreach ($quiz_list as $quiz_id => $quiz) {
                $quiz_meta = get_post_meta($quiz_id, '_sfwd-quiz', true);

                if (learndash_is_quiz_complete($user_id, $quiz_id, $course_id)) {
                    continue;
                }

                $quizdata = [
                    'quiz'             => $quiz_id,
                    'score'            => 0,
                    'count'            => 0,
                    'pass'             => true,
                    'rank'             => '-',
                    'time'             => time(),
                    'pro_quizid'       => $quiz_meta['sfwd-quiz_quiz_pro'],
                    'course'           => $course_id,
                    'points'           => 0,
                    'total_points'     => 0,
                    'percentage'       => 100,
                    'timespent'        => 0,
                    'has_graded'       => false,
                    'statistic_ref_id' => 0,
                    'm_edit_by'        => 9999999,
                    'm_edit_time'      => time(),
                ];

                $quizz_progress[] = $quizdata;

                if ($quizdata['pass'] == true) {
                    $quizdata_pass = true;
                } else {
                    $quizdata_pass = false;
                }

                learndash_update_user_activity(
                    [
                        'course_id'          => $course_id,
                        'user_id'            => $user_id,
                        'post_id'            => $quiz_id,
                        'activity_type'      => 'quiz',
                        'activity_action'    => 'insert',
                        'activity_status'    => true,
                        'activity_started'   => $quizdata['time'],
                        'activity_completed' => $quizdata['time'],
                        'activity_meta'      => $quizdata,
                    ]
                );
            }
        }

        if (!empty($quizz_progress)) {
            update_user_meta($user_id, '_sfwd-quizzes', $quizz_progress);
        }
    }

    public static function mark_topics_done($user_id, $lesson_id, $course_id)
    {
        $topic_list = learndash_get_topic_list($lesson_id, $course_id);
        if ($topic_list) {
            foreach ($topic_list as $topic) {
                learndash_process_mark_complete($user_id, $topic->ID, false, $course_id);
                $topic_quiz_list = learndash_get_lesson_quiz_list($topic->ID, $user_id, $course_id);
                if ($topic_quiz_list) {
                    foreach ($topic_quiz_list as $ql) {
                        $quiz_list[$ql['post']->ID] = 0;
                    }
                }
            }
        }
    }

    public static function mark_steps_done($user_id, $course_id)
    {
        $lessons = learndash_get_lesson_list($course_id, ['num' => 0]);
        foreach ($lessons as $lesson) {
            self::mark_topics_done($user_id, $lesson->ID, $course_id);
            $lesson_quiz_list = learndash_get_lesson_quiz_list($lesson->ID, $user_id, $course_id);

            if ($lesson_quiz_list) {
                foreach ($lesson_quiz_list as $ql) {
                    $quiz_list[$ql['post']->ID] = 0;
                }
            }

            learndash_process_mark_complete($user_id, $lesson->ID, false, $course_id);
        }

        self::mark_quiz_complete($user_id, $course_id);
    }

    public static function markACourseCompleteForTheUser($courseIds, $user_id)
    {
        $course_id = $courseIds;
        self::mark_steps_done($user_id, $course_id);

        return learndash_process_mark_complete($user_id, $course_id);
    }

    // action 6 and 1st part
    public static function courseLessonComplete(
        $courseIds,
        $lessonId,
        $user_id
    ) {

        return self::mark_steps_done_for_six($user_id, $lessonId, $courseIds);
    }

    public static function mark_steps_done_for_six($user_id, $lesson_id, $course_id)
    {
        $topic_list = learndash_get_topic_list($lesson_id, $course_id);

        if ($topic_list) {
            foreach ($topic_list as $topic) {
                $topic_quiz_list = learndash_get_lesson_quiz_list($topic->ID, $user_id, $course_id);
                if ($topic_quiz_list) {
                    foreach ($topic_quiz_list as $ql) {
                        $quiz_list[$ql['post']->ID] = 0;
                    }
                }

                self::mark_quiz_complete($user_id, $course_id);

                learndash_process_mark_complete($user_id, $topic->ID, false, $course_id);
            }
        }

        $lesson_quiz_list = learndash_get_lesson_quiz_list($lesson_id, $user_id, $course_id);

        if ($lesson_quiz_list) {
            foreach ($lesson_quiz_list as $ql) {
                self::$quiz_list[$ql['post']->ID] = 0;
            }
        }

        self::mark_quiz_complete($user_id, $course_id);

        return learndash_process_mark_complete($user_id, $lesson_id, false, $course_id);
    }

    public static function topicComplete(
        $course_id,
        $lessonId,
        $topic_id,
        $user_id
    ) {
        $topic_quiz_list = learndash_get_lesson_quiz_list($topic_id, $user_id, $course_id);
        if ($topic_quiz_list) {
            foreach ($topic_quiz_list as $ql) {
                $quiz_list[$ql['post']->ID] = 0;
            }
        }

        self::mark_quiz_complete($user_id, $course_id);

        return learndash_process_mark_complete($user_id, $topic_id, false, $course_id);
    }

    public static function addUserToGroup($group_id, $user_id)
    {
        $check_group = learndash_validate_groups([$group_id]);
        if (empty($check_group)) {
            LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'group', 'type_name' => 'Add-the-user-to-a-group']), 'error', wp_json_encode(__('Group not found', 'bit-integrations')));
        }

        return ld_update_group_access($user_id, $group_id);
    }

    public function courseLessonNotComplete(
        $course_id,
        $lesson_id,
        $user_id
    ) {

        $this->mark_steps_incomplete($user_id, $lesson_id, $course_id);

        learndash_process_mark_incomplete($user_id, $course_id, $lesson_id, false);
    }

    public function mark_steps_incomplete($user_id, $lesson_id, $course_id)
    {
        $topic_list = learndash_get_topic_list($lesson_id, $course_id);

        if ($topic_list) {
            foreach ($topic_list as $topic) {
                learndash_process_mark_incomplete($user_id, $course_id, $topic->ID, false);
                $topic_quiz_list = learndash_get_lesson_quiz_list($topic->ID, $user_id, $course_id);
                if ($topic_quiz_list) {
                    foreach ($topic_quiz_list as $ql) {
                        learndash_delete_quiz_progress($user_id, $ql['post']->ID);
                    }
                }
            }
        }

        $lesson_quiz_list = learndash_get_lesson_quiz_list($lesson_id, $user_id, $course_id);

        if ($lesson_quiz_list) {
            foreach ($lesson_quiz_list as $ql) {
                learndash_delete_quiz_progress($user_id, $ql['post']->ID);
            }
        }
    }

    public static function mark_quiz_incomplete($user_id, $course_id = null)
    {
        if (!empty($quiz_list)) {
            foreach ($quiz_list as $quiz_id => $quiz) {
                learndash_delete_quiz_progress($user_id, $quiz_id);
            }
        }
    }

    public static function topicNotComplete(
        $course_id,
        $lessonId,
        $topic_id,
        $user_id
    ) {

        $topic_quiz_list = learndash_get_lesson_quiz_list($topic_id, $user_id, $course_id);
        if ($topic_quiz_list) {
            foreach ($topic_quiz_list as $ql) {
                $quiz_list[$ql['post']->ID] = 0;
            }
        }

        self::mark_quiz_incomplete($user_id, $course_id);

        return learndash_process_mark_incomplete($user_id, $course_id, $topic_id, false);
    }

    public static function removeUserToGroup($group_id, $user_id)
    {
        if ('-1' !== $group_id) {
            $apiResponse = ld_update_group_access($user_id, $group_id, true);
        } else {
            $all_groups_list = learndash_get_users_group_ids($user_id);
            foreach ($all_groups_list as $group_id) {
                $apiResponse = ld_update_group_access($user_id, $group_id, true);
            }
        }

        return $apiResponse;
    }

    public function resetQuiz($quiz_id, $user_id)
    {

        if ('-1' !== $quiz_id) {
            self::delete_quiz_progress($user_id, $quiz_id);
        }
    }

    public static function delete_quiz_progress($user_id, $quiz_id = null)
    {
        global $wpdb;

        if (!empty($quiz_id)) {
            $usermeta = get_user_meta($user_id, '_sfwd-quizzes', true);
            $quizz_progress = empty($usermeta) ? [] : $usermeta;
            foreach ($quizz_progress as $k => $p) {
                if ((int) $p['quiz'] !== (int) $quiz_id) {
                    continue;
                }
                $statistic_ref_id = $p['statistic_ref_id'];
                unset($quizz_progress[$k]);
                if (!empty($statistic_ref_id)) {
                    if (class_exists('\LDLMS_DB')) {
                        $pro_quiz_stat_table = esc_sql(LDLMS_DB::get_table_name('quiz_statistic'));
                        $pro_quiz_stat_ref_table = esc_sql(LDLMS_DB::get_table_name('quiz_statistic_ref'));
                    } else {
                        $pro_quiz_stat_table = esc_sql($wpdb->prefix . 'wp_pro_quiz_statistic');
                        $pro_quiz_stat_ref_table = esc_sql($wpdb->prefix . 'wp_pro_quiz_statistic_ref');
                    }

                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name cannot be parameterized
                    $wpdb->query($wpdb->prepare("DELETE FROM {$pro_quiz_stat_table} WHERE statistic_ref_id = %d", $statistic_ref_id));
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name cannot be parameterized
                    $wpdb->query($wpdb->prepare("DELETE FROM {$pro_quiz_stat_ref_table} WHERE statistic_ref_id = %d", $statistic_ref_id));
                }
            }
            $apiResponse = update_user_meta($user_id, '_sfwd-quizzes', $quizz_progress);

            return $apiResponse;
        }

        return false;
    }

    public function UnenrollUserFromCourse($course_id, $user_id)
    {
        $apiResponse = false;

        if ('any' === $course_id) {
            $user_courses = learndash_user_get_enrolled_courses($user_id);
            foreach ($user_courses as $course_id) {
                $apiResponse = ld_update_course_access($user_id, $course_id, true);
            }
        } else {
            $apiResponse = ld_update_course_access($user_id, $course_id, true);
        }

        return $apiResponse;
    }

    public static function removeGroupLeaderAndChildren($group_id, $user_id)
    {
        if (!self::is_group_hierarchy_enabled()) {
            $error_message = 'The LearnDash Group hierarchy setting is not enabled.';
            LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'group', 'type_name' => 'remove-leader-from-group']), 'error', wp_json_encode($error_message));

            return;
        }

        $all_hierarchy_groups = self::get_group_children_in_an_action($group_id, 1, []);
        $all_hierarchy_groups[] = $group_id;
        $all_groups_list = learndash_get_administrators_group_ids($user_id, true);
        $common = array_intersect($all_hierarchy_groups, $all_groups_list);

        if (!$common) {
            $error_message = 'The Group Leader is not an admin of any of the groups in hierarchy.';
            LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'group', 'type_name' => 'remove-leader-from-group']), 'error', wp_json_encode($error_message));

            return;
        }
        foreach ($common as $group_id) {
            $apiResponse = ld_update_leader_group_access($user_id, $group_id, true);
        }

        return $apiResponse;
    }

    public static function is_group_hierarchy_enabled()
    {
        $settings = get_option('learndash_settings_groups_management_display');
        if (empty($settings)) {
            return false;
        }
        if (!isset($settings['group_hierarchical_enabled'])) {
            return false;
        }

        return ! ('yes' !== $settings['group_hierarchical_enabled'])

        ;
    }

    public static function get_group_children_in_an_action($parent_id, $depth = 1, $groups = [])
    {
        $args = [
            'post_type'      => 'groups',
            'posts_per_page' => 9999,
            'orderby'        => 'title',
            'order'          => 'ASC',
            'post_status'    => 'publish',
            'post_parent'    => $parent_id,
        ];
        $results = Post::all($args);
        if ($results) {
            foreach ($results as $r) {
                $group_id = $r->ID;
                $groups[] = $group_id;
                $ld_children = learndash_get_group_children($group_id);
                $groups = array_merge($groups, $ld_children);
                self::get_group_children_in_an_action($r->ID, ++$depth, $groups);
            }
        }
        if (empty($groups)) {
            return [];
        }
        $ld_children = learndash_get_group_children($parent_id);

        return array_unique(array_merge($groups, $ld_children));
    }

    public static function removeUserAndChildrenFromGroup($group_id, $user_id)
    {

        if (!self::is_group_hierarchy_enabled()) {
            $error_message = 'The LearnDash Group hierarchy setting is not enabled.';
            LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'group', 'type_name' => 'remove-user-from-group']), 'error', wp_json_encode($error_message));

            return;
        }
        $all_hierarchy_groups = self::get_group_children_in_an_action($group_id, 1, []);
        $all_hierarchy_groups[] = $group_id;
        $all_current_user_groups = learndash_get_users_group_ids($user_id, true);
        $common = array_intersect($all_hierarchy_groups, $all_current_user_groups);
        if (!$common) {
            $error_message = 'The user does not belong to any of the groups in the hierarchy.';
            LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'group', 'type_name' => 'remove-user-from-group']), 'error', wp_json_encode($error_message));

            return;
        }
        foreach ($common as $group_id) {
            $apiResponse = ld_update_group_access($user_id, $group_id, true);
        }

        return $apiResponse;
    }

    public static function resetUserProgressInCourse($course_id, $user_id)
    {
        $reset_tc_data = false;

        if ('-1' !== $course_id) {
            self::delete_user_activity($user_id, $course_id);
            if (self::delete_course_progress($user_id, $course_id)) {
                self::reset_quiz_progress($user_id, $course_id);
                self::delete_assignments();
            }
            $apiResponse = self::reset_quiz_progress($user_id, $course_id);
        }

        return $apiResponse;
    }

    public static function delete_user_activity($user_id, $course_id)
    {
        global $wpdb;
        delete_user_meta($user_id, 'completed_' . $course_id);
        delete_user_meta($user_id, 'course_completed_' . $course_id);
        delete_user_meta($user_id, 'learndash_course_expired_' . $course_id);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for LearnDash activity
        $activity_ids = $wpdb->get_results($wpdb->prepare("SELECT activity_id FROM {$wpdb->prefix}learndash_user_activity WHERE course_id = %d AND user_id = %d", $course_id, $user_id));

        if ($activity_ids) {
            foreach ($activity_ids as $activity_id) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->query($wpdb->prepare("DELETE FROM  {$wpdb->prefix}learndash_user_activity_meta WHERE activity_id = %d", $activity_id->activity_id));
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->prefix}learndash_user_activity WHERE activity_id = %d", $activity_id->activity_id));
            }
        }
    }

    public static function delete_course_progress($user_id, $course_id)
    {
        $usermeta = get_user_meta($user_id, '_sfwd-course_progress', true);
        if (!empty($usermeta) && isset($usermeta[$course_id])) {
            unset($usermeta[$course_id]);
            update_user_meta($user_id, '_sfwd-course_progress', $usermeta);

            return true;
        }

        return false;
    }

    public static function reset_quiz_progress($user_id, $course_id)
    {
        $lessons = learndash_get_lesson_list($course_id, ['num' => 0]);
        foreach ($lessons as $lesson) {
            self::get_topics_quiz($user_id, $lesson->ID, $course_id);
            $lesson_quiz_list = learndash_get_lesson_quiz_list($lesson->ID, $user_id, $course_id);

            if ($lesson_quiz_list) {
                foreach ($lesson_quiz_list as $ql) {
                    $quiz_list[$ql['post']->ID] = 0;
                }
            }

            $assignments = Post::all([
                'post_type'      => 'sfwd-assignment',
                'post_status'    => 'publish',
                'posts_per_page' => 999,
                // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Required to match LearnDash assignment meta to course/lesson/user.
                'meta_query' => [
                    'relation' => 'AND',
                    [
                        'key'     => 'lesson_id',
                        'value'   => $lesson->ID,
                        'compare' => '=',
                    ],
                    [
                        'key'     => 'course_id',
                        'value'   => $course_id,
                        'compare' => '=',
                    ],
                    [
                        'key'     => 'user_id',
                        'value'   => $user_id,
                        'compare' => '=',
                    ],
                ],
            ]);

            if ($assignments) {
                foreach ($assignments as $assignment) {
                    $assignment_list[] = $assignment->ID;
                }
            }
        }

        self::delete_quiz_progress($user_id, $course_id);
    }

    public static function get_topics_quiz($user_id, $lesson_id, $course_id)
    {
        $topic_list = learndash_get_topic_list($lesson_id, $course_id);
        if ($topic_list) {
            foreach ($topic_list as $topic) {
                $topic_quiz_list = learndash_get_lesson_quiz_list($topic->ID, $user_id, $course_id);
                if ($topic_quiz_list) {
                    foreach ($topic_quiz_list as $ql) {
                        $quiz_list[$ql['post']->ID] = 0;
                    }
                }

                $assignments = Post::all([
                    'post_type'      => 'sfwd-assignment',
                    'post_status'    => 'publish',
                    'posts_per_page' => 999,
                    // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Required to match LearnDash topic assignment meta to course/topic/user.
                    'meta_query' => [
                        'relation' => 'AND',
                        [
                            'key'     => 'lesson_id',
                            'value'   => $topic->ID,
                            'compare' => '=',
                        ],
                        [
                            'key'     => 'course_id',
                            'value'   => $course_id,
                            'compare' => '=',
                        ],
                        [
                            'key'     => 'user_id',
                            'value'   => $user_id,
                            'compare' => '=',
                        ],
                    ],
                ]);

                if ($assignments) {
                    foreach ($assignments as $assignment) {
                        $assignment_list[] = $assignment->ID;
                    }
                }
            }
        }
    }

    public static function delete_assignments()
    {
        global $wpdb;
        $assignments = self::getAssignmentList();
        if ($assignments) {
            foreach ($assignments as $assignment) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct queries needed for LearnDash assignments
                $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->posts} WHERE ID = %d", $assignment));
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->postmeta} WHERE post_id = %d", $assignment));
            }
        }
    }

    public function sendMailToGroupLeader($integrationData, $fieldValues)
    {
        $mailInstance = new MailController();

        return $mailInstance->execute($integrationData, $fieldValues);
    }

    public function execute(
        $mainAction,
        $fieldValues,
        $integrationDetails,
        $integrationData
    ) {
        $fieldData = [];

        $userId = ActionUser::resolve($integrationDetails, $fieldValues);

        if (is_wp_error($userId)) {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'resolve-user', 'type_name' => 'resolve-user']), 'error', wp_json_encode($userId->get_error_message()));

            return $userId;
        }

        if ($mainAction === '1') {
            $userRole = $integrationDetails->userRole;
            $fieldMap = $integrationDetails->field_map;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $courseIds = $integrationDetails->courseId;
            $apiResponse = self::createGroup(
                $finalData,
                $courseIds,
                $userRole,
                $userId
            );
            if (is_wp_error($apiResponse)) {
                $error_message = $apiResponse->get_error_message();
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'create-group']), 'error', wp_json_encode($error_message));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'create-group']), 'success', wp_json_encode($apiResponse));
            }
        }

        if ($mainAction === '2') {
            $groupId = $integrationDetails->groupId;
            $apiResponse = self::addUserToGroup($groupId, $userId);
            if (is_wp_error($apiResponse)) {
                $error_message = $apiResponse->get_error_message();
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Add-the-user-to-a-group']), 'error', wp_json_encode($error_message));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Add-the-user-to-a-group']), 'success', wp_json_encode($apiResponse));
            }
        }

        if ($mainAction === '3') {
            $courseIds = $integrationDetails->courseId;

            $apiResponse = self::enrollTheUserInACourse($courseIds, $userId);
            if (is_wp_error($apiResponse)) {
                $error_message = $apiResponse->get_error_message();
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'enroll-user-in-course']), 'error', wp_json_encode($error_message));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'enroll-user-in-course']), 'success', wp_json_encode($apiResponse));
            }
        }

        if ($mainAction === '4') {
            $leaderRole = $integrationDetails->leaderRole;
            $leaderOfGroup = $integrationDetails->leaderOfGroup;
            $apiResponse = self::makeThUserTheLeaderOfGroup($leaderRole, $leaderOfGroup, $userId);
            if (is_wp_error($apiResponse)) {
                $error_message = $apiResponse->get_error_message();
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Make-the-user-the-leader-of-group']), 'error', wp_json_encode($error_message));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Make-the-user-the-leader-of-group']), 'success', wp_json_encode($apiResponse));
            }
        }
        if ($mainAction === '5') {
            $courseIds = $integrationDetails->courseId;
            $apiResponse = self::markACourseCompleteForTheUser($courseIds, $userId);
            if (is_wp_error($apiResponse)) {
                $error_message = $apiResponse->get_error_message();
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Mark-a-course-complete-for-the-user']), 'error', wp_json_encode($error_message));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Mark-a-course-complete-for-the-user']), 'success', wp_json_encode($apiResponse));
            }
        }

        if ($mainAction === '6') {
            $courseIds = $integrationDetails->courseId;
            $lessonId = $integrationDetails->lessonId;
            $apiResponse = self::courseLessonComplete(
                $courseIds,
                $lessonId,
                $userId
            );

            if (is_wp_error($apiResponse)) {
                $error_message = $apiResponse->get_error_message();
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Mark-a-lesson-complete-for-the-user']), 'error', wp_json_encode($error_message));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Mark-a-lesson-complete-for-the-user']), 'success', wp_json_encode($apiResponse));
            }
        }
        if ($mainAction === '7') {
            $courseIds = $integrationDetails->courseId;
            $lessonId = $integrationDetails->lessonId;
            $apiResponse = self::courseLessonNotComplete(
                $courseIds,
                $lessonId,
                $userId
            );

            if (is_wp_error($apiResponse)) {
                $error_message = __('failed lesson not complete', 'bit-integrations');
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Mark-a-lesson-complete-for-the-user']), 'error', wp_json_encode($error_message));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Mark-a-lesson-complete-for-the-user']), 'success', wp_json_encode($apiResponse));
            }
        }

        if ($mainAction === '8') {
            $courseIds = $integrationDetails->courseId;
            $lessonId = $integrationDetails->lessonId;
            $topicId = $integrationDetails->topicId;
            $apiResponse = self::topicComplete(
                $courseIds,
                $lessonId,
                $topicId,
                $userId
            );
            if (is_wp_error($apiResponse)) {
                $error_message = $apiResponse->get_error_message();
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'topic-complete-for-the-user']), 'error', wp_json_encode($error_message));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'topic-complete-for-the-user']), 'success', wp_json_encode($apiResponse));
            }
        }
        if ($mainAction === '9') {
            $courseIds = $integrationDetails->courseId;
            $lessonId = $integrationDetails->lessonId;
            $topicId = $integrationDetails->topicId;
            $apiResponse = self::topicNotComplete(
                $courseIds,
                $lessonId,
                $topicId,
                $userId
            );
            if (is_wp_error($apiResponse)) {
                $error_message = $apiResponse->get_error_message();
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'topic-not-complete-for-the-user']), 'error', wp_json_encode($error_message));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'topic-not-complete-for-the-user']), 'success', wp_json_encode($apiResponse));
            }
        }

        if ($mainAction === '10') {
            $group_id = $integrationDetails->groupId10;
            $apiResponse = self::removeGroupLeaderAndChildren($group_id, $userId);
            if ($apiResponse) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Remove-Leader-from-group-and-its-children']), 'success', wp_json_encode(__('Remove Leader from group and its children successfully', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Remove-Leader-from-group-and-its-children']), 'error', wp_json_encode(__('Failed to remove leader from group and its children', 'bit-integrations')));
            }
        }

        if ($mainAction === '11') {
            $groupId = $integrationDetails->groupId11;
            $apiResponse = self::removeUserToGroup($groupId, $userId);
            if (is_wp_error($apiResponse)) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Remove-the-user-from-a-group']), 'error', wp_json_encode(__('Fail to remove user from group', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Remove-the-user-from-a-group']), 'success', wp_json_encode(__('User removed from group successfully', 'bit-integrations')));
            }
        }

        if ($mainAction === '12') {
            $group_id = $integrationDetails->groupId12;
            $apiResponse = self::removeUserAndChildrenFromGroup($group_id, $userId);
            if ($apiResponse) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Remove-user-from-group-and-its-children']), 'error', wp_json_encode(__('Remove user from group and its children successfully', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'Remove-user-from-group-and-its-children']), 'success', wp_json_encode(__('Failed to remove user from group and its children', 'bit-integrations')));
            }
        }

        if ($mainAction === '13') {
            $quiz_id = $integrationDetails->quizId;
            $apiResponse = self::resetQuiz($quiz_id, $userId);
            if (is_wp_error($apiResponse)) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'quiz', 'type_name' => 'Reset-users-attempts-for-quiz']), 'error', wp_json_encode(__('Fail to reset quiz', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'quiz', 'type_name' => 'Reset-users-attempts-for-quiz']), 'success', wp_json_encode(__('Quiz reset successfully', 'bit-integrations')));
            }
        }

        if ($mainAction === '14') {
            $courseIds = $integrationDetails->courseId;

            $apiResponse = self::resetUserProgressInCourse($courseIds, $userId);
            if (is_wp_error($apiResponse)) {
                $error_message = $apiResponse->get_error_message();
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'enroll-user-in-course']), 'error', wp_json_encode($error_message));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'enroll-user-in-course']), 'success', wp_json_encode($apiResponse));
            }
        }

        if ($mainAction === '16') {
            $apiResponse = self::sendMailToGroupLeader($integrationData, $fieldValues);
        }

        if ($mainAction === '17') {
            $course_id = $integrationDetails->courseId;
            $apiResponse = self::UnenrollUserFromCourse($course_id, $userId);
            if ($apiResponse) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'quiz', 'type_name' => 'users-unEnroll-course']), 'success', wp_json_encode(__('users-unenroll-course-successfully', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'quiz', 'type_name' => 'users-unEnroll-course']), 'error', wp_json_encode(__('users-unenroll-course-failed', 'bit-integrations')));
            }
        }

        return $apiResponse;
    }
}
