<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\QuizAndSurveyMaster\QuizAndSurveyMasterController;
use BitApps\Integrations\Core\Util\Route;

Route::post('quiz_and_survey_master_authorize', [QuizAndSurveyMasterController::class, 'quizAndSurveyMasterAuthorize']);
Route::post('refresh_quiz_and_survey_master_themes', [QuizAndSurveyMasterController::class, 'refreshThemes']);
Route::post('refresh_quiz_and_survey_master_question_types', [QuizAndSurveyMasterController::class, 'refreshQuestionTypes']);
