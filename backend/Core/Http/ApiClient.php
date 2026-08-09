<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Core\Database\ConnectionModel;
use Throwable;

/**
 * Authenticated HTTP client for an integration, configured from a saved connection.
 *
 *     $api = new ApiClient($connectionId);
 *     $api->setBaseURL($api->getBaseURL() . '/v1');
 *     $api->setHeaders(['Accept' => 'application/json']);
 *
 *     $api->setBody($payload);
 *     $response = $api->post('records');
 *     $response = $api->get('records', ['limit' => 100]);
 *
 * The auth type and app slug come from the connection row, so nothing but the id is
 * needed. Credentials resolve on the first request, not on construction: building a
 * client stays free of side effects (an OAuth2 getter can trigger a token refresh).
 *
 * setBody() sets the payload for the NEXT request only — it is cleared once sent, so a
 * client reused across calls never leaks one request's body into the next.
 *
 * Every call returns an ApiResponse (ok/status/body/error); what counts as a failure is
 * the caller's decision, since providers disagree about how they report one.
 */
class ApiClient extends BaseApi
{
    /**
     * @var int
     */
    private $connectionId = 0;

    /**
     * @var mixed payload for the next request
     */
    private $body;

    /**
     * @var bool
     */
    private $authResolved = false;

    /**
     * @var null|string set by setBaseURL(), overrides the connection's endpoint base
     */
    private $baseUrlOverride;

    /**
     * @var null|ApiResponse the most recent response, for callers that inspect it
     */
    private $response;

    /**
     * @var null|string when set, the connection must belong to this app
     */
    private $appSlug;

    /**
     * @var null|string why the client could not be prepared
     */
    private $setupError;

    public function __construct($connectionId = 0)
    {
        if (!empty($connectionId)) {
            $this->setConnectionId($connectionId);
        }
    }

    public function setConnectionId($connectionId): self
    {
        $this->connectionId = (int) $connectionId;
        $this->auth = null;
        $this->authResolved = false;
        $this->setupError = null;
        // The old base belonged to the old connection's tenant.
        $this->baseUrlOverride = null;

        return $this;
    }

    public function getConnectionId(): int
    {
        return $this->connectionId;
    }

    /**
     * Bind this client to the integration using it. A connection_id arrives as a bare
     * integer, so nothing about it says which app it belongs to: without this, pointing
     * one integration's action at another's connection_id decrypts that app's token and
     * ships it to this app's endpoint. Mirrors CredentialInjector::belongsToIntegration().
     */
    public function setAppSlug(?string $appSlug): self
    {
        $this->appSlug = $appSlug;
        $this->authResolved = false;
        $this->auth = null;

        return $this;
    }

    /**
     * The API base saved with the connection — the account's own host for per-tenant
     * providers, empty when the connection stores none. Empty string rather than null
     * keeps `getBaseURL() . '/v1'` from emitting a deprecation on PHP 8.1+.
     */
    public function getBaseURL(): string
    {
        if ($this->baseUrlOverride !== null) {
            return $this->baseUrlOverride;
        }

        $auth = $this->auth();

        return $auth === null ? '' : rtrim((string) $auth->getEndpointBase(), '/');
    }

    public function setBaseURL(?string $baseUrl): self
    {
        $this->baseUrlOverride = $baseUrl === null ? null : rtrim($baseUrl, '/');

        return $this;
    }

    /**
     * Headers sent on every request. Replaces what was set before.
     *
     * @param array<string, string> $headers
     */
    public function setHeaders(array $headers): self
    {
        $this->defaultHeaders = $headers;

        return $this;
    }

    /**
     * @param array<string, string> $headers
     */
    public function addHeaders(array $headers): self
    {
        $this->defaultHeaders = array_merge($this->defaultHeaders, $headers);

        return $this;
    }

    /**
     * @param mixed $body
     */
    public function setBody($body): self
    {
        $this->body = $body;

        return $this;
    }

    /**
     * @param null|array|object $payload overrides setBody() for this call
     */
    public function get(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->send('GET', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function post(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->send('POST', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function put(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->send('PUT', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function patch(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->send('PATCH', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function delete(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->send('DELETE', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function send(string $method, string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        // setBody() is for one request; taking it here stops a reused client from
        // sending a previous call's payload.
        if ($payload === null) {
            $payload = $this->body;
        }

        $this->body = null;

        if ($this->auth() === null) {
            return $this->response = ApiResponse::fail(0, $this->setupError ?: __('Connection is not configured', 'bit-integrations'));
        }

        return $this->response = parent::request($method, $path, $payload, $headers);
    }

    /**
     * The most recent response. Platforms report failures differently — some inside a
     * 2xx body — so the caller decides what counts as an error rather than the client
     * guessing on its behalf.
     */
    public function getResponse(): ?ApiResponse
    {
        return $this->response;
    }

    public function getResponseCode(): int
    {
        return $this->response === null ? 0 : $this->response->getStatus();
    }

    /**
     * @return mixed
     */
    public function getResponseBody()
    {
        return $this->response === null ? null : $this->response->getBody();
    }

    /**
     * Why the last setup or request could not run, when one failed.
     */
    public function getSetupError(): ?string
    {
        return $this->setupError;
    }

    protected function baseUrl(): ?string
    {
        $base = $this->getBaseURL();

        return $base === '' ? null : $base;
    }

    /**
     * app_slug is stored as the integration's display name ("Zoho CRM") while callers
     * pass a bare slug ("zohocrm"), so both sides reduce to alphanumerics before
     * comparing. No slug set means the caller opted out of the check.
     */
    private function belongsToApp($storedSlug): bool
    {
        if ($this->appSlug === null || $this->appSlug === '' || empty($storedSlug)) {
            return true;
        }

        $normalize = static function ($value) {
            return strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $value));
        };

        return $normalize($storedSlug) === $normalize($this->appSlug);
    }

    /**
     * The connection row carries both the auth type and the app slug, so the handler is
     * built from the id alone. Resolved once, on first use.
     */
    private function auth()
    {
        if ($this->authResolved) {
            return $this->auth;
        }

        $this->authResolved = true;

        if ($this->connectionId <= 0) {
            $this->setupError = __('No connection selected', 'bit-integrations');

            return null;
        }

        $connection = (new ConnectionModel())->get(
            ['id', 'app_slug', 'auth_type'],
            ['id' => $this->connectionId],
            1
        );

        if (is_wp_error($connection) || empty($connection[0]->auth_type)) {
            $this->setupError = __('Connection not found', 'bit-integrations');

            return null;
        }

        if (!$this->belongsToApp($connection[0]->app_slug ?? '')) {
            $this->setupError = __('Connection belongs to a different app', 'bit-integrations');

            return null;
        }

        try {
            $this->auth = AuthorizationFactory::getAuthorizationHandler(
                $connection[0]->auth_type,
                $this->connectionId,
                $connection[0]->app_slug ?? ''
            );
        } catch (Throwable $e) {
            $this->setupError = $e->getMessage();

            return null;
        }

        return $this->auth;
    }
}
