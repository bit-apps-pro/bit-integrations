<?php

// phpcs:disable Squiz.NamingConventions.ValidVariableName

namespace BitApps\Integrations;

use BitApps\Integrations\Core\Http\OauthCallbackController;
use BitApps\Integrations\Core\Util\DateTimeHelper;
use BitApps\Integrations\Core\Util\FileSystem;
use BitApps\Integrations\Core\Util\Hooks;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Provides App configurations.
 */
class Config
{
    public const SLUG = 'bit-integrations';

    public const TITLE = 'Bit Integrations';

    public const VAR_PREFIX = 'bit_integrations_';

    public const VERSION = '2.10.3';

    public const DB_VERSION = '1.2';

    public const REQUIRED_PHP_VERSION = '7.4';

    public const REQUIRED_WP_VERSION = '5.1';

    public const API_VERSION = '1.0';

    /**
     * Provides configuration for plugin.
     *
     * @param string $type    Type of conf
     * @param string $default Default value
     *
     * @return array|string|null
     */
    public static function get($type, $default = null)
    {
        global $wp_rewrite;

        switch ($type) {
            case 'MAIN_FILE':
                return BIT_INTEGRATIONS_PLUGIN_FILE;

            case 'BASENAME':
                return plugin_basename(trim(self::get('MAIN_FILE')));

            case 'BASEDIR':
                return plugin_dir_path(self::get('MAIN_FILE'));

            case 'BACKEND_DIR':
                return plugin_dir_path(self::get('MAIN_FILE')) . 'backend';

            case 'SITE_URL':
                $parsedUrl = wp_parse_url(get_admin_url());
                $siteUrl = $parsedUrl['scheme'] . '://' . $parsedUrl['host'];
                $siteUrl .= empty($parsedUrl['port']) ? null : ':' . $parsedUrl['port'];

                return $siteUrl;

            case 'ADMIN_URL':
                return str_replace(self::get('SITE_URL'), '', get_admin_url());

            case 'API_URL':
                return get_rest_url(null, '/' . self::SLUG . '/v1');

            case 'OAUTH_CALLBACK_URI':
                if (get_option('permalink_structure') === '') {
                    return home_url('/?pagename=' . OauthCallbackController::pagename());
                }

                return home_url('/' . OauthCallbackController::ROUTE . '/');

            case 'REDIRECT_URI':
                // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- hook is prefixed via Config::VAR_PREFIX.
                return Hooks::apply(self::withPrefix('oauth_redirect_uri'), self::get('OAUTH_CALLBACK_URI'));

            case 'WP_API_URL':
                return [
                    'base'      => get_rest_url(),
                    'separator' => $wp_rewrite->permalink_structure ? '?' : '&',
                ];

            case 'ROOT_URI':
                return set_url_scheme(plugins_url('', self::get('MAIN_FILE')), wp_parse_url(home_url())['scheme']);

            case 'ASSET_URI':
                return self::get('ROOT_URI') . '/assets';

            case 'PLUGIN_PAGE_LINKS':
                return self::pluginPageLinks();

            case 'WP_DB_PREFIX':
                global $wpdb;

                return $wpdb->prefix;

            default:
                return $default;
        }
    }

    /**
     * Prefixed variable name with prefix.
     *
     * @param string $option Variable name
     *
     * @return string
     */
    public static function withPrefix($option)
    {
        return self::VAR_PREFIX . $option;
    }

    /**
     * Retrieves options from option table.
     *
     * @param string $option  Option name
     * @param bool   $default default value
     * @param bool   $wp      Whether option is default wp option
     *
     * @return mixed
     */
    public static function getOption($option, $default = false, $wp = false)
    {
        if ($wp) {
            return get_option($option, $default);
        }

        return get_option(self::withPrefix($option), $default);
    }

    /**
     * Saves option to option table.
     *
     * @param string $option   Option name
     * @param bool   $autoload Whether option will autoload
     * @param mixed  $value
     *
     * @return bool
     */
    public static function addOption($option, $value, $autoload = false)
    {
        return add_option(self::withPrefix($option), $value, '', $autoload ? 'yes' : 'no');
    }

    /**
     * Delete option from option table.
     *
     * @param string $option Option name
     */
    public static function deleteOption($option)
    {
        return delete_option(self::withPrefix($option));
    }

