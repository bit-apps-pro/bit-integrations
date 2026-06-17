<?php

namespace BitApps\Integrations\Actions\MasterStudyLms;

class MasterStudyLmsHelper
{
    public static function getLessonByCourse($courseId)
    {
        $args = [
            'post_type'      => 'stm-lessons',
            'posts_per_page' => 999,
            'orderby'        => 'title',
            'order'          => 'ASC',
            'post_status'    => 'publish',
        ];

        return get_posts($args);
    }

    public static function getQuizByCourse($courseId)
    {
        $args = [
            'post_type'      => 'stm-quizzes',
            'posts_per_page' => 999,
            'orderby'        => 'title',
            'order'          => 'ASC',
            'post_status'    => 'publish',
        ];

        return get_posts($args);
    }
}
