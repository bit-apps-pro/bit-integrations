<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MailBluster\MailBlusterController;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailBluster_fetch_custom_fields', [MailBlusterController::class, 'fetchCustomFields']);
