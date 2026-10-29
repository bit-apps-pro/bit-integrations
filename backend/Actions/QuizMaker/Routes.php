<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\QuizMaker\QuizMakerHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('quiz_maker_authorize', [QuizMakerHelper::class, 'quizMakerAuthorize']);
Route::post('refresh_quiz_maker_quiz_categories', [QuizMakerHelper::class, 'refreshQuizCategories']);
Route::post('refresh_quiz_maker_question_categories', [QuizMakerHelper::class, 'refreshQuestionCategories']);
Route::post('refresh_quiz_maker_questions', [QuizMakerHelper::class, 'refreshQuestions']);
Route::post('refresh_quiz_maker_users', [QuizMakerHelper::class, 'refreshUsers']);
