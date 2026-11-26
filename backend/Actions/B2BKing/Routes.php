<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\B2BKing\B2BKingHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_b2bking_groups', [B2BKingHelper::class, 'refreshGroups']);
