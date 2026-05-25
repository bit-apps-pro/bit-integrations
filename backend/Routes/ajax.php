<?php

// If try to direct access  plugin folder it will Exit
if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\controller\AuthDataController;
use BitApps\Integrations\controller\ConnectionController;
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

// Mail Action
Route::sanitize_post_content()->post('flow/mail/save', [Flow::class, 'save']);
Route::sanitize_post_content()->post('flow/mail/update', [Flow::class, 'update']);

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

// Connection management (encrypted reusable credentials)
Route::get('connections/list', [ConnectionController::class, 'index']);
Route::get('connections/get', [ConnectionController::class, 'getById']);
Route::post('connections/authorize', [ConnectionController::class, 'authorize']);
Route::post('connections/oauth2/exchange', [ConnectionController::class, 'oauth2Exchange']);
Route::post('connections/verify-plugin-activation', [ConnectionController::class, 'verifyPluginActivation']);
Route::post('connections/save', [ConnectionController::class, 'save']);
Route::post('connections/update', [ConnectionController::class, 'update']);
Route::post('connections/reauthorize', [ConnectionController::class, 'reauthorize']);
Route::post('connections/delete', [ConnectionController::class, 'delete']);
