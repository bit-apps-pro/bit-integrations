<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Core\Util\StoreInCache;
use BitApps\Integrations\Triggers\ActionHook\ActionHookController;

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
// These file-scope variables already carry the plugin slug as their prefix.
// Plugin Check infers prefixes from hook names rather than the slug, and this
// plugin fires third-party hooks, so `bit_integrations` never makes its list.
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
if (!Helper::isProActivate()) {
    $bit_integrations_flows = StoreInCache::getActionHookFlows() ?? [];

    foreach ($bit_integrations_flows as $bit_integrations_flow) {
        if (isset($bit_integrations_flow->triggered_entity_id)) {
            Hooks::add(
                $bit_integrations_flow->triggered_entity_id,
                [ActionHookController::class, 'handle'],
                10,
                PHP_INT_MAX
            );
        }
    }
}
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
