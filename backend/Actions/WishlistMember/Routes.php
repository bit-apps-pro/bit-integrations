<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WishlistMember\WishlistMemberController;
use BitApps\Integrations\Core\Util\Route;

Route::post('get_wishlist_levels', [WishlistMemberController::class, 'getLevels']);
