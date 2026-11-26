<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\KirimEmail\KirimEmailHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('kirimEmail_fetch_all_list', [KirimEmailHelper::class, 'getAllList']);
