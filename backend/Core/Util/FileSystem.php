<?php

namespace BitApps\Integrations\Core\Util;

if (!defined('ABSPATH')) {
    exit;
}

use WP_Filesystem_Base;
use WP_Filesystem_Direct;

final class FileSystem
{
    /**
     * @var WP_Filesystem_Base|null
     */
    private static $filesystem;

    /**
     * @return WP_Filesystem_Base
     */
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
            return self::$filesystem = $wp_filesystem;
        }

        // WP_Filesystem() fails when the site is set to FTP/SSH with no stored credentials.
        // Every path handled here is local, so fall back to Direct rather than returning
        // false and letting callers upload an empty file.
        if (!class_exists('WP_Filesystem_Direct')) {
            require_once ABSPATH . 'wp-admin/includes/class-wp-filesystem-base.php';
            require_once ABSPATH . 'wp-admin/includes/class-wp-filesystem-direct.php';
        }

        return self::$filesystem = new WP_Filesystem_Direct(null);
    }

    /**
     * @param string $path
     *
     * @return string|false
     */
    public static function read($path)
    {
        return self::instance()->get_contents($path);
    }

    /**
     * @param string $path
     * @param string $contents
     *
     * @return bool
     */
    public static function write($path, $contents)
    {
        return self::instance()->put_contents($path, $contents, FS_CHMOD_FILE);
    }

    /**
     * @param string $path
     *
     * @return bool
     */
    public static function exists($path)
    {
        return self::instance()->exists($path);
    }

    /**
     * @param string $path
     *
     * @return bool
     */
    public static function isDir($path)
    {
        return self::instance()->is_dir($path);
    }

    /**
     * @param string $path
     *
     * @return bool
     */
    public static function delete($path)
    {
        return self::instance()->delete($path);
    }
}
