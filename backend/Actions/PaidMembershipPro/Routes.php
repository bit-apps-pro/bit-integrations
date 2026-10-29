<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\PaidMembershipPro\PaidMembershipProHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('fetch_all_paid_membership_pro_level', [PaidMembershipProHelper::class, 'getAllPaidMembershipProLevel']);
