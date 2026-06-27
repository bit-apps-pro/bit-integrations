<?php

namespace BitApps\Integrations\Actions\MasterStudyLms;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;
use STM_LMS_Course;
use STM_LMS_Helpers;
use STM_LMS_Lesson;
use STM_LMS_Quiz;
use STM_LMS_User_Manager_Course_User;
use WP_Error;

class RecordApiHelper
{
    private const COMPLETE_COURSE = 1;

    private const COMPLETE_LESSON = 2;

    private const COMPLETE_QUIZ = 3;

    private const RESET_COURSE = 4;

    private const RESET_LESSON = 5;

    private const ENROLL_USER = 6;

    private const UNENROLL_USER = 7;

    private const MARK_COURSE_COMPLETE = 8;

    private const MARK_LESSON_COMPLETE = 9;

    private $integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->integrationID = $integId;
    }

    public static function complete_course($course_id)
    {
        $user_id = get_current_user_id();
        if (empty($user_id)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('User not logged in', 'bit-integrations'));
        }
        $curriculum = get_post_meta($course_id, 'curriculum', true);

        if (!empty($curriculum)) {
            $curriculum = STM_LMS_Helpers::only_array_numbers(explode(',', $curriculum));

            $curriculum_posts = get_posts(
                [
                    'post__in'       => $curriculum,
                    'posts_per_page' => 999,
                    'post_type'      => ['stm-lessons', 'stm-quizzes'],
                    'post_status'    => 'publish',
                ]
            );

            if (!empty($curriculum_posts)) {
                $course = stm_lms_get_user_course($user_id, $course_id, ['user_course_id']);
                if (!\count($course)) {
                    STM_LMS_Course::add_user_course($course_id, $user_id, STM_LMS_Course::item_url($course_id, ''), 0);
                    STM_LMS_Course::add_student($course_id);
                }

                foreach ($curriculum_posts as $post) {
                    if ('stm-lessons' === $post->post_type) {
                        $lesson_id = $post->ID;

                        if (STM_LMS_Lesson::is_lesson_completed($user_id, $course_id, $lesson_id)) {
                            continue;
                        }

                        $end_time = time();
                        $start_time = get_user_meta($user_id, "stm_lms_course_started_{$course_id}_{$lesson_id}", true);

                        stm_lms_add_user_lesson(compact('user_id', 'course_id', 'lesson_id', 'start_time', 'end_time'));
                        STM_LMS_Course::update_course_progress($user_id, $course_id);

                        do_action('stm_lms_lesson_passed', $user_id, $lesson_id);

                        delete_user_meta($user_id, "stm_lms_course_started_{$course_id}_{$lesson_id}");
                    }

                    if ('stm-quizzes' === $post->post_type) {
                        $quiz_id = $post->ID;

                        if (STM_LMS_Quiz::quiz_passed($quiz_id, $user_id)) {
                            continue;
                        }

                        $progress = 100;
                        $status = 'passed';
                        $user_quiz = compact('user_id', 'course_id', 'quiz_id', 'progress', 'status');
                        stm_lms_add_user_quiz($user_quiz);
                        stm_lms_get_delete_user_quiz_time($user_id, $quiz_id);

                        STM_LMS_Course::update_course_progress($user_id, $course_id);

                        $user_quiz['progress'] = round($user_quiz['progress'], 1);
                        do_action('stm_lms_quiz_' . $status, $user_id, $quiz_id, $user_quiz['progress']);
                    }
                }
            }

            return true;
        }

        return false;
    }

    public static function complete_lesson($course_id, $lesson_id)
    {
        $curriculum = get_post_meta($course_id, 'curriculum', true);
        $user_id = get_current_user_id();
        if (!empty($curriculum)) {
            $curriculum = STM_LMS_Helpers::only_array_numbers(explode(',', $curriculum));

            $curriculum_posts = get_posts(
                [
                    'post__in'       => $curriculum,
                    'posts_per_page' => 999,
                    'post_type'      => ['stm-lessons', 'stm-quizzes'],
                    'post_status'    => 'publish',
                ]
            );

            if (!empty($curriculum_posts)) {
                $curriculum = get_post_meta($course_id, 'curriculum', true);

                if (empty($curriculum)) {
                    return false;
                }
                $curriculum = explode(',', $curriculum);

                foreach ($curriculum as $item_id) {
                    $item_type = get_post_type($item_id);

                    if ($item_type === 'stm-lessons') {
                        if ($item_id == $lesson_id) {
                            if (STM_LMS_Lesson::is_lesson_completed($user_id, $course_id, $lesson_id)) {
                                continue;
                            }

                            $end_time = time();
                            $start_time = get_user_meta($user_id, "stm_lms_course_started_{$course_id}_{$lesson_id}", true);

                            stm_lms_add_user_lesson(compact('user_id', 'course_id', 'lesson_id', 'start_time', 'end_time'));
                            STM_LMS_Course::update_course_progress($user_id, $course_id);

                            do_action('stm_lms_lesson_passed', $user_id, $lesson_id);

                            delete_user_meta($user_id, "stm_lms_course_started_{$course_id}_{$lesson_id}");
                        }
                    }
                }

                STM_LMS_Course::update_course_progress($user_id, $course_id);

                return true;
            }

            return false;
        }
    }

    public static function complete_quiz($course_id, $quiz_id)
    {
        $user_id = get_current_user_id();
        $curriculum = get_post_meta($course_id, 'curriculum', true);

        if (!empty($curriculum)) {
            $curriculum = STM_LMS_Helpers::only_array_numbers(explode(',', $curriculum));

            $curriculum_posts = get_posts(
                [
                    'post__in'       => $curriculum,
                    'posts_per_page' => 999,
                    'post_type'      => ['stm-lessons', 'stm-quizzes'],
                    'post_status'    => 'publish',
                ]
            );

            if (!empty($curriculum_posts)) {
                $curriculum = get_post_meta($course_id, 'curriculum', true);

                if (empty($curriculum)) {
                    return false;
                }
                $curriculum = explode(',', $curriculum);

                foreach ($curriculum as $item_id) {
                    $item_type = get_post_type($item_id);

                    if ($item_type === 'stm-quizzes') {
                        if ($item_id == $quiz_id) {
                            if (STM_LMS_Quiz::quiz_passed($quiz_id, $user_id)) {
                                continue;
                            }

                            $progress = 100;
                            $status = 'passed';
                            $user_quiz = compact('user_id', 'course_id', 'quiz_id', 'progress', 'status');
                            stm_lms_add_user_quiz($user_quiz);
                            stm_lms_get_delete_user_quiz_time($user_id, $quiz_id);

                            STM_LMS_Course::update_course_progress($user_id, $course_id);

                            $user_quiz['progress'] = round($user_quiz['progress'], 1);
                            do_action('stm_lms_quiz_' . $status, $user_id, $quiz_id, $user_quiz['progress']);
                        }
                    }
                }

                STM_LMS_Course::update_course_progress($user_id, $course_id);

                return true;
            }

            return false;
        }
    }

    public static function reset_course($course_id)
    {
        $curriculum = get_post_meta($course_id, 'curriculum', true);
        $user_id = get_current_user_id();

        if (!empty($curriculum)) {
            $curriculum = STM_LMS_Helpers::only_array_numbers(explode(',', $curriculum));

            $curriculum_posts = get_posts(
                [
                    'post__in'       => $curriculum,
                    'posts_per_page' => 999,
                    'post_type'      => ['stm-lessons', 'stm-quizzes'],
                    'post_status'    => 'publish',
                ]
            );

            if (!empty($curriculum_posts)) {
                $curriculum = get_post_meta($course_id, 'curriculum', true);

                if (empty($curriculum)) {
                    return false;
                }
                $curriculum = explode(',', $curriculum);

                foreach ($curriculum as $item_id) {
                    $item_type = get_post_type($item_id);

                    if ($item_type === 'stm-lessons') {
                        // self::complete_lesson($student_id, $course_id, $item_id);
                        STM_LMS_User_Manager_Course_User::reset_lesson($user_id, $course_id, $item_id);
                    } elseif ($item_type === 'stm-assignments') {
                        STM_LMS_User_Manager_Course_User::reset_assignment($user_id, $course_id, $item_id);
                    } elseif ($item_type === 'stm-quizzes') {
                        STM_LMS_User_Manager_Course_User::reset_quiz($user_id, $course_id, $item_id);
                    }
                }

                STM_LMS_Course::update_course_progress($user_id, $course_id);

                return true;
            }
        }

        return false;
    }

    public static function reset_lesson($course_id, $lesson_id)
    {
        $user_id = get_current_user_id();
        $curriculum = get_post_meta($course_id, 'curriculum', true);

        if (! empty($curriculum)) {
            $curriculum = STM_LMS_Helpers::only_array_numbers(explode(',', $curriculum));

            $curriculum_posts = get_posts(
                [
                    'post__in'       => $curriculum,
                    'posts_per_page' => 999,
                    'post_type'      => ['stm-lessons', 'stm-quizzes'],
                    'post_status'    => 'publish',
                ]
            );

            if (! empty($curriculum_posts)) {
                $curriculum = get_post_meta($course_id, 'curriculum', true);

                if (empty($curriculum)) {
                    return false;
                }
                $curriculum = explode(',', $curriculum);

                foreach ($curriculum as $item_id) {
                    $item_type = get_post_type($item_id);

                    if ($item_type === 'stm-lessons') {
                        if ($item_id == $lesson_id) {
                            STM_LMS_User_Manager_Course_User::reset_lesson($user_id, $course_id, $item_id);
                        }
                    }
                }

                STM_LMS_Course::update_course_progress($user_id, $course_id);

                return true;
            }

            return false;
        }
    }

    public function execute(
        $mainAction,
        $fieldValues,
        $integrationDetails,
        $integrationData
    ) {
        $response = [];
        $fieldData = static::generateReqDataFromFieldMap($integrationDetails->field_map ?? [], $fieldValues);

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        if ((int) $mainAction === self::COMPLETE_COURSE) {
            $courseId = $integrationDetails->courseId;
            $response = self::complete_course($courseId);
            if ($response) {
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'course-complete', 'type_name' => 'user-course-complete']), 'success', __('Course completed successfully', 'bit-integrations'));
            } else {
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'course-complete', 'type_name' => 'user-course-complete']), 'error', __('Failed to completed course', 'bit-integrations'));
            }
        } elseif ((int) $mainAction === self::COMPLETE_LESSON) {
            $courseId = $integrationDetails->courseId;
            $lessonId = $integrationDetails->lessonId;
            $response = self::complete_lesson($courseId, $lessonId);
            if ($response) {
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'lesson-complete', 'type_name' => 'user-lesson-complete']), 'success', __('Lesson completed successfully', 'bit-integrations'));
            } else {
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'lesson-complete', 'type_name' => 'user-lesson-complete']), 'error', __('Failed to completed lesson', 'bit-integrations'));
            }
        } elseif ((int) $mainAction === self::COMPLETE_QUIZ) {
            $courseId = $integrationDetails->courseId;
            $quizId = $integrationDetails->quizId;
            $response = self::complete_quiz($courseId, $quizId);
            if ($response) {
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'quiz-complete', 'type_name' => 'user-quiz-complete']), 'success', __('quiz completed successfully', 'bit-integrations'));
            } else {
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'quiz-complete', 'type_name' => 'user-quiz-complete']), 'error', __('Failed to completed quiz', 'bit-integrations'));
            }
        } elseif ((int) $mainAction === self::RESET_COURSE) {
            $courseId = $integrationDetails->courseId;
            $response = self::reset_course($courseId);
            if ($response) {
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'course-reset', 'type_name' => 'user-course-reset']), 'success', __('Course reset successfully', 'bit-integrations'));
            } else {
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'course-reset', 'type_name' => 'user-course-reset']), 'error', __('Failed to reset course', 'bit-integrations'));
            }
        } elseif ((int) $mainAction === self::RESET_LESSON) {
            $course_id = $integrationDetails->courseId;
            $lesson_id = $integrationDetails->lessonId;
            $response = self::reset_lesson($course_id, $lesson_id);
            if ($response) {
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'lesson-reset', 'type_name' => 'user-lesson-reset']), 'success', __('Lesson reset successfully', 'bit-integrations'));
            } else {
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'lesson-reset', 'type_name' => 'user-lesson-reset']), 'error', __('Failed to reset lesson', 'bit-integrations'));
            }
        } elseif ((int) $mainAction === self::ENROLL_USER) {
            if (empty($fieldData['user_email'])) {
                return new WP_Error('REQ_FIELD_EMPTY', __('User email is required', 'bit-integrations'));
            }
            $response = Hooks::apply(Config::withPrefix('master_study_lms_enroll_user'), $defaultResponse, [
                'course_id' => $integrationDetails->courseId ?? null,
                'email'     => $fieldData['user_email'],
            ]);
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'enroll-user', 'type_name' => 'enroll-user-to-course']), (\is_array($response) && !empty($response['success'])) ? 'success' : 'error', \is_array($response) ? ($response['message'] ?? '') : '');
        } elseif ((int) $mainAction === self::UNENROLL_USER) {
            if (empty($fieldData['user_email'])) {
                return new WP_Error('REQ_FIELD_EMPTY', __('User email is required', 'bit-integrations'));
            }
            $response = Hooks::apply(Config::withPrefix('master_study_lms_unenroll_user'), $defaultResponse, [
                'course_id' => $integrationDetails->courseId ?? null,
                'email'     => $fieldData['user_email'],
            ]);
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'unenroll-user', 'type_name' => 'unenroll-user-from-course']), (\is_array($response) && !empty($response['success'])) ? 'success' : 'error', \is_array($response) ? ($response['message'] ?? '') : '');
        } elseif ((int) $mainAction === self::MARK_COURSE_COMPLETE) {
            if (empty($fieldData['user_email'])) {
                return new WP_Error('REQ_FIELD_EMPTY', __('User email is required', 'bit-integrations'));
            }
            $response = Hooks::apply(Config::withPrefix('master_study_lms_mark_course_complete'), $defaultResponse, [
                'course_id' => $integrationDetails->courseId ?? null,
                'email'     => $fieldData['user_email'],
            ]);
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'mark-course-complete', 'type_name' => 'mark-course-complete-for-user']), (\is_array($response) && !empty($response['success'])) ? 'success' : 'error', \is_array($response) ? ($response['message'] ?? '') : '');
        } elseif ((int) $mainAction === self::MARK_LESSON_COMPLETE) {
            if (empty($fieldData['user_email'])) {
                return new WP_Error('REQ_FIELD_EMPTY', __('User email is required', 'bit-integrations'));
            }
            $response = Hooks::apply(Config::withPrefix('master_study_lms_mark_lesson_complete'), $defaultResponse, [
                'course_id' => $integrationDetails->courseId ?? null,
                'lesson_id' => $integrationDetails->lessonId ?? null,
                'email'     => $fieldData['user_email'],
            ]);
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'mark-lesson-complete', 'type_name' => 'mark-lesson-complete-for-user']), (\is_array($response) && !empty($response['success'])) ? 'success' : 'error', \is_array($response) ? ($response['message'] ?? '') : '');
        }

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $data = [];

        foreach ($fieldMap as $map) {
            if (empty($map->msLmsFormField)) {
                continue;
            }

            $formField = $map->formField ?? '';

            if ($formField === 'custom' && isset($map->customValue)) {
                $data[$map->msLmsFormField] = Common::replaceFieldWithValue($map->customValue, $fieldValues);
            } else {
                $data[$map->msLmsFormField] = $fieldValues[$formField] ?? '';
            }
        }

        return $data;
    }
}
