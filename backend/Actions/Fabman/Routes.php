<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Fabman\FabmanHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('fabman_fetch_account_id', [FabmanHelper::class, 'fetchAccountId']);
Route::post('fabman_fetch_workspaces', [FabmanHelper::class, 'fetchWorkspaces']);
