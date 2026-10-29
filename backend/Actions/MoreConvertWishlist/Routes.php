<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MoreConvertWishlist\MoreConvertWishlistHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_more_convert_wishlist_customers', [MoreConvertWishlistHelper::class, 'refreshCustomers']);
Route::post('refresh_more_convert_wishlist_users', [MoreConvertWishlistHelper::class, 'refreshUsers']);
Route::post('refresh_more_convert_wishlist_wishlists', [MoreConvertWishlistHelper::class, 'refreshWishlists']);
