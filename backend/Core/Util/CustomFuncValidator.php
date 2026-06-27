<?php

namespace BitApps\Integrations\Core\Util;

use WP_Filesystem_Base;
use BitApps\Integrations\Config;

class CustomFuncValidator
{
    public static function functionValidateHandler($data)
    {
        if (empty($data->flow_details->value)) {
            wp_send_json_error(__('No function content provided.', 'bit-integrations'));

            return;
        }

        if (empty($data->flow_details->randomFileName)) {
            wp_send_json_error(__('No file name provided.', 'bit-integrations'));

            return;
        }

        $fileContent = $data->flow_details->value;
        $fileName = $data->flow_details->randomFileName;

        if (strpos($fileContent, "defined('ABSPATH')") === false) {
            wp_send_json_error(__("Your function must include a defined('ABSPATH') check.", 'bit-integrations'));

            return;
        }

        $fileWriteResult = self::writeCustomFunctionFile($fileName, $fileContent);
        if (false === $fileWriteResult) {
            return;
        }

        if (!self::loopbackCheck($fileWriteResult['fileLocation'], $fileWriteResult['previousContent'], $fileWriteResult['filesystem'])) {
            return;
        }

        $data->flow_details->funcFileLocation = $fileWriteResult['fileLocation'];
    }

    /**
     * Handles the loopback scrape request for a custom action file.
     * Registers its own shutdown function to output result markers so we are
     * not dependent on WP's wp_start_scraping_edited_file_errors(), which only
     * runs during full admin page loads and never for admin-ajax.php requests.
     *
     * @param object $data Sanitized GET params (bit_integrations_scrape_key).
     */
    public static function scrapeCustomActionFile($data)
    {
        if (empty($data->bit_integrations_scrape_key)) {
            wp_die(0);
        }

        $scrapeKey    = sanitize_key($data->bit_integrations_scrape_key);
        $fileLocation = get_transient(Config::withPrefix('scrape_file_') . $scrapeKey);

        if (false === $fileLocation || !file_exists($fileLocation)) {
            wp_die(0);
        }

        $needleStart = '###### ' . Config::withPrefix("result_start:{$scrapeKey}") . ' ######';
        $needleEnd   = '###### ' . Config::withPrefix("result_end:{$scrapeKey}") . ' ######';

        $fatalTypes = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR];

