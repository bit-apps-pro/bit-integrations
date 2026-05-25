<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Fabman\FabmanController;
use BitApps\Integrations\Core\Util\Route;

Route::post('fabman_fetch_account_id', [FabmanController::class, 'fetchAccountId']);
Route::post('fabman_fetch_workspaces', [FabmanController::class, 'fetchWorkspaces']);
