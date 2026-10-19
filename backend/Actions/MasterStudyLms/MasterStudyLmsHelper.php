<?php

namespace BitApps\Integrations\Actions\MasterStudyLms;

use BitApps\Integrations\Core\Util\Post;

class MasterStudyLmsHelper
{
    public static function getLessonByCourse($courseId)
    {
        return self::getCourseMaterialsByIdAndType($courseId, 'stm-lessons');
    }

    public static function getQuizByCourse($courseId)
    {
        return self::getCourseMaterialsByIdAndType($courseId, 'stm-quizzes');
    }

    public static function getCourseMaterialsByIdAndType($courseId, $postType)
    {
        if (!class_exists('\MasterStudy\Lms\Repositories\CurriculumRepository')) {
            return [];
        }

        $CurriculumRepository = new \MasterStudy\Lms\Repositories\CurriculumRepository();

        $curriculum = $CurriculumRepository->get_curriculum(absint($courseId));

        if (empty($curriculum) || !isset($curriculum['materials'])) {
            return [];
        }

        foreach ($curriculum['materials'] as $material) {
            if ($material['post_type'] === $postType) {
                $posts[] = [
                    'ID'         => $material['post_id'],
                    'post_title' => $material['title'],
                ];
            }
        }

        return $posts ?? [];
    }

    public static function pluginActive()
    {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';

        return (bool) (
            is_plugin_active('masterstudy-lms-learning-management-system/masterstudy-lms-learning-management-system.php')
        || is_plugin_active('masterstudy-lms-learning-management-system-pro/masterstudy-lms-learning-management-system-pro.php')
        );
    }

    public static function getAllCourse()
    {
        if (self::pluginActive()) {
            $courses = Post::all([
                'post_type'      => 'stm-courses',
                'post_status'    => 'publish',
                'posts_per_page' => -1,
            ]);
            $courseList = [];
            foreach ($courses as $course) {
                $courseList[] = [
                    'ID'         => $course->ID,
                    'post_title' => $course->post_title,
                ];
            }
            wp_send_json_success($courseList, 200);
        }
        // translators: %s: Plugin name
        // translators: %s: Placeholder value
        wp_send_json_error(wp_sprintf(__('%s must be activated!', 'bit-integrations'), 'MasterStudyLms'));
    }

    public static function getAllLesson($queryPrarms)
    {
        $courseId = $queryPrarms->courseId;
        if (self::pluginActive()) {
            $allLesson = MasterStudyLmsHelper::getLessonByCourse($courseId);
            wp_send_json_success($allLesson, 200);
        }
        // translators: %s: Plugin name
        // translators: %s: Placeholder value
        wp_send_json_error(wp_sprintf(__('%s must be activated!', 'bit-integrations'), 'MasterStudyLms'));
    }

    public static function getAllQuizByCourse($queryPrarms)
    {
        $courseId = $queryPrarms->courseId;
        if (self::pluginActive()) {
            $allQuiz = MasterStudyLmsHelper::getQuizByCourse($courseId);
            wp_send_json_success($allQuiz, 200);
        }
        // translators: %s: Plugin name
        // translators: %s: Placeholder value
        wp_send_json_error(wp_sprintf(__('%s must be activated!', 'bit-integrations'), 'MasterStudyLms'));
    }
}
