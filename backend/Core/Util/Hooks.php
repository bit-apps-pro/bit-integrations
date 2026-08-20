<?php

namespace BitApps\Integrations\Core\Util;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * A wrapper class for actions and filters.
 */
final class Hooks
{
    /**
     * A wrapper for do_action()
     *
     * @param string $tag    The name of the action to be executed.
     * @param mixed  ...$arg Optional.
     *                       Additional arguments which are passed on to the functions hooked to the action. Default empty.
     *
     * @return mixed
     */
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
