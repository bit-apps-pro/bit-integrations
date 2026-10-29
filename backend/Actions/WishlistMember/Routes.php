<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WishlistMember\WishlistMemberHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('get_wishlist_levels', [WishlistMemberHelper::class, 'getLevels']);
