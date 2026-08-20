<?php


if (!defined('ABSPATH')) {
    exit;
}
use BitApps\Integrations\Actions\ActionController;
use BitApps\Integrations\Core\Util\API as Route;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Triggers\Webhook\WebhookController;

Route::get('redirect/', [new ActionController(), 'handleRedirect'], null, ['state' => ['required' => true]]);

if (!Helper::isProActivate()) {
    Route::match(['get', 'post'], 'callback/(?P<hook_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', [new WebhookController(), 'handle'], null, ['hook_id' => ['required' => true, 'validate_callback' => 'wp_is_uuid']]);
}
