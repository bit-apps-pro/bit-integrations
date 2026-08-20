<?php

namespace BitApps\Integrations\Core\Util;

/**
 * handling Special mail-tags
 *
 * @since 1.0.0
 */
final class SmartTags
{
    public static function getPostUserData($isReferer)
    {
        $post = [];
        $postId = $isReferer ? Helper::getPostIdFromReferer(null) : null;

        if (!$isReferer && empty($postId) && isset($_SERVER['REQUEST_URI'])) {
            $requestUri = sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI']));
            $postId = Helper::getPostIdFromReferer($requestUri);
        }

        if ($postId) {
            $post = get_post($postId, 'OBJECT');
        }

        $user = wp_get_current_user();
        $user_roles = $user->roles;

        if (!is_wp_error($user_roles) && \count($user_roles) > 0) {
            $user->current_user_role = $user_roles[0];
        }

        $postAuthorInfo = [];
        if (isset($post->post_author)) {
            $postAuthorInfo = get_user_by('ID', $post->post_author);
        }

        return ['user' => $user, 'post' => $post, 'post_author_info' => $postAuthorInfo];
    }

    public static function getSmartTagValue($key, $isReferer = false)
    {
        $data = static::getPostUserData($isReferer);
        $userDetail = IpTool::getUserDetail();
        $device = explode('|', $userDetail['device']);

        if (\is_array($device)) {
            $browser = $device[0];
            $operating = $device[1];
        }

        $postObject = \is_object($data['post']) ? $data['post'] : null;
        $user = isset($data['user']) ? $data['user'] : null;

        $smartTags = [
            '_bi_current_time'  => gmdate('Y-m-d H:i:s'),
            '_bi_admin_email'   => get_bloginfo('admin_email'),
            '_bi_boolean_true'  => true,
            '_bi_boolean_false' => false,
            // date_i18n() (since WP 0.71) used instead of wp_date() (WP 5.3) for WP 5.1 compatibility
            '_bi_date_default' => date_i18n(get_option('date_format')),
            '_bi_date.m/d/y'   => date_i18n('m/d/y'),
            '_bi_date.d/m/y'   => date_i18n('d/m/y'),
            '_bi_date.y/m/d'   => date_i18n('y/m/d'),
            '_bi_time'         => date_i18n(get_option('time_format')),
            '_bi_weekday'      => date_i18n('l'),
            // _bi_current_time is gmdate(), i.e. UTC. These give the operator the site-local
            // clock and the two machine formats remote APIs actually accept.
            '_bi_current_time_site' => current_time('mysql'),
            '_bi_timestamp'         => (string) time(),
            '_bi_date_iso8601'      => gmdate('c'),
            '_bi_date_ymd'          => date_i18n('Y-m-d'),
            '_bi_site_timezone'     => static::getSiteTimezone(),
            // Clock/calendar components. Many CRMs and spreadsheets expose split date or
            // time columns, and no combination of the whole-date tags can fill those.
            '_bi_date_time_default' => date_i18n(get_option('date_format') . ' ' . get_option('time_format')),
            '_bi_time_24h'          => date_i18n('H:i'),
            '_bi_time_24h_seconds'  => date_i18n('H:i:s'),
            '_bi_time_12h'          => date_i18n('h:i A'),
            '_bi_hour'              => date_i18n('H'),
            '_bi_minute'            => date_i18n('i'),
            '_bi_second'            => date_i18n('s'),
            '_bi_day'               => date_i18n('d'),
            '_bi_month'             => date_i18n('m'),
            '_bi_month_name'        => date_i18n('F'),
            '_bi_year'              => date_i18n('Y'),
            '_bi_weekday_number'    => date_i18n('N'),
            '_bi_week_number'       => date_i18n('W'),
            '_bi_day_of_year'       => date_i18n('z'),
            '_bi_quarter'           => (string) (int) ceil((int) date_i18n('n') / 3),
            '_bi_timestamp_ms'      => (string) (time() * 1000),
            '_bi_date_rfc2822'      => gmdate('r'),
            // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized with sanitize_text_field
            '_bi_http_referer_url' => isset($_SERVER['HTTP_REFERER']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_REFERER'])) : '',
            '_bi_current_url'      => static::getCurrentUrl(),
            '_bi_ip_address'       => IpTool::getIP(),
            '_bi_browser_name'     => isset($browser) ? $browser : '',
            '_bi_operating_system' => isset($operating) ? $operating : '',
            '_bi_device_type'      => wp_is_mobile() ? 'Mobile' : 'Desktop',
            '_bi_user_agent'       => static::getServerValue('HTTP_USER_AGENT'),
            '_bi_browser_language' => static::getBrowserLanguage(),
            // Was time(): fully predictable despite the name, which is a hazard when the tag
            // is mapped into a token, coupon or reference field. Use _bi_current_time for a
            // timestamp.
            '_bi_random_digit_num'  => wp_rand(1000000000, 9999999999),
            '_bi_uuid'              => wp_generate_uuid4(),
            '_bi_random_string'     => wp_generate_password(10, false, false),
            '_bi_user_id'           => (isset($data['user']->ID) ? $data['user']->ID : ' '),
            '_bi_user_first_name'   => (isset($data['user']->first_name) ? $data['user']->first_name : ' '),
            '_bi_user_last_name'    => (isset($data['user']->last_name) ? $data['user']->last_name : ' '),
            '_bi_user_display_name' => (isset($data['user']->display_name) ? $data['user']->display_name : ' '),
            '_bi_user_nice_name'    => (isset($data['user']->user_nicename) ? $data['user']->user_nicename : ' '),
            '_bi_user_login_name'   => (isset($data['user']->user_login) ? $data['user']->user_login : ' '),
            '_bi_user_email'        => (isset($data['user']->user_email) ? $data['user']->user_email : ' '),
            '_bi_user_url'          => (isset($data['user']->user_url) ? $data['user']->user_url : ' '),
            '_bi_current_user_role' => (isset($data['user']->current_user_role) ? $data['user']->current_user_role : ' '),
            // Most CRMs expose a single Name column; concatenating two tags leaves a stray
            // space whenever one half is blank.
            '_bi_user_full_name'          => static::getUserFullName($user),
            '_bi_user_roles_all'          => (isset($user->roles) && \is_array($user->roles) ? implode(', ', $user->roles) : ''),
            '_bi_user_registered_date'    => (isset($user->user_registered) ? $user->user_registered : ''),
            '_bi_user_avatar_url'         => (isset($user->ID) && $user->ID ? (string) get_avatar_url($user->ID) : ''),
            '_bi_is_user_logged_in'       => is_user_logged_in() ? 'true' : 'false',
            '_bi_author_id'               => (isset($data['post_author_info']->ID) ? $data['post_author_info']->ID : ' '),
            '_bi_author_display'          => (isset($data['post_author_info']->display_name) ? $data['post_author_info']->display_name : ' '),
            '_bi_author_email'            => (isset($data['post_author_info']->user_email) ? $data['post_author_info']->user_email : ' '),
            '_bi_site_title'              => get_bloginfo('name'),
            '_bi_site_description'        => get_bloginfo('description'),
            '_bi_site_url'                => get_bloginfo('url'),
            '_bi_admin_url'               => admin_url(),
            '_bi_login_url'               => wp_login_url(),
            '_bi_wp_local_codes'          => get_bloginfo('language'),
            '_bi_post_id'                 => (\is_object($data['post']) ? $data['post']->ID : ''),
            '_bi_post_name'               => (\is_object($data['post']) ? $data['post']->post_name : ''),
            '_bi_post_title'              => (\is_object($data['post']) ? $data['post']->post_title : ''),
            '_bi_post_date'               => (\is_object($data['post']) ? $data['post']->post_date : ''),
            '_bi_post_modified_date'      => (\is_object($data['post']) ? $data['post']->post_modified : ''),
            '_bi_post_url'                => (\is_object($data['post']) ? get_permalink($data['post']->ID) : ''),
            '_bi_post_type'               => ($postObject ? $postObject->post_type : ''),
            '_bi_post_status'             => ($postObject ? $postObject->post_status : ''),
            '_bi_post_excerpt'            => ($postObject ? $postObject->post_excerpt : ''),
            '_bi_post_content'            => ($postObject ? $postObject->post_content : ''),
            '_bi_post_categories'         => ($postObject ? static::getPostTermNames($postObject->ID, 'category') : ''),
            '_bi_post_tags'               => ($postObject ? static::getPostTermNames($postObject->ID, 'post_tag') : ''),
            '_bi_post_featured_image_url' => ($postObject ? (string) get_the_post_thumbnail_url($postObject->ID, 'full') : ''),
        ];

        if (isset($smartTags[$key])) {
            return $smartTags[$key];
        }

        return '';
    }

    private static function getCurrentUrl()
    {
        $host = static::getServerValue('HTTP_HOST');
        $requestUri = static::getServerValue('REQUEST_URI');

        if (empty($host) || empty($requestUri)) {
            return '';
        }

        return (is_ssl() ? 'https://' : 'http://') . $host . $requestUri;
    }

    private static function getServerValue($name)
    {
        if (!isset($_SERVER[$name])) {
            return '';
        }

        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized immediately
        return sanitize_text_field(wp_unslash($_SERVER[$name]));
    }

    private static function getBrowserLanguage()
    {
        $header = static::getServerValue('HTTP_ACCEPT_LANGUAGE');

        if (empty($header)) {
            return '';
        }

        $primary = explode(',', $header);

        return trim(explode(';', $primary[0])[0]);
    }

    private static function getSiteTimezone()
    {
        $timezone = get_option('timezone_string');

        if (!empty($timezone)) {
            return $timezone;
        }

        return \sprintf('UTC%+g', (float) get_option('gmt_offset'));
    }

    private static function getUserFullName($user)
    {
        if (!\is_object($user)) {
            return '';
        }

        $first = isset($user->first_name) ? $user->first_name : '';
        $last = isset($user->last_name) ? $user->last_name : '';
        $fullName = trim($first . ' ' . $last);

        if ('' !== $fullName) {
            return $fullName;
        }

        return isset($user->display_name) ? $user->display_name : '';
    }

    private static function getPostTermNames($postId, $taxonomy)
    {
        if (!taxonomy_exists($taxonomy)) {
            return '';
        }

        $terms = wp_get_post_terms($postId, $taxonomy, ['fields' => 'names']);

        if (is_wp_error($terms) || empty($terms)) {
            return '';
        }

        return implode(', ', $terms);
    }
}
