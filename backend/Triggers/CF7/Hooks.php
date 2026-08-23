<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Triggers\CF7\CF7Controller;

Hooks::add('wpcf7_before_send_mail', [CF7Controller::class, 'handle_wpcf7_submit'], 10);
