<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Lemlist\LemlistHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('lemlist_campaigns', [LemlistHelper::class, 'getAllCampaign']);
