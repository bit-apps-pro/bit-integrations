<?php

namespace BitApps\Integrations\controller;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Capabilities;
use BitApps\Integrations\Deps\BitApps\WPTelemetry\Telemetry\Telemetry;
use WP_Error;

final class TelemetryController
{
    public function status()
    {
        $report = Telemetry::report();

        return [
            'canManage'     => Capabilities::Check('manage_options'),
            'allowed'       => (bool) $report->isTrackingAllowed(),
            'decided'       => (bool) $report->isTrackingNoticeDismissed(),
            'dataWeCollect' => $report->dataWeCollect(),
        ];
    }

    public function consent($data)
    {
        if (!Capabilities::Check('manage_options')) {
            return new WP_Error(
                Config::withPrefix('telemetry_forbidden'),
                __('Only site administrators can change usage data sharing.', 'bit-integrations')
            );
        }

        if (filter_var($data->allow ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $source = isset($data->source) && \is_string($data->source) ? sanitize_key($data->source) : '';

            Telemetry::report()->trackingOptIn($source !== '' ? $source : 'settings');
        } else {
            Telemetry::report()->trackingOptOut();
        }

        return $this->status();
    }
}
