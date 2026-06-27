<?php

// If try to direct access  plugin folder it will Exit
if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\controller\AuthDataController;
use BitApps\Integrations\controller\IntegrationTagController;
use BitApps\Integrations\controller\PostController;
use BitApps\Integrations\controller\UserController;
use BitApps\Integrations\Core\Util\CustomFuncValidator;
use BitApps\Integrations\Core\Util\Route;
use BitApps\Integrations\Flow\Flow;
use BitApps\Integrations\Log\LogHandler;
use BitApps\Integrations\Triggers\TriggerController;

Route::post('log/get', [LogHandler::class, 'get']);
Route::post('log/delete', [LogHandler::class, 'delete']);

// Trigger Controller
Route::get('trigger/list', [TriggerController::class, 'triggerList']);
Route::post('trigger/test', [TriggerController::class, 'getTestData']);
Route::post('trigger/test/remove', [TriggerController::class, 'removeTestData']);
Route::post('trigger/save-listed', [TriggerController::class, 'saveListedTriggers']);

Route::get('flow/list', [Flow::class, 'flowList']);
Route::post('flow/get', [Flow::class, 'get']);
Route::post('flow/save', [Flow::class, 'save']);
Route::post('flow/update', [Flow::class, 'update']);
Route::post('flow/delete', [Flow::class, 'delete']);
Route::post('flow/bulk-delete', [Flow::class, 'bulkDelete']);
Route::post('flow/toggleStatus', [Flow::class, 'toggle_status']);
Route::post('flow/clone', [Flow::class, 'flowClone']);
Route::get('integration-tags/get', [IntegrationTagController::class, 'get']);
Route::post('integration-tags/save', [IntegrationTagController::class, 'save']);

// Post Content Action e.g. Mail, Telegram, Whatsapp etc.
Route::sanitize_post_content()->post('flow/sanitize_post_content/save', [Flow::class, 'save']);
Route::sanitize_post_content()->post('flow/sanitize_post_content/update', [Flow::class, 'update']);

// Custom Action
Route::no_sanitize()->post('flow/custom-action/save', [Flow::class, 'save']);
Route::no_sanitize()->post('flow/custom-action/update', [Flow::class, 'update']);
Route::no_auth()->ignore_token()->get('custom-action/scrape', [CustomFuncValidator::class, 'scrapeCustomActionFile']);

// Controller
Route::post('customfield/list', [PostController::class, 'getCustomFields']);
Route::get('pods/list', [PostController::class, 'getPodsPostType']);
Route::get('page/list', [PostController::class, 'getPages']);
Route::post('post-types/list', [PostController::class, 'getPostTypes']);
Route::post('post-categories/list', [PostController::class, 'getPostCategories']);
Route::post('pods/fields', [PostController::class, 'getPodsField']);
Route::post('user/list', [UserController::class, 'getWpUsers']);
Route::get('role/list', [UserController::class, 'getUserRoles']);

Route::post('store/authData', [AuthDataController::class, 'saveAuthData']);
Route::get('auth/get', [AuthDataController::class, 'getAuthData']);
Route::get('auth/getbyId', [AuthDataController::class, 'getAuthDataById']);
Route::post('auth/account/delete', [AuthDataController::class, 'deleteAuthData']);
