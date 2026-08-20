<?php

namespace BitApps\Integrations\Core\Util;

use WP_Filesystem_Base;
use BitApps\Integrations\Config;

class CustomFuncValidator
{
    public static function functionValidateHandler($data)
    {
        if (self::fileModsDisabled()) {
            wp_send_json_error(__('Custom actions are disabled because file modifications are not allowed on this site.', 'bit-integrations'));

            return;
        }

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

        if (!self::hasAbspathGuard($fileContent)) {
            wp_send_json_error(__("Your function must start with a defined('ABSPATH') check that exits, e.g. if (!defined('ABSPATH')) { exit; }", 'bit-integrations'));

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

    public static function scrapeCustomActionFile($data)
    {
        if (empty($data->bit_integrations_scrape_key)) {
            wp_die(0);
        }

        $scrapeKey    = sanitize_key($data->bit_integrations_scrape_key);
        $fileLocation = get_transient(Config::withPrefix('scrape_file_') . $scrapeKey);

        if (false === $fileLocation) {
            wp_die(0);
        }

        $fileLocation = self::resolveCustomFunctionFile($fileLocation);

        if ($fileLocation === '') {
            wp_die(0);
        }

        $needleStart = '###### ' . Config::withPrefix("result_start:{$scrapeKey}") . ' ######';
        $needleEnd   = '###### ' . Config::withPrefix("result_end:{$scrapeKey}") . ' ######';

        $fatalTypes = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR];

        register_shutdown_function(function () use ($needleStart, $needleEnd, $fatalTypes) {
            $error = error_get_last();

            echo "\n{$needleStart}\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

            if (!empty($error) && \in_array($error['type'], $fatalTypes, true)) {
                $message = strtok($error['message'], "\n");

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

    public static function loopbackValidateContent($fileContent)
    {
        if (self::fileModsDisabled()) {
            wp_send_json_error(__('Custom actions are disabled because file modifications are not allowed on this site.', 'bit-integrations'));

            return false;
        }

        $wp_filesystem = FileSystem::instance();

        $customDir = self::customFunctionDir($wp_filesystem);
        if ($customDir === '') {
            wp_send_json_error(__('Unable to initialize custom function directory.', 'bit-integrations'));

            return false;
        }

        $tmpFile = "{$customDir}/" . Config::withPrefix('tmp_') . bin2hex(random_bytes(16)) . '.php';

        $written = $wp_filesystem->put_contents($tmpFile, $fileContent, FS_CHMOD_FILE);

        if (!$written) {
            wp_send_json_error(__('Unable to write temporary file for validation.', 'bit-integrations'));

            return false;
        }

        $passed = self::loopbackCheck($tmpFile, null, $wp_filesystem);

        if ($passed) {
            $wp_filesystem->delete($tmpFile);
        }

        return $passed;
    }

    private static function hasAbspathGuard($fileContent)
    {
        if (!\is_string($fileContent) || $fileContent === '') {
            return false;
        }

        $pattern = '/if\s*\(\s*!\s*(?:\\\\)?defined\s*\(\s*[\'"]ABSPATH[\'"]\s*\)\s*\)\s*\{?\s*(?:exit|die|return)\b/i';

        if (!preg_match($pattern, $fileContent, $matches, PREG_OFFSET_CAPTURE)) {
            return false;
        }

        $prefix = substr($fileContent, 0, $matches[0][1]);
        $prefix = preg_replace('/<\?php|<\?=|\/\*.*?\*\/|\/\/[^\r\n]*|#[^\r\n]*|declare\s*\([^)]*\)\s*;?/s', '', $prefix);

        return trim((string) $prefix) === '';
    }

    private static function fileModsDisabled()
    {
        return (\defined('DISALLOW_FILE_MODS') && DISALLOW_FILE_MODS)
            || (\defined('DISALLOW_FILE_EDIT') && DISALLOW_FILE_EDIT);
    }

    public static function resolveCustomFunctionFile($fileLocation)
    {
        if (!\is_string($fileLocation) || $fileLocation === '') {
            return '';
        }

        if (wp_parse_url($fileLocation, PHP_URL_SCHEME) !== null) {
            return '';
        }

        $real = realpath($fileLocation);
        if ($real === false || !is_file($real)) {
            return '';
        }

        if (strtolower(pathinfo($real, PATHINFO_EXTENSION)) !== 'php') {
            return '';
        }

        $uploadDir = wp_upload_dir();
        if (empty($uploadDir['basedir'])) {
            return '';
        }

        $base = realpath(rtrim($uploadDir['basedir'], '/\\') . '/' . Config::withPrefix('custom_functions'));
        if ($base === false) {
            return '';
        }

        $base = rtrim($base, '/\\') . DIRECTORY_SEPARATOR;

        return strpos($real, $base) === 0 ? $real : '';
    }

    private static function customFunctionDir($wp_filesystem)
    {
        $uploadDir = wp_upload_dir();
        if (empty($uploadDir['basedir'])) {
            return '';
        }

        $dir = rtrim($uploadDir['basedir'], '/\\') . '/' . Config::withPrefix('custom_functions');

        if (!$wp_filesystem->is_dir($dir) && !wp_mkdir_p($dir)) {
            return '';
        }

        $guards = [
            'index.php'  => "<?php\n// Silence is golden.\n",
            '.htaccess'  => "# Bit Integrations custom functions — deny direct access\n<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n",
            'web.config' => "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<configuration><system.webServer><authorization><deny users=\"*\" /></authorization></system.webServer></configuration>\n",
        ];

        foreach ($guards as $name => $contents) {
            $path = "{$dir}/{$name}";
            if (!$wp_filesystem->exists($path)) {
                $wp_filesystem->put_contents($path, $contents, FS_CHMOD_FILE);
            }
        }

        return $dir;
    }

    private static function writeCustomFunctionFile($fileName, $fileContent)
    {
        $wp_filesystem = FileSystem::instance();

        $customDir = self::customFunctionDir($wp_filesystem);
        if ($customDir === '') {
            wp_send_json_error(__('Unable to initialize custom function directory.', 'bit-integrations'));

            return false;
        }

        $safeFileName  = sanitize_file_name(basename((string) $fileName));
        if (empty($safeFileName)) {
            wp_send_json_error(__('Invalid file name.', 'bit-integrations'));

            return false;
        }
        $fileLocation  = "{$customDir}/{$safeFileName}.php";
        $previousContent = $wp_filesystem->exists($fileLocation) ? $wp_filesystem->get_contents($fileLocation) : null;
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

    private static function loopbackCheck($fileLocation, $previousContent, $wp_filesystem)
    {
        $scrapeKey = bin2hex(random_bytes(16));

        set_transient(Config::withPrefix('scrape_file_') . $scrapeKey, $fileLocation, 60);

        $cookies = wp_unslash($_COOKIE); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

        $scrapeParams = [
            'action'                         => Config::withPrefix('custom-action/scrape'),
            Config::withPrefix('scrape_key') => $scrapeKey,
        ];

        $headers = ['Cache-Control' => 'no-cache'];

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
