<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Core\Util\StoreInCache;
use BitApps\Integrations\Triggers\FallbackTrigger\FallbackHooks;
use BitApps\Integrations\Triggers\FallbackTrigger\FallbackTriggerController;

// These file-scope variables already carry the plugin slug as their prefix.
// Plugin Check infers prefixes from hook names rather than the slug, and this
// plugin fires third-party hooks, so `bit_integrations` never makes its list.
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
if (!Helper::isProActivate()) {
    $bit_integrations_entities = StoreInCache::getFallbackFlowEntities() ?? [];

    if (!empty($bit_integrations_entities)) {
        foreach (FallbackHooks::$triggerHookList as $bit_integrations_trigger) {
            if (isset($bit_integrations_entities[$bit_integrations_trigger['entity']])) {
                $bit_integrations_hookFunction = $bit_integrations_trigger['isFilterHook'] ? 'filter' : 'add';

                Hooks::$bit_integrations_hookFunction(
                    $bit_integrations_trigger['hook'], 
                    [FallbackTriggerController::class, 'triggerFallbackHandler'], 
                    $bit_integrations_trigger['priority'], 
                    PHP_INT_MAX
                );
            }
        }
    }
}
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