        register_shutdown_function(function () use ($needleStart, $needleEnd, $fatalTypes) {
            $error = error_get_last();

            echo "\n{$needleStart}\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

            if (!empty($error) && \in_array($error['type'], $fatalTypes, true)) {
                // Take the first line only — PHP 8 uncaught errors include a multi-line
                // stack trace with absolute file paths on every line.
                $message = strtok($error['message'], "\n");

                // Strip the trailing " in /path/file.php on line N" (PHP 7/8 parse/fatal)
                // or " in /path/file.php:N" (PHP 8 uncaught Error short format).
                $message = (string) preg_replace('/ in .+\.php(:\d+| on line \d+)$/', '', (string) $message);

                echo wp_json_encode([ // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                    'type'    => 'php_error',
                    'message' => trim($message),
                    'line'    => $error['line'],
                ]);
            } else {
                echo wp_json_encode(true); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            }

            echo "\n{$needleEnd}\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        });

        // phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable
        include $fileLocation;

        wp_die();
    }

    /**
     * Validates PHP code via the loopback check without saving a permanent file.
     * Writes a temporary file, runs the loopback, then deletes the temp file.
     * Calls wp_send_json_error() and returns false on any PHP fatal; returns true on success.
     *
     * @param string $fileContent PHP code to validate.
     *
     * @return bool
     */
    public static function loopbackValidateContent($fileContent)
    {
        $wp_filesystem = self::getFilesystem();
        if (false === $wp_filesystem) {
            wp_send_json_error(__('Unable to initialize filesystem.', 'bit-integrations'));

            return false;
        }

        $uploadDir = wp_upload_dir();
        $tmpFile = "{$uploadDir['basedir']}/" . Config::withPrefix('tmp_') . md5(wp_rand()) . '.php';

        $written = $wp_filesystem->put_contents($tmpFile, $fileContent, FS_CHMOD_FILE);

        if (!$written) {
            wp_send_json_error(__('Unable to write temporary file for validation.', 'bit-integrations'));

            return false;
        }

        // previousContent is null so loopbackCheck deletes the temp file on failure.
        $passed = self::loopbackCheck($tmpFile, null, $wp_filesystem);

        if ($passed) {
            $wp_filesystem->delete($tmpFile);
        }

        return $passed;
    }

    /**
     * Get initialized WP filesystem instance.
     *
     * @return WP_Filesystem_Base|false
     */
    private static function getFilesystem()
    {
        global $wp_filesystem;

        if (empty($wp_filesystem)) {
            require_once ABSPATH . '/wp-admin/includes/file.php';

            if (!WP_Filesystem()) {
                return false;
            }
        }

        return $wp_filesystem instanceof WP_Filesystem_Base ? $wp_filesystem : false;
    }

    /**
     * Initialize filesystem, resolve file path, and write custom function content.
     *
     * @param string $fileName
     * @param string $fileContent
     *
     * @return array{filesystem: WP_Filesystem_Base, fileLocation: string, previousContent: string|null}|false
     */
    private static function writeCustomFunctionFile($fileName, $fileContent)
    {
        $wp_filesystem = self::getFilesystem();
        if (false === $wp_filesystem) {
            wp_send_json_error(__('Unable to initialize filesystem.', 'bit-integrations'));

            return false;
        }

        $uploadDir     = wp_upload_dir();
        $safeFileName  = sanitize_file_name(basename((string) $fileName));
        if (empty($safeFileName)) {
            wp_send_json_error(__('Invalid file name.', 'bit-integrations'));

            return false;
        }
        $fileLocation  = "{$uploadDir['basedir']}/{$safeFileName}.php";
        $previousContent = file_exists($fileLocation) ? file_get_contents($fileLocation) : null;
        $written       = $wp_filesystem->put_contents($fileLocation, $fileContent, FS_CHMOD_FILE);

        if (!$written) {
            wp_send_json_error(__('Unable to write to file.', 'bit-integrations'));

            return false;
        }

        return [
            'filesystem'      => $wp_filesystem,
            'fileLocation'    => $fileLocation,
            'previousContent' => $previousContent,
        ];
    }

    /**
     * Mirrors wp_edit_theme_plugin_file()'s loopback check.
     * Sets up wp_scrape_key/wp_scrape_nonce transients so WP's built-in
     * wp_start_scraping_edited_file_errors() registers the shutdown handler,
     * makes a loopback request to include the written file, parses the result
     * markers, and rolls back the file on any PHP fatal.
     *
     * @param string             $fileLocation    Absolute path to the written file.
     * @param string|null        $previousContent Previous file content for rollback, or null if new.
     * @param WP_Filesystem_Base $wp_filesystem
     *
     * @return bool True on success, false if a fatal was detected (error already sent).
     */
    private static function loopbackCheck($fileLocation, $previousContent, $wp_filesystem)
    {
        $scrapeKey = md5(wp_rand());

        set_transient(Config::withPrefix('scrape_file_') . $scrapeKey, $fileLocation, 60);

        $cookies = wp_unslash($_COOKIE); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

        $scrapeParams = [
            'action'                         => Config::withPrefix('custom-action/scrape'),
            Config::withPrefix('scrape_key') => $scrapeKey,
        ];

        $headers = ['Cache-Control' => 'no-cache'];

        /** This filter is documented in wp-includes/class-wp-http-streams.php */
        $sslverify = apply_filters('https_local_ssl_verify', false); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound

        if (isset($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW'])) {
            $headers['Authorization'] = 'Basic ' . base64_encode( // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
                wp_unslash($_SERVER['PHP_AUTH_USER']) . ':' . wp_unslash($_SERVER['PHP_AUTH_PW']) // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
            );
        }

        if (\function_exists('set_time_limit')) {
            set_time_limit(5 * MINUTE_IN_SECONDS); // phpcs:ignore Squiz.PHP.DiscouragedFunctions.Discouraged
        }

        if (\function_exists('session_status') && PHP_SESSION_ACTIVE === session_status()) {
            session_write_close();
        }

        $timeout = 100;
        $url     = add_query_arg($scrapeParams, admin_url('admin-ajax.php'));

        $response = wp_remote_get($url, compact('cookies', 'headers', 'timeout', 'sslverify'));
        $body     = wp_remote_retrieve_body($response);

        $needleStart = '###### ' . Config::withPrefix("result_start:{$scrapeKey}") . ' ######';
        $needleEnd   = '###### ' . Config::withPrefix("result_end:{$scrapeKey}") . ' ######';

        $loopbackFailure = [
            'code'    => 'loopback_request_failed',
            'message' => __('Unable to communicate back with site to check for fatal errors, so the PHP change was reverted. You will need to fix any issues manually.', 'bit-integrations'),
        ];

        $resultPos = strpos($body, $needleStart);

        if (false === $resultPos) {
            $result = $loopbackFailure;
        } else {
            $errorOutput = substr($body, $resultPos + \strlen($needleStart));
            $errorOutput = substr($errorOutput, 0, strpos($errorOutput, $needleEnd));
            $result = json_decode(trim($errorOutput), true);

            if (empty($result)) {
                $result = ['code' => 'json_parse_error'];
            }
        }

        delete_transient(Config::withPrefix('scrape_file_') . $scrapeKey);

        if (true !== $result) {
            if ($previousContent !== null) {
                $wp_filesystem->put_contents($fileLocation, $previousContent, FS_CHMOD_FILE);
            } else {
                $wp_filesystem->delete($fileLocation);
            }

            wp_send_json_error(self::formatLoopbackError($result));

            return false;
        }

        return true;
    }

    /**
     * Converts a raw loopback scrape result into a safe, user-readable message.
     * Strips server file paths from PHP error strings before sending to the frontend.
     *
     * @param array $result Decoded scrape result.
     *
     * @return string
     */
    private static function formatLoopbackError($result)
    {
        if (isset($result['code']) && $result['code'] === 'loopback_request_failed') {
            return $result['message'];
        }

        if (isset($result['type']) && $result['type'] === 'php_error' && isset($result['message'], $result['line'])) {
            return sprintf(
                /* translators: 1: line number, 2: PHP error message */
                __('PHP error on line %1$d: %2$s', 'bit-integrations'),
                (int) $result['line'],
                $result['message']
            );
        }

        return __('An error occurred while verifying the function. Please try again.', 'bit-integrations');
    }
}
