<?php

namespace BitApps\Integrations\Authorization\OAuth1;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;
use BitApps\Integrations\Authorization\RequestContext;

class OAuth1Authorization extends AbstractBaseAuthorization
{
    private const SIGNATURE_METHOD = 'HMAC-SHA1';

    private const VERSION = '1.0';

    public function getAccessToken()
    {
        $authDetails = $this->getAuthDetails();

        if (empty($authDetails) || empty($authDetails['access_token'])) {
            return [
                'error'   => true,
                'message' => __('OAuth1 access token field is missing', 'bit-integrations'),
            ];
        }

        return $authDetails['access_token'];
    }

    /**
     * The context-free credential: PARAM mode only.
     *
     * A signed credential cannot be built here — the signature covers the request, and
     * this method is not told what the request is. Signing therefore happens in
     * authConfigFor(), which receives a RequestContext. Kept faithful to PARAM mode so
     * direct callers of the legacy entry point keep working.
     */
    public function getAuthHeadersOrParams()
    {
        $authDetails = $this->getAuthDetails();

        if (!empty($authDetails['consumer_secret'])) {
            return [
                'error'   => true,
                'message' => __('OAuth1 requests must be signed; no request context was supplied.', 'bit-integrations'),
            ];
        }

        return $this->paramConfig($authDetails);
    }

    protected function authConfigFor(?RequestContext $context = null)
    {
        $authDetails = $this->getAuthDetails();

        if (empty($authDetails['consumer_secret'])) {
            return $this->paramConfig($authDetails);
        }

        if ($context === null) {
            return [
                'error'   => true,
                'message' => __('OAuth1 requests must be signed; no request context was supplied.', 'bit-integrations'),
            ];
        }

        if (empty($authDetails['consumer_key'])) {
            return [
                'error'   => true,
                'message' => __('OAuth1 consumer key is missing', 'bit-integrations'),
            ];
        }

        $oauthParams = [
            'oauth_consumer_key'     => (string) $authDetails['consumer_key'],
            'oauth_nonce'            => $this->nonce(),
            'oauth_signature_method' => self::SIGNATURE_METHOD,
            'oauth_timestamp'        => (string) time(),
            'oauth_version'          => self::VERSION,
        ];

        if (!empty($authDetails['access_token'])) {
            $oauthParams['oauth_token'] = (string) $authDetails['access_token'];
        }

        $oauthParams['oauth_signature'] = $this->sign(
            $context,
            $oauthParams,
            (string) $authDetails['consumer_secret'],
            (string) ($authDetails['access_token_secret'] ?? '')
        );

        if (($authDetails['addTo'] ?? 'header') === 'query') {
            return [
                'authLocation' => 'query',
                'data'         => $oauthParams,
            ];
        }

        return [
            'authLocation' => 'header',
            'data'         => ['Authorization' => $this->buildAuthorizationHeader($oauthParams)],
        ];
    }

    private function paramConfig($authDetails)
    {
        if (empty($authDetails['consumer_key']) || empty($authDetails['access_token'])) {
            return [
                'error'   => true,
                'message' => __('OAuth1 consumer key or access token is missing', 'bit-integrations'),
            ];
        }

        $consumerKeyParam = $authDetails['consumer_key_param'] ?? ($authDetails['consumerKeyParam'] ?? 'oauth_consumer_key');
        $tokenParam = $authDetails['token_param'] ?? ($authDetails['tokenParam'] ?? 'oauth_token');

        return [
            'authLocation' => $authDetails['addTo'] ?? 'query',
            'data'         => [
                $consumerKeyParam => $authDetails['consumer_key'],
                $tokenParam       => $authDetails['access_token'],
            ],
        ];
    }

    private function sign(
        RequestContext $context,
        array $oauthParams,
        string $consumerSecret,
        string $tokenSecret
    ): string {
        [$baseUrl, $queryParams] = $this->splitUrl($context->url());

        $params = array_merge($queryParams, $this->flattenParams($context->params()), $oauthParams);

        $baseString = implode('&', [
            $this->encode($context->method()),
            $this->encode($baseUrl),
            $this->encode($this->normalizeParams($params)),
        ]);

        $signingKey = $this->encode($consumerSecret) . '&' . $this->encode($tokenSecret);

        return base64_encode(hash_hmac('sha1', $baseString, $signingKey, true));
    }

    private function normalizeParams(array $params): string
    {
        $encoded = [];

        foreach ($params as $key => $value) {
            $encodedKey = $this->encode((string) $key);

            foreach ((array) $value as $item) {
                $encoded[] = [$encodedKey, $this->encode($this->stringifyValue($item))];
            }
        }

        usort($encoded, static function ($a, $b) {
            return $a[0] === $b[0] ? strcmp($a[1], $b[1]) : strcmp($a[0], $b[0]);
        });

        $pairs = [];

        foreach ($encoded as $pair) {
            $pairs[] = $pair[0] . '=' . $pair[1];
        }

        return implode('&', $pairs);
    }

    private function splitUrl(string $url): array
    {
        $parts = wp_parse_url($url);

        if (empty($parts) || empty($parts['scheme']) || empty($parts['host'])) {
            return [$url, []];
        }

        $scheme = strtolower($parts['scheme']);
        $host = strtolower($parts['host']);
        $port = $parts['port'] ?? null;

        if (
            $port !== null
            && !(($scheme === 'http' && (int) $port === 80) || ($scheme === 'https' && (int) $port === 443))
        ) {
            $host .= ':' . (int) $port;
        }

        $queryParams = [];

        if (!empty($parts['query'])) {
            parse_str($parts['query'], $queryParams);
        }

        return [$scheme . '://' . $host . ($parts['path'] ?? ''), $queryParams];
    }

    private function flattenParams(array $params, string $prefix = ''): array
    {
        $flat = [];

        foreach ($params as $key => $value) {
            $name = $prefix === '' ? (string) $key : $prefix . '[' . $key . ']';

            if (\is_array($value)) {
                $flat += $this->flattenParams($value, $name);

                continue;
            }

            $flat[$name] = $value;
        }

        return $flat;
    }

    private function stringifyValue($value): string
    {
        if (\is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        return $value === null ? '' : (string) $value;
    }

    private function buildAuthorizationHeader(array $oauthParams): string
    {
        $parts = [];

        foreach ($oauthParams as $key => $value) {
            $parts[] = $this->encode((string) $key) . '="' . $this->encode((string) $value) . '"';
        }

        return 'OAuth ' . implode(', ', $parts);
    }

    private function nonce(): string
    {
        return bin2hex(random_bytes(16));
    }

    private function encode(string $value): string
    {
        return str_replace(['%7E', '+'], ['~', '%20'], rawurlencode($value));
    }
}
