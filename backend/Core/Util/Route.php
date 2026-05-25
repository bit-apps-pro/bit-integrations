<?php

namespace BitApps\Integrations\Core\Util;

use BitApps\Integrations\Config;
use ReflectionMethod;

final class Route
{
    private static $_invokeable;

    private static $_no_auth = false;

    private static $_ignore_token = false;

    private static $_no_sanitize = false;

    private static $_sanitize_post_content = false;

    public static function get($hook, $invokeable)
    {
        return static::request('GET', $hook, $invokeable);
    }

    public static function post($hook, $invokeable)
    {
        return static::request('POST', $hook, $invokeable);
    }

    public static function request($method, $hook, $invokeable)
    {
        $action = static::getActionFromRequest();

        if (
            (
                isset($_SERVER['REQUEST_METHOD'])
                && sanitize_text_field(wp_unslash($_SERVER['REQUEST_METHOD'])) != $method
            )
            || empty($action)
            || (!empty($action) && strpos($action, $hook) === false)
        ) {
            if (static::$_no_auth) {
                static::$_no_auth = false;
            }

            if (static::$_ignore_token) {
                static::$_ignore_token = false;
            }

            if (static::$_no_sanitize) {
                static::$_no_sanitize = false;
            }

            if (static::$_sanitize_post_content) {
                static::$_sanitize_post_content = false;
            }

            return;
        }

        if (static::$_ignore_token) {
            static::$_ignore_token = false;
            static::$_invokeable[Config::VAR_PREFIX . $hook][$method . '_ignore_token'] = true;
        }

        if (static::$_no_sanitize) {
            static::$_no_sanitize = false;
            static::$_invokeable[Config::VAR_PREFIX . $hook][$method . '_no_sanitize'] = true;
        }

        if (static::$_sanitize_post_content) {
            static::$_sanitize_post_content = false;
            static::$_invokeable[Config::VAR_PREFIX . $hook][$method . '_sanitize_post_content'] = true;
        }

        static::$_invokeable[Config::VAR_PREFIX . $hook][$method] = $invokeable;

        Hooks::add('wp_ajax_' . Config::VAR_PREFIX . $hook, [__CLASS__, 'action']);

        if (static::$_no_auth) {
            static::$_no_auth = false;

            Hooks::add('wp_ajax_nopriv_' . Config::VAR_PREFIX . $hook, [__CLASS__, 'action']);
        }
    }

