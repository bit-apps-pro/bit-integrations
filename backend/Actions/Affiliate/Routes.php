<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Affiliate\AffiliateController;
use BitApps\Integrations\Core\Util\Route;

Route::post('affiliate_fetch_all_affiliate', [AffiliateController::class, 'getAllAffiliate']);
