<?php

namespace BitApps\Integrations\Core\Util;

if (!defined('ABSPATH')) {
    exit;
}

use WP_Filesystem_Base;
use WP_Filesystem_Direct;

final class FileSystem
{
    private static $filesystem;

    public static function instance()
    {
        if (self::$filesystem instanceof WP_Filesystem_Base) {
            return self::$filesystem;
        }

        global $wp_filesystem;

        if (empty($wp_filesystem)) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }

        if ($wp_filesystem instanceof WP_Filesystem_Base) {
            self::$filesystem = $wp_filesystem;
        } elseif (!class_exists('WP_Filesystem_Direct')) {
            require_once ABSPATH . 'wp-admin/includes/class-wp-filesystem-base.php';
            require_once ABSPATH . 'wp-admin/includes/class-wp-filesystem-direct.php';

            self::$filesystem = new WP_Filesystem_Direct(null);
        }

        return self::$filesystem;
    }

    public static function read($path)
    {
        return self::instance()->get_contents($path);
    }

    public static function write($path, $contents)
    {
        return self::instance()->put_contents($path, $contents, FS_CHMOD_FILE);
    }

    public static function exists($path)
    {
        return self::instance()->exists($path);
    }

    public static function isDir($path)
    {
        return self::instance()->is_dir($path);
    }

    public static function delete($path)
    {
        return self::instance()->delete($path);
    }
}
