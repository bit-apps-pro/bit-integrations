<?php

namespace BitApps\Integrations\Core\Util;

use WP_REST_Controller;
use WP_REST_Server;

final class API extends WP_REST_Controller
{
    public const READABLE = WP_REST_Server::READABLE;

    public const CREATABLE = WP_REST_Server::CREATABLE;

    public const EDITABLE = WP_REST_Server::EDITABLE;

    public const DELETABLE = WP_REST_Server::DELETABLE;

    private const BASE = 'bit-integrations';

    private const VERSION = 'v1/';

    public static function register($route, $args)
    {
        register_rest_route(
            self::BASE,
            self::VERSION . $route,
            $args
        );
    }

    public static function get($route, $callback, $permission = null, $validation = null)
    {
        $args = [
            'methods'             => self::READABLE,
            'callback'            => $callback,
            'permission_callback' => $permission ? $permission : '__return_true',
        ];
        if (!\is_null($validation)) {
            $args['args'] = $validation;
        }
        static::register(
            $route,
            [$args]
        );
    }

    public static function post($route, $callback, $permission = null, $validation = null)
    {
        $args = [
            'methods'             => self::CREATABLE,
            'callback'            => $callback,
            'permission_callback' => $permission ? $permission : '__return_true',
        ];
        if (!\is_null($validation)) {
            $args['args'] = $validation;
        }
        static::register(
            $route,
            [$args]
        );
    }

    public static function match($method, $route, $callback, $permission = null, $validation = null)
    {
        $args = [];
        foreach ($method as $k => $m) {
            $arg = [
                'methods'             => self::getMethod($m),
                'callback'            => isset($callback[$k]) && \is_array($callback[$k]) ? $callback[$k] : $callback,
                'permission_callback' => $permission ? (isset($permission[$k]) && \is_array($permission[$k]) ? $permission[$k] : $permission) : '__return_true',
            ];
            if (!\is_null($validation)) {
                $arg['args'] = $validation;
            }
            $args[] = $arg;
        }
        static::register(
            $route,
            $args
        );
    }

    public static function getMethod($method)
    {
        switch (strtolower($method)) {
            case 'get':
                return self::READABLE;
            case 'post':
                return self::CREATABLE;
            case 'put':
                return self::EDITABLE;
            case 'delete':
                return self::DELETABLE;
            default:
                return self::READABLE;
        }
    }
}
