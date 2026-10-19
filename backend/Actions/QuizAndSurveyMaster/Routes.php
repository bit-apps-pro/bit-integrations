<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\QuizAndSurveyMaster\QuizAndSurveyMasterHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('quiz_and_survey_master_authorize', [QuizAndSurveyMasterHelper::class, 'quizAndSurveyMasterAuthorize']);
Route::post('refresh_quiz_and_survey_master_themes', [QuizAndSurveyMasterHelper::class, 'refreshThemes']);
Route::post('refresh_quiz_and_survey_master_question_types', [QuizAndSurveyMasterHelper::class, 'refreshQuestionTypes']);
