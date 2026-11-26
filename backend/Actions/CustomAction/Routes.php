<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\CustomAction\CustomActionHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('checking_function_validity', [CustomActionHelper::class, 'functionValidateHandler']);
