<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Affiliate\AffiliateHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('affiliate_fetch_all_affiliate', [AffiliateHelper::class, 'getAllAffiliate']);
