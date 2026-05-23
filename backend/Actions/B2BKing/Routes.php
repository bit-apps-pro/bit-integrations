<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\B2BKing\B2BKingController;
use BitApps\Integrations\Core\Util\Route;

Route::post('b2bking_authorize', [B2BKingController::class, 'b2bKingAuthorize']);
Route::post('refresh_b2bking_groups', [B2BKingController::class, 'refreshGroups']);
