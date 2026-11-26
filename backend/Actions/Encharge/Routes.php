<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Encharge\EnchargeHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('encharge_headers', [EnchargeHelper::class, 'enchargeHeaders']);
