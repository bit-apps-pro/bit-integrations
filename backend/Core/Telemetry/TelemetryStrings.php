<?php

namespace BitApps\Integrations\Core\Telemetry;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;

/**
 * The telemetry library ships English text only, since a bundled library cannot use
 * this plugin's text domain as a literal. These filters translate it.
 */
final class TelemetryStrings
{
    public function strings($strings)
    {
        return array_merge($strings, [
            'allow'          => __('Allow & Continue', 'bit-integrations'),
            'skip'           => __('Skip', 'bit-integrations'),
            'dismiss'        => __('Dismiss this notice.', 'bit-integrations'),
            'data_shared'    => __('What we collect', 'bit-integrations'),
            'marketing'      => __('Also email me tips and product news. You can unsubscribe anytime.', 'bit-integrations'),
            'terms'          => __('Terms of service', 'bit-integrations'),
            'privacy'        => __('Privacy Policy', 'bit-integrations'),
            'survey_title'   => __('Quick Feedback', 'bit-integrations'),
            'survey_caption' => \sprintf(
                // translators: %s: plugin name
                __('If you have a moment, please let us know how "%s" can improve.', 'bit-integrations'),
                Config::TITLE
            ),
            'survey_disclosure' => \sprintf(
                // translators: %s: plugin name
                __('Submitting sends your site URL, site language and your answer to the %s team.', 'bit-integrations'),
                Config::TITLE
            ),
            'survey_submit' => __('Submit & Deactivate', 'bit-integrations'),
            'survey_skip'   => __('Skip & Deactivate', 'bit-integrations'),
        ]);
    }

    public function noticeHeading()
    {
        return \sprintf(
            // translators: 1: current user's display name, 2: plugin name
            __('Hi %1$s, help us make %2$s better!', 'bit-integrations'),
            esc_html(wp_get_current_user()->display_name),
            esc_html(Config::TITLE)
        );
    }

    public function noticeDescription()
    {
        return \sprintf(
            // translators: %s: plugin name
            __('Share diagnostic data and usage info about your use of %s. You can turn this off anytime from its Settings page.', 'bit-integrations'),
            esc_html(Config::TITLE)
        );
    }

    public function dataWeCollect($collectList)
    {
        $translations = [
            'Site name and URL'                                                                                     => __('Site name and URL', 'bit-integrations'),
            'Site admin email address and the first administrator\'s name'                                          => __('Site admin email address and the first administrator\'s name', 'bit-integrations'),
            'Server environment (server software, PHP and MySQL versions, PHP settings, whether the site is local)' => __('Server environment (server software, PHP and MySQL versions, PHP settings, whether the site is local)', 'bit-integrations'),
            'WordPress version, language and settings (memory limit, debug mode, multisite)'                        => __('WordPress version, language and settings (memory limit, debug mode, multisite)', 'bit-integrations'),
            'Active theme (name, version, author, website)'                                                         => __('Active theme (name, version, author, website)', 'bit-integrations'),
            'Number of users, in total and per role'                                                                => __('Number of users, in total and per role', 'bit-integrations'),
            'Number of active and inactive plugins'                                                                 => __('Number of active and inactive plugins', 'bit-integrations'),
            Config::TITLE . ' version and telemetry library version'                                                => \sprintf(
                // translators: %s: plugin name
                __('%s version and telemetry library version', 'bit-integrations'),
                Config::TITLE
            ),
            'Which page you opted in from, and whether you skipped this before' => __('Which page you opted in from, and whether you skipped this before', 'bit-integrations'),
            'Names and versions of active plugins'                              => __('Names and versions of active plugins', 'bit-integrations'),
            'Whether you asked for product emails, and when'                    => __('Whether you asked for product emails, and when', 'bit-integrations'),
        ];

        return array_map(
            function ($item) use ($translations) {
                return $translations[$item] ?? $item;
            },
            (array) $collectList
        );
    }

    public function deactivateReasons($reasons)
    {
        $translations = [
            'found_a_better_plugin' => [
                'title'       => __('Found a better plugin', 'bit-integrations'),
                'placeholder' => __('Which plugin?', 'bit-integrations'),
            ],
            'missing_specific_feature' => [
                'title'       => __('Missing a specific feature', 'bit-integrations'),
                'placeholder' => __('Could you tell us more about that feature?', 'bit-integrations'),
            ],
            'not_working' => [
                'title'       => __('Not working', 'bit-integrations'),
                'placeholder' => __('Could you tell us what is not working?', 'bit-integrations'),
            ],
            'not_working_as_expected' => [
                'title'       => __('Not working as expected', 'bit-integrations'),
                'placeholder' => __('Could you tell us what you expected?', 'bit-integrations'),
            ],
            'temporary_deactivation' => [
                'title' => __('It\'s a temporary deactivation', 'bit-integrations'),
            ],
            Config::withPrefix('pro') => [
                'title' => \sprintf(
                    // translators: %s: plugin name
                    __('I have %s Pro', 'bit-integrations'),
                    Config::TITLE
                ),
                'alert' => \sprintf(
                    // translators: %1$s: plugin name
                    __('Wait! %1$s Pro needs %1$s to work. If you deactivate %1$s, %1$s Pro stops working too.', 'bit-integrations'),
                    Config::TITLE
                ),
            ],
            'other' => [
                'title'       => __('Other', 'bit-integrations'),
                'placeholder' => __('Please share the reason', 'bit-integrations'),
            ],
        ];

        foreach ($translations as $key => $text) {
            if (isset($reasons[$key]) && \is_array($reasons[$key])) {
                $reasons[$key] = array_merge($reasons[$key], $text);
            }
        }

        return $reasons;
    }
}
