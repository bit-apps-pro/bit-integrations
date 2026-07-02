<?php

namespace BitApps\Integrations\Authorization\OAuth2;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;
use BitApps\Integrations\Authorization\Support\AuthDataCodec;
use BitApps\Integrations\Core\Util\HttpHelper;

class OAuth2Authorization extends AbstractBaseAuthorization
{
    private $bodyParams;

    private $refreshTokenUrl;

    private $tokenPrefix = 'Bearer ';

    public function setBodyParams(array $bodyParams)
    {
        $this->bodyParams = $bodyParams;

        return $this;
    }

    public function setRefreshTokenUrl($refreshTokenUrl)
    {
        $this->refreshTokenUrl = $refreshTokenUrl;

        return $this;
    }

    public function setTokenPrefix($prefix)
    {
        $this->tokenPrefix = $prefix === null ? '' : (string) $prefix;

        return $this;
    }

    public function getAuthDetails(): ?array
    {
        $this->clearLastError();

        $authDetails = parent::getAuthDetails();

        if (empty($authDetails)) {
            $this->setLastError(__('Connection auth details are missing', 'bit-integrations'));

            return null;
        }

        $generatedAt = $authDetails['generated_at'] ?? null;
        $expiresIn = $authDetails['expires_in'] ?? null;

        if ($this->isTokenExpired($generatedAt, $expiresIn)) {
            return $this->refreshAccessToken($authDetails);
        }

        return $authDetails;
    }

    public function getAccessToken()
    {
        $authDetails = $this->getAuthDetails();

        if ($authDetails === null) {
            return $this->getLastError() ?: [
                'error'   => true,
                'message' => __('Connection auth details are missing', 'bit-integrations'),
            ];
        }

        if (empty($authDetails['access_token'])) {
            $this->setLastError(__('Access token is missing', 'bit-integrations'));

            return $this->getLastError();
        }

        return $this->tokenPrefix . $authDetails['access_token'];
    }

    public function getAuthHeadersOrParams()
    {
        $token = $this->getAccessToken();

        if (\is_array($token) && !empty($token['error'])) {
            return $token;
        }

        return [
            'authLocation' => 'header',
            'data'         => ['Authorization' => $token],
        ];
    }

    public function refreshAccessToken(array $authDetails): ?array
    {
        $url = $this->refreshTokenUrl ?: ($authDetails['refresh_token_url'] ?? ($authDetails['refreshTokenUrl'] ?? ''));

        if (empty($url)) {
            $this->setLastError(__('Refresh token endpoint is missing', 'bit-integrations'));

            return null;
        }

        $body = $this->bodyParams ?: $this->buildRefreshBody($authDetails);
        $headers = $this->buildRefreshHeaders($authDetails);

        $requestOptions = [];
        $sslVerify = AuthDataCodec::normalizeSslVerify($authDetails['ssl_verify'] ?? null);

        if ($sslVerify !== null) {
            $requestOptions = [
                'sslverify' => $sslVerify,
                'verify'    => $sslVerify,
            ];
        }

        $response = HttpHelper::post($url, $body, $headers, $requestOptions);

        if (is_wp_error($response)) {
            $this->setLastError($response->get_error_message(), $response);

            return null;
        }

        if (HttpHelper::$responseCode < 200 || HttpHelper::$responseCode >= 300 || (\is_object($response) && isset($response->error))) {
            $message = \is_object($response) && isset($response->error)
                ? $response->error
                : __('Token refresh failed', 'bit-integrations');
            $this->setLastError((string) $message, $response);

            return null;
        }

        $response = \is_object($response) ? json_decode(wp_json_encode($response), true) : (array) $response;

        $authDetails['access_token'] = $response['access_token'] ?? ($authDetails['access_token'] ?? '');

        if (!empty($response['refresh_token'])) {
            $authDetails['refresh_token'] = $response['refresh_token'];
        }

        if (isset($response['expires_in'])) {
            $authDetails['expires_in'] = (int) $response['expires_in'];
        }

        $authDetails['generated_at'] = time();

        $this->updateAuthDetails($authDetails);

        return $authDetails;
    }

    private function buildRefreshBody(array $authDetails): array
    {
        $grantType = $authDetails['grant_type'] ?? 'authorization_code';
        $body = [
            'grant_type' => $grantType === 'client_credentials' ? 'client_credentials' : 'refresh_token',
        ];

        // Body auth is the default. Header auth puts client credentials in Authorization
        // header instead — see buildRefreshHeaders.
        if ($this->resolveClientAuthMode($authDetails) !== 'header') {
            $body['client_id'] = $authDetails['client_id'] ?? ($authDetails['clientId'] ?? '');
            $body['client_secret'] = $authDetails['client_secret'] ?? ($authDetails['clientSecret'] ?? '');
        }

        if (!empty($authDetails['refresh_token'])) {
            $body['refresh_token'] = $authDetails['refresh_token'];
        }

        return $body;
    }

    private function buildRefreshHeaders(array $authDetails): array
    {
        $headers = ['Content-Type' => 'application/x-www-form-urlencoded'];

        if ($this->resolveClientAuthMode($authDetails) === 'header') {
            $clientId = $authDetails['client_id'] ?? ($authDetails['clientId'] ?? '');
            $clientSecret = $authDetails['client_secret'] ?? ($authDetails['clientSecret'] ?? '');
            $headers['Authorization'] = 'Basic ' . base64_encode($clientId . ':' . $clientSecret);
        }

        return $headers;
    }

    private function resolveClientAuthMode(array $authDetails): string
    {
        $mode = $authDetails['clientAuthentication'] ?? ($authDetails['client_authentication'] ?? 'body');

        return $mode === 'header' ? 'header' : 'body';
    }
}
