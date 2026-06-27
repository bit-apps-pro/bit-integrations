<?php

namespace BitApps\Integrations\Actions\MasterStudyLms;

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
}
