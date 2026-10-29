<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WebHooks\WebHooksHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('test_webhook', [WebHooksHelper::class, 'testWebhook']);
