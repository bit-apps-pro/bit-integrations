<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Instasent\InstasentHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_instasent_datasources', [InstasentHelper::class, 'refreshDatasources']);
