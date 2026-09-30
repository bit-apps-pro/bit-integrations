<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\QuizMaker\QuizMakerController;
use BitApps\Integrations\Core\Util\Route;

Route::post('quiz_maker_authorize', [QuizMakerController::class, 'quizMakerAuthorize']);
Route::post('refresh_quiz_maker_quiz_categories', [QuizMakerController::class, 'refreshQuizCategories']);
Route::post('refresh_quiz_maker_question_categories', [QuizMakerController::class, 'refreshQuestionCategories']);
Route::post('refresh_quiz_maker_questions', [QuizMakerController::class, 'refreshQuestions']);
Route::post('refresh_quiz_maker_users', [QuizMakerController::class, 'refreshUsers']);
