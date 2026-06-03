<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MoreConvertWishlist\MoreConvertWishlistController;
use BitApps\Integrations\Core\Util\Route;

Route::post('more_convert_wishlist_authorize', [MoreConvertWishlistController::class, 'moreConvertWishlistAuthorize']);
Route::post('refresh_more_convert_wishlist_customers', [MoreConvertWishlistController::class, 'refreshCustomers']);
Route::post('refresh_more_convert_wishlist_users', [MoreConvertWishlistController::class, 'refreshUsers']);
Route::post('refresh_more_convert_wishlist_wishlists', [MoreConvertWishlistController::class, 'refreshWishlists']);
