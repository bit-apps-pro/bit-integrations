<?php

namespace BitApps\Integrations\Core\Util;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;

/**
 * Maps a plugin route to WordPress' `pagename` query var, so a controller can
 * intercept it without a real page or a REST namespace.
 */
final class RewriteRuleProvider
{
    public const FLUSH_LOCK = 'rewrite_flush_lock';

    private $route;

    public function __construct($route)
    {
        $this->route = trim($route, '/');
    }

    public static function pagenameFor($route)
    {
        return str_replace('/', '-', trim($route, '/'));
    }

    public function register()
    {
        Hooks::add('init', [$this, 'addRule']);
    }

    public function addRule()
    {
        $regex = '^' . $this->route . '/?$';

        add_rewrite_rule($regex, 'index.php?pagename=' . self::pagenameFor($this->route), 'top');

        $rules = get_option('rewrite_rules');

        // A permalink change or another plugin's flush can drop the rule.
        if (!\is_array($rules) || isset($rules[$regex])) {
            return;
        }

        // Rate limited: a plugin that flushes on every `init` before this one runs
        // would otherwise leave the rule permanently missing and flush each request.
        $lock = Config::withPrefix(self::FLUSH_LOCK);

        if (get_transient($lock)) {
            return;
        }

        set_transient($lock, 1, HOUR_IN_SECONDS);

        flush_rewrite_rules();
    }
}