    /**
     * Save or update option to option table.
     *
     * @param string $option   Option name
     * @param mixed  $value    Option value
     * @param bool   $autoload Whether option will autoload
     *
     * @return bool
     */
    public static function updateOption($option, $value, $autoload = null)
    {
        return update_option(self::withPrefix($option), $value, !\is_null($autoload) ? 'yes' : null);
    }

    public static function isDev()
    {
        return is_readable(Config::get('BASEDIR') . '.port');
    }

    public static function getDevUrl()
    {
        if (self::isDev()) {
            $port = self::getDevPort();

            return "http://localhost:{$port}";
        }
    }

    public static function getDevPort()
    {
        return self::isDev() ? FileSystem::read(Config::get('BASEDIR') . '/.port') : null;
    }

    /**
     * Build and return the frontend config array for localization
     *
     * @return array
     */
    public static function getFrontendConfig()
    {
        $frontendConfig = apply_filters(
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- hook is prefixed via Config::VAR_PREFIX.
            self::withPrefix('localized_script'),
            [
                'nonce'       => wp_create_nonce(self::withPrefix('nonce')),
                'assetsURL'   => self::get('ASSET_URI'),
                'baseURL'     => get_admin_url(null, 'admin.php?page=bit-integrations#'),
                'siteURL'     => site_url(),
                'ajaxURL'     => admin_url('admin-ajax.php'),
                'api'         => self::get('API_URL'),
                'redirectURI' => self::get('REDIRECT_URI'),
                'wp_api_url'  => self::get('WP_API_URL'),
                'dateFormat'  => get_option('date_format'),
                'timeFormat'  => get_option('time_format'),
                'timeZone'    => DateTimeHelper::wp_timezone_string(),
                'userMail'    => self::getUserMails(),
                'currentUser' => wp_get_current_user(),
                'version'     => defined('BTCBI_PRO_VERSION') ? \constant('BTCBI_PRO_VERSION') : Config::VERSION
            ]
        );

        /**
         * @deprecated 2.7.8 Use `bit_integrations_localized_script` filter instead.
         * @since 2.7.8
         */
        $frontendConfig = Hooks::apply('btcbi_localized_script', $frontendConfig);

        $changelogVersion = Config::getOption('changelog_version', '0.0.0');

        if (version_compare($changelogVersion, '0.0.0', '==')) {
            /**
             * @deprecated 2.7.8 Use `bit_integrations_changelog_version` option instead.
             * @since 2.7.8
             */
            $frontendConfig['changelogVersion'] = Config::getOption('btcbi_changelog_version', $changelogVersion, true);
        } else {
            $frontendConfig['changelogVersion'] = $changelogVersion;
        }

        if ((get_locale() !== 'en_US' || get_user_locale() !== 'en_US') && file_exists(Config::get('BASEDIR') . '/languages/generatedString.php')) {
            include_once Config::get('BASEDIR') . '/languages/generatedString.php';
            if (isset($bit_integrations_i18n_strings)) {
                $frontendConfig['translations'] = $bit_integrations_i18n_strings;
            }
        }

        return $frontendConfig;
    }

    /**
     * Get list of users with their email addresses.
     *
     * @param string $capability Capability required to retrieve users. Defaults to 'manage_options'.
     *
     * @return array Array of users with id, label (display name), and value (email).
     */
    public static function getUserMails($capability = 'manage_options')
    {
        $userMails = [];
        if (current_user_can($capability)) {
            $users = get_users(['fields' => ['ID', 'user_nicename', 'user_email', 'display_name']]);
            foreach ($users as $key => $user) {
                $userMails[$key]['label'] = !empty($user->display_name) ? $user->display_name : '';
                $userMails[$key]['value'] = !empty($user->user_email) ? $user->user_email : '';
                $userMails[$key]['id'] = $user->ID;
            }
        }

        return $userMails;
    }

    /**
     * Provides links for plugin pages. Those links will bi displayed in
     * all plugin pages under the plugin name.
     *
     * @return array
     */
    private static function pluginPageLinks()
    {
        return [
            'settings' => [
                'title' => __('Settings', 'bit-integrations'),
                'url'   => self::get('ADMIN_URL') . 'admin.php?page=' . self::SLUG . '#settings',
            ],
            'help' => [
                'title' => __('Help', 'bit-integrations'),
                'url'   => self::get('ADMIN_URL') . 'admin.php?page=' . self::SLUG . '#help',
            ],
        ];
    }
}
