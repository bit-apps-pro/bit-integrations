<?php

namespace BitApps\Integrations\Core\Telemetry;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Deps\BitApps\WPTelemetry\Telemetry\Telemetry;
use BitApps\Integrations\Deps\BitApps\WPTelemetry\Telemetry\TelemetryConfig;

final class TelemetryService
{
    // Pro releases before the telemetry moved back here bundle wp-telemetry 0.0.9 on this prefix. That copy
    // reports opt-outs and calls a third-party IP service, so its hooks are detached and this client takes over.
    private const LEGACY_PRO_CLASSES = [
        'BitApps\IntegrationsPro\Deps\BitApps\WPTelemetry\\',
        'BitApps\IntegrationsPro\controller\AnalyticsController',
    ];

    public function register()
    {
        TelemetryConfig::setSlug(Config::SLUG);
        TelemetryConfig::setTitle(Config::TITLE);
        TelemetryConfig::setPrefix(Config::VAR_PREFIX);
        TelemetryConfig::setVersion(Config::VERSION);

        TelemetryConfig::setServerBaseUrl('https://wp-api.bitapps.pro/public/');
        TelemetryConfig::setTermsUrl('https://bitapps.pro/terms-of-service/');
        TelemetryConfig::setPolicyUrl('https://bitapps.pro/privacy-policy/');

        Telemetry::report()->addPluginData();

        $strings = new TelemetryStrings();
        Hooks::filter(Config::withPrefix('telemetry_strings'), [$strings, 'strings']);
        Hooks::filter(Config::withPrefix('telemetry_notice_heading'), [$strings, 'noticeHeading']);
        Hooks::filter(Config::withPrefix('telemetry_notice_description'), [$strings, 'noticeDescription']);
        Hooks::filter(Config::withPrefix('telemetry_data_we_collect'), [$strings, 'dataWeCollect']);
        Hooks::filter(Config::withPrefix('deactivate_reasons'), [$strings, 'deactivateReasons']);

        Hooks::filter(Config::withPrefix('telemetry_additional_data'), [$this, 'addFlowSummary']);
        Hooks::filter(Config::withPrefix('telemetry_data_we_collect'), [$this, 'describeFlowSummary']);

        Hooks::add('plugins_loaded', [$this, 'init']);
        Hooks::add('plugins_loaded', [$this, 'detachLegacyProClient'], PHP_INT_MAX);
        Hooks::add(Config::withPrefix('activation'), [$this, 'activate']);
        Hooks::add(Config::withPrefix('deactivation'), [$this, 'deactivate']);
        Hooks::add(Config::withPrefix('uninstall'), [$this, 'uninstall']);
    }

    public function init()
    {
        Telemetry::report()->init();
        Telemetry::feedback()->init();
    }

    public function detachLegacyProClient()
    {
        global $wp_filter;

        $hookNames = [
            'admin_notices',
            'admin_init',
            'cron_schedules',
            'current_screen',
            'wp_ajax_' . Config::withPrefix('deactivate_feedback'),
            Config::withPrefix('send_tracking_event'),
            Config::withPrefix('activate'),
            Config::withPrefix('deactivate'),
            Config::withPrefix('telemetry_additional_data'),
            Config::withPrefix('telemetry_data'),
        ];

        foreach ($hookNames as $hookName) {
            if (!isset($wp_filter[$hookName])) {
                continue;
            }

            foreach ($wp_filter[$hookName]->callbacks as $priority => $callbacks) {
                foreach ($callbacks as $callback) {
                    if (self::isLegacyProCallback($callback['function'])) {
                        remove_filter($hookName, $callback['function'], $priority);
                    }
                }
            }
        }
    }

    public function activate()
    {
        // Activation runs after plugins_loaded, so old Pro's license filter is still attached here.
        $this->detachLegacyProClient();

        Telemetry::report()->activatePlugin();
    }

    public function deactivate()
    {
        Telemetry::report()->deactivatePlugin();
    }

    public function uninstall()
    {
        Telemetry::report()->deleteData(Config::VAR_PREFIX);
    }

    public function addFlowSummary($additionalData)
    {
        $cacheKey = Config::withPrefix('analytics_flow_summary');
        $flows = wp_cache_get($cacheKey, Config::VAR_PREFIX);

        if (false === $flows) {
            global $wpdb;

            // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Plugin-owned tables named from $wpdb->prefix only; the result is cached below.
            $flows = $wpdb->get_results(
                "SELECT
                    JSON_UNQUOTE(JSON_EXTRACT(flow.flow_details, '$.type')) AS ActionName,
                    flow.triggered_entity AS TriggerName,
                    flow.status AS status,
                    COUNT(log.flow_id) AS count
                FROM `{$wpdb->prefix}btcbi_flow` AS flow
                LEFT JOIN `{$wpdb->prefix}btcbi_log` AS log ON flow.id = log.flow_id
                GROUP BY flow.id, ActionName, TriggerName, status"
            );
            // phpcs:enable

            if (!\is_array($flows)) {
                $flows = [];
            }

            wp_cache_set($cacheKey, $flows, Config::VAR_PREFIX, 10 * MINUTE_IN_SECONDS);
        }

        $additionalData['flows'] = $flows;

        return $additionalData;
    }

    public function describeFlowSummary($collectList)
    {
        $collectList[] = __('Your integration flows: the trigger and action each one uses, whether it is enabled, and how many times it has run', 'bit-integrations');

        return $collectList;
    }

    private static function isLegacyProCallback($function)
    {
        if (!\is_array($function) || !\is_object($function[0])) {
            return false;
        }

        $class = \get_class($function[0]);

        foreach (self::LEGACY_PRO_CLASSES as $legacyClass) {
            if (strpos($class, $legacyClass) === 0) {
                return true;
            }
        }

        return false;
    }
}
