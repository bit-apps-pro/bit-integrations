<?php

namespace BitApps\Integrations\Authorization;

if (!defined('ABSPATH')) {
    exit;
}

class AuthorizationType
{
    public const WP_PLUGIN_CHECK = 'wp_plugin_check';

    public const BASIC_AUTH = 'basic_auth';

    public const API_KEY = 'api_key';

    public const BEARER_TOKEN = 'bearer_token';

    public const OAUTH2 = 'oauth2';

    public const OAUTH1 = 'oauth1';

    public const CUSTOM = 'custom';
}
