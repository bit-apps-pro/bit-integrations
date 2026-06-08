<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SecureCustomFields\SecureCustomFieldsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('secure_custom_fields_authorize', [SecureCustomFieldsController::class, 'secureCustomFieldsAuthorize']);
