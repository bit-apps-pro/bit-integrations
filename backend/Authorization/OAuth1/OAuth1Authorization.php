<?php

namespace BitApps\Integrations\Authorization\OAuth1;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;
use BitApps\Integrations\Authorization\RequestContext;

/**
 * OAuth1-family authorization, in two modes.
 *
 * SIGNED (RFC 5849) — used when a consumer_secret is stored. The credential is not a
 * secret handed to the provider but an HMAC computed over the specific request being
 * sent; consumer_secret and access_token_secret never leave the site, they are only key
 * material for that signature. This is the mode any true OAuth 1.0a provider requires,
 * and it is why this strategy needs a RequestContext when the others do not.
 *
 * PARAM — used when no consumer_secret is stored. Some providers registered under this
 * auth type (Trello) authenticate with a plain key/token pair on the request rather than
 * a signature, and issue no consumer secret at all: there is nothing to sign with. Those
 * integrations declare their own parameter names (consumer_key_param / token_param).
 *
 * The presence of consumer_secret is the discriminator because it is exactly the thing
 * signing is impossible without.
 */
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

        // No consumer_secret means the provider issues none (Trello) — there is no key
        // material to sign with, so this is PARAM mode by definition, not a misconfigured
        // signed connection.
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

        // Two-legged OAuth1 (consumer credentials only) is legitimate — some providers
        // authenticate the application rather than a user — so an absent token is not an
        // error. It simply drops out of the signature, exactly as RFC 5849 specifies.
        if (!empty($authDetails['access_token'])) {
            $oauthParams['oauth_token'] = (string) $authDetails['access_token'];
        }

        $oauthParams['oauth_signature'] = $this->sign(
            $context,
            $oauthParams,
            (string) $authDetails['consumer_secret'],
            (string) ($authDetails['access_token_secret'] ?? '')
        );

        // The Authorization header is the interoperable default; query placement is kept
        // for providers that require it.
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

    /**
     * PARAM mode: the consumer key and token travel as plain request parameters under
     * provider-specific names (Trello's `key` and `token`). No signature is involved —
     * these providers issue no consumer secret to sign with.
     *
     * @param null|array $authDetails
     */
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

    /**
     * HMAC-SHA1 over the RFC 5849 signature base string.
     *
     * The base string binds the signature to the method, the URL and every parameter, so
     * a captured signature cannot be replayed against a different request.
     */
    private function sign(
        RequestContext $context,
        array $oauthParams,
        string $consumerSecret,
        string $tokenSecret
    ): string {
        [$baseUrl, $queryParams] = $this->splitUrl($context->url());

        // Query, body and oauth params are all signed together (RFC 5849 3.4.1.3).
        $params = array_merge($queryParams, $this->flattenParams($context->params()), $oauthParams);

        $baseString = implode('&', [
            $this->encode($context->method()),
            $this->encode($baseUrl),
            $this->encode($this->normalizeParams($params)),
        ]);

        // Both halves are encoded and joined by '&' even when the token secret is empty
        // (two-legged), which is why the separator is unconditional.
        $signingKey = $this->encode($consumerSecret) . '&' . $this->encode($tokenSecret);

        return base64_encode(hash_hmac('sha1', $baseString, $signingKey, true));
    }

    /**
     * Sort and concatenate parameters per RFC 5849 3.4.1.3.2.
     *
     * Sorting is byte-wise on the ENCODED key, then on the encoded value for repeated
     * keys — sorting the raw values instead would order differently for any character
     * whose escape reorders it, and the provider recomputes from the encoded forms.
     */
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

    /**
     * Split a URL into its signature base URL and its decoded query parameters.
     *
     * The base URL excludes the query and fragment, and a default port is dropped —
     * signing "https://x.test:443/a" against a provider computing "https://x.test/a"
     * fails with an opaque 401.
     *
     * @return array{0: string, 1: array}
     */
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
            // parse_str applies its own decoding, which is what the base string needs:
            // params are re-encoded once, uniformly, in normalizeParams().
            parse_str($parts['query'], $queryParams);
        }

        return [$scheme . '://' . $host . ($parts['path'] ?? ''), $queryParams];
    }

    /**
     * Collapse nested params to the bracketed keys they are sent as, so the signature
     * covers what actually goes on the wire.
     */
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

    /**
     * RFC 3986 percent-encoding.
     *
     * rawurlencode() already matches it on modern PHP (it escaped '~' on very old
     * builds), but OAuth1 signatures fail opaquely when encoding drifts, so the
     * unreserved set is asserted here rather than assumed.
     */
    private function encode(string $value): string
    {
        return str_replace(['%7E', '+'], ['~', '%20'], rawurlencode($value));
    }
}
