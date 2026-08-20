<?php

namespace BitApps\Integrations\Core\Util;

if (! defined('ABSPATH')) {
    exit;
}

final class Hooks
{
    public static function run($tag, ...$arg)
    {
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- General-purpose wrapper accepting any hook name
        return do_action($tag, ...$arg);
    }

    public static function add($tag, $function_to_add, $priority = 10, $accepted_args = 1)
    {
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- General-purpose wrapper accepting any hook name
        return add_action(
            $tag,
            $function_to_add,
            $priority,
            $accepted_args
        );
    }

    public static function remove($tag, $function_to_remove, $priority = 10)
    {
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- General-purpose wrapper accepting any hook name
        return remove_action($tag, $function_to_remove, $priority);
    }

    public static function filter($tag, $function_to_add, $priority = 10, $accepted_args = 1)
    {
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- General-purpose wrapper accepting any hook name
        return add_filter($tag, $function_to_add, $priority, $accepted_args);
    }

    public static function apply($tag, $value, ...$args)
    {
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- General-purpose wrapper accepting any hook name
        return apply_filters($tag, $value, ...$args);
    }
}