    public static function action()
    {
        $action = static::getActionFromRequest();

        $sanitizedMethod = isset($_SERVER['REQUEST_METHOD'])
            ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_METHOD']))
            : null;

        $requestMethod = \in_array($sanitizedMethod, ['GET', 'POST']) ? $sanitizedMethod : 'POST';

        if (
            isset(static::$_invokeable[$action][$requestMethod . '_ignore_token'])
            || isset($_REQUEST['_ajax_nonce']) // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            && wp_verify_nonce(
                sanitize_text_field(
                    wp_unslash(
                        $_REQUEST['_ajax_nonce'] // phpcs:ignore WordPress.Security.NonceVerification.Recommended
                    )
                ),
                Config::withPrefix('nonce')
            )
        ) {
            $invokeable = static::$_invokeable[$action][$requestMethod];
            unset($_POST['_ajax_nonce'], $_POST['action'], $_GET['_ajax_nonce'], $_GET['action']);

            if (method_exists($invokeable[0], $invokeable[1])) {
                $noSanitize = isset(static::$_invokeable[$action][$requestMethod . '_no_sanitize'])
                    && static::$_invokeable[$action][$requestMethod . '_no_sanitize'];

                self::$_sanitize_post_content = isset(static::$_invokeable[$action][$requestMethod . '_sanitize_post_content'])
                    && static::$_invokeable[$action][$requestMethod . '_sanitize_post_content'];

                if ($requestMethod == 'POST') {
                    if (
                        isset($_SERVER['CONTENT_TYPE'])
                        && strpos(sanitize_text_field(wp_unslash($_SERVER['CONTENT_TYPE'])), 'form-data') === false
                        && strpos(sanitize_text_field(wp_unslash($_SERVER['CONTENT_TYPE'])), 'x-www-form-urlencoded') === false
                    ) {
                        $inputJSON = file_get_contents('php://input');
                        $decoded = \is_string($inputJSON) ? json_decode($inputJSON) : $inputJSON;
                        $data = $noSanitize
                            ? $decoded
                            : (\is_object($decoded) || \is_array($decoded) ? map_deep($decoded, [__CLASS__, 'sanitizeValue']) : $decoded);
                    } elseif (isset($_POST['data'])) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
                        $postReq = wp_unslash($_POST['data']); // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized via map_deep on next lines
                        $decoded = \is_string($postReq) ? json_decode($postReq) : $postReq;
                        $data = $noSanitize
                            ? $decoded
                            : (\is_object($decoded) || \is_array($decoded) ? map_deep($decoded, [__CLASS__, 'sanitizeValue']) : $decoded);
                    } else {
                        $data = $noSanitize // phpcs:ignore WordPress.Security.NonceVerification.Missing
                            ? (object) wp_unslash($_POST) // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
                            : (object) map_deep(wp_unslash($_POST), [__CLASS__, 'sanitizeValue']); // phpcs:ignore WordPress.Security.NonceVerification.Missing
                    }
                } else {
                    $data = $noSanitize // phpcs:ignore WordPress.Security.NonceVerification.Recommended
                        ? (object) wp_unslash($_GET) // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
                        : (object) map_deep(wp_unslash($_GET), [__CLASS__, 'sanitizeValue']); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
                }

                if (\is_object($data)) {
                    CredentialInjector::inject($data, $invokeable[0]);
                }

                $reflectionMethod = new ReflectionMethod($invokeable[0], $invokeable[1]);
                $response = $reflectionMethod->invoke($reflectionMethod->isStatic() ? null : new $invokeable[0](), $data);

                if (is_wp_error($response)) {
                    wp_send_json_error($response);
                } else {
                    wp_send_json_success($response);
                }
            } else {
                wp_send_json_error('Method doesn\'t exists');
            }
        } else {
            wp_send_json_error(
                __(
                    'Token expired or invalid. Please refresh the page and try again.',
                    'bit-integrations'
                ),
                401
            );
        }
    }

    public static function no_auth()
    {
        self::$_no_auth = true;

        return new static();
    }

    public static function ignore_token()
    {
        self::$_ignore_token = true;

        return new static();
    }

    public static function no_sanitize()
    {
        self::$_no_sanitize = true;

        return new static();
    }

    public static function sanitize_post_content()
    {
        self::$_sanitize_post_content = true;

        return new static();
    }

    /**
     * Type-aware sanitizer for decoded JSON data.
     * Preserves booleans, integers, floats, and nulls so that JSON boolean
     * values (true/false) decoded from the request are not coerced to the
     * PHP string representations "1" and "" by sanitize_text_field().
     *
     * @param mixed $value
     *
     * @return mixed
     */
    public static function sanitizeValue($value)
    {
        if (\is_bool($value) || \is_int($value) || \is_float($value) || \is_null($value)) {
            return $value;
        }

        return self::$_sanitize_post_content ? wp_kses_post($value) : sanitize_text_field($value);
    }

    private static function getActionFromRequest()
    {
        if (isset($_REQUEST['action'])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            return sanitize_text_field(wp_unslash($_REQUEST['action'])); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        }

        if (isset($_POST['action'])) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
            return sanitize_text_field(wp_unslash($_POST['action'])); // phpcs:ignore WordPress.Security.NonceVerification.Missing
        }

        if (isset($_GET['action'])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            return sanitize_text_field(wp_unslash($_GET['action'])); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        }
    }
}
