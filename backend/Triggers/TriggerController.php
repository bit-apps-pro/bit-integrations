<?php

namespace BitApps\Integrations\Triggers;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\AllTriggersName;
use BitApps\Integrations\Core\Util\Capabilities;
use BitApps\Integrations\Core\Util\Hooks;
use FilesystemIterator;
use WP_Error;

final class TriggerController
{
    public static function triggerList()
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')) || Capabilities::Check(Config::withPrefix('view_integrations')))) {
            wp_send_json_error(__("User don't have permission to access this page", 'bit-integrations'));
        }
        $triggers = [];
        $dirs = new FilesystemIterator(__DIR__);
        foreach ($dirs as $dirInfo) {
            if ($dirInfo->isDir()) {
                $trigger = basename($dirInfo);

                if (file_exists(__DIR__ . '/' . $trigger . '/' . $trigger . 'Controller.php')) {
                    $trigger_controller = __NAMESPACE__ . "\\{$trigger}\\{$trigger}Controller";

                    if (method_exists($trigger_controller, 'info')) {
                        $triggers[$trigger] = $trigger_controller::info();
                    }
                }
            }
        }

        if (!\function_exists('btcbi_pro_activate_plugin')) {
            $triggers = array_merge($triggers, AllTriggersName::allTriggersName());
        }

        return Hooks::apply('bit_integrations_triggers', $triggers);
    }

    public static function getTriggerField($triggerName, $data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')) || Capabilities::Check(Config::withPrefix('view_integrations')))) {
            wp_send_json_error(__("User don't have permission to access this page", 'bit-integrations'));
        }

        $trigger = basename($triggerName);

        if (file_exists(__DIR__ . '/' . $trigger . '/' . $trigger . 'Controller.php')) {
            $trigger_controller = __NAMESPACE__ . "\\{$trigger}\\{$trigger}Controller";

            if (method_exists($trigger_controller, 'get_a_form')) {
                $trigger = new $trigger_controller();

                return $trigger::fields($data->id);
            }
        } else {
            return Hooks::apply('bit_integrations_trigger_fields', $triggerName, $data);
        }

        return [];
    }

    public static function getTestData($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')) || Capabilities::Check(Config::withPrefix('view_integrations')))) {
            wp_send_json_error(__("User don't have permission to access this page", 'bit-integrations'));
        }

        // Reduced to [a-z0-9_-] before it becomes an option name: this value is
        // caller-supplied and is otherwise interpolated straight into the key that
        // update_option()/delete_option() write.
        $triggerName = self::sanitizeTestDataKey($data->triggered_entity_id ?? '');

        if ($triggerName === '') {
            wp_send_json_error(__('Invalid trigger id', 'bit-integrations'));
        }

        $testData = get_option(Config::withPrefix("{$triggerName}_test"));

        if ($testData === false) {
            update_option(Config::withPrefix("{$triggerName}_test"), []);
        }
        if (!$testData || empty($testData)) {
            // translators: %s: Placeholder value
            wp_send_json_error(new WP_Error("{$triggerName}_test", wp_sprintf(__('%s data is empty', 'bit-integrations'), $triggerName)));
        }

        wp_send_json_success($testData);
    }

    public static function removeTestData($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')))) {
            wp_send_json_error(__("User don't have permission to access this page", 'bit-integrations'));
        }

        $triggerName = self::sanitizeTestDataKey($data->triggered_entity_id ?? '');

        if ($triggerName === '') {
            wp_send_json_error(__('Invalid trigger id', 'bit-integrations'));
        }

        if (\is_object($data) && property_exists($data, 'reset') && $data->reset) {
            $testData = update_option(Config::withPrefix("{$triggerName}_test"), []);
        } else {
            $testData = delete_option(Config::withPrefix("{$triggerName}_test"));
        }

        if (!$testData) {
            wp_send_json_error(new WP_Error("{$triggerName}_test", __('Failed to remove test data', 'bit-integrations')));
        }

        // translators: %s: Placeholder value
        wp_send_json_success(wp_sprintf(__('%s test data removed successfully', 'bit-integrations'), $triggerName));
    }

    public static function saveListedTriggers($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')))) {
            wp_send_json_error(__('User doesn\'t have permission to save triggers', 'bit-integrations'));
        }

        if (!isset($data->trigger) || !\is_string($data->trigger)) {
            wp_send_json_error(__('Invalid trigger data', 'bit-integrations'));
        }

        Config::updateOption('selected_trigger', sanitize_text_field($data->trigger));

        wp_send_json_success(__('Listed trigger saved successfully', 'bit-integrations'));
    }

    /**
     * Reduce a caller-supplied trigger/entity id to the character set that is safe to
     * interpolate into a `bit_integrations_{id}_test` option name.
     *
     * Kept deliberately permissive: real trigger ids include slashes and dots
     * (`elementor_pro/forms/new_record`), so this strips control characters, whitespace
     * and anything else that has no business in an option name rather than allow-listing
     * a shape that would break triggers shipped by the Pro plugin. The
     * `bit_integrations_` prefix and `_test` suffix already confine which options can be
     * reached; this stops the key itself from being arbitrary.
     *
     * @param mixed $value
     *
     * @return string
     */
    private static function sanitizeTestDataKey($value)
    {
        if (!\is_scalar($value)) {
            return '';
        }

        $key = (string) preg_replace('/[^A-Za-z0-9_\-\/.:]/', '', (string) $value);

        // option_name is a 191-char column; leave room for the prefix and suffix.
        return substr($key, 0, 150);
    }
}
