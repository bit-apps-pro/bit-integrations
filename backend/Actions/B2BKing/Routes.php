<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\B2BKing\B2BKingController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_b2bking_groups', [B2BKingController::class, 'refreshGroups']);
