<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Lemlist\LemlistController;
use BitApps\Integrations\Core\Util\Route;

Route::post('lemlist_campaigns', [LemlistController::class, 'getAllCampaign']);
