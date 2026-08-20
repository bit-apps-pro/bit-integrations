<?php

namespace BitApps\Integrations\controller;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Authorization\Support\AuthDataCodec;
use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Database\ConnectionModel;
use BitApps\Integrations\Core\Database\FlowModel;
use BitApps\Integrations\Core\Http\ConnectionTestApi;
use BitApps\Integrations\Core\Util\Capabilities;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Core\Util\PluginCheck;
use Exception;
use Throwable;
use WP_Error;

final class ConnectionController
{
    private const ALLOWED_AUTH_TYPES = [
        AuthorizationType::WP_PLUGIN_CHECK,
        AuthorizationType::BASIC_AUTH,
        AuthorizationType::API_KEY,
        AuthorizationType::BEARER_TOKEN,
        AuthorizationType::OAUTH2,
        AuthorizationType::OAUTH1,
        AuthorizationType::CUSTOM,
    ];

    private const COLUMNS = [
        'id',
        'app_slug',
        'auth_type',
        'connection_name',
        'account_name',
        'encrypt_keys',
        'auth_details',
        'status',
        'user_id',
        'created_at',
        'updated_at',
    ];

    /**
     * Credentials that must be encrypted at rest for a given auth type, regardless
     * of what the client asked for.
     *
     * encrypt_keys arrives from the client, so without a server-side floor a caller
     * (or an integration that simply forgets to declare its keys) can have secrets
     * written to the database in plaintext. Mirrors defaultEncryptKeys in
     * frontend/src/Utils/connectionAuth.js.
     *
     * @var array<string, string[]>
     */
    private const ENCRYPT_KEY_FLOOR = [
        AuthorizationType::API_KEY      => ['value'],
        AuthorizationType::BASIC_AUTH   => ['username', 'password'],
        AuthorizationType::BEARER_TOKEN => ['token'],
        AuthorizationType::OAUTH2       => ['client_secret', 'access_token', 'refresh_token'],
        AuthorizationType::OAUTH1       => ['consumer_secret', 'access_token', 'access_token_secret'],
    ];

    /**
     * Auth types with no fixed credential shape, so no floor can be derived for them.
     *
     * These must declare their own encrypt_keys; a save that omits them is rejected
     * rather than stored. Defaulting to [] instead would mean "encrypt nothing" —
     * the secrets would be written to the database in plaintext AND handed back in
     * full by getById/save, which is the opposite of a safe default.
     */
    private const ENCRYPT_KEYS_REQUIRED_TYPES = [
        AuthorizationType::CUSTOM,
    ];

    public function index($request)
    {
        $this->guard();

        $appSlug = $this->sanitizeScalar($request->app_slug ?? '');
        $includeLinkedIntegrations = $this->isTruthy($request->include_linked_integrations ?? false);
        $condition = ['status' => ConnectionModel::STATUS_VERIFIED];

        if ($appSlug !== '') {
            $condition['app_slug'] = $appSlug;
        }

        $rows = (new ConnectionModel())->get(self::COLUMNS, $condition, null, null, 'id', 'DESC');

        if (is_wp_error($rows)) {
            wp_send_json_success(['data' => []]);
        }

        $linkedIntegrationMap = [];

        if ($includeLinkedIntegrations) {
            $linkedIntegrationMap = $this->buildLinkedIntegrationMap();

            if (is_wp_error($linkedIntegrationMap)) {
                wp_send_json_error($linkedIntegrationMap->get_error_message());
            }
        }

        $payload = [];

        foreach ($rows as $row) {
            $linkedIntegrations = $includeLinkedIntegrations
                ? ($linkedIntegrationMap[(int) ($row->id ?? 0)] ?? [])
                : null;

            $payload[] = $this->formatListRow($row, $linkedIntegrations);
        }

        wp_send_json_success(['data' => $payload]);
    }

    public function getById($request)
    {
        $this->guard();

        $id = $this->normalizeId($request);

        if ($id === 0) {
            wp_send_json_error(__('Connection id is required', 'bit-integrations'));
        }

        $row = $this->findById($id);

        if (is_wp_error($row)) {
            wp_send_json_error($row->get_error_message());
        }

        wp_send_json_success(['data' => $this->formatRow($row)]);
    }

    public function save($request)
    {
        $this->guard();

        $payload = $this->buildPayload($request, false);

        if (is_wp_error($payload)) {
            wp_send_json_error($payload->get_error_message());
        }

        // Upsert policy: same (app_slug, auth_type, account_name) is treated as the same
        // connection and gets refreshed. Prevents accidental duplicates when
        // re-authorizing the same account from a flow builder.
        //
        // Requires a caller-supplied account_name. A backfilled one is derived from the
        // app slug, so matching on it would make every nameless connection for an app
        // collide and overwrite the previous one's credentials. Without a real account
        // name a new row is the only safe outcome: a duplicate is recoverable, a
        // clobbered credential is not.
        $existingId = empty($payload['account_name_provided'])
            ? 0
            : $this->findExistingIdForAccount(
                $payload['app_slug'],
                $payload['account_name'],
                $payload['auth_type']
            );

        if ($existingId > 0) {
            $updated = $this->persist($payload, $existingId);

            if (is_wp_error($updated)) {
                wp_send_json_error($updated->get_error_message());
            }

            wp_send_json_success(['data' => $this->formatRow($updated)]);
        }

        $created = $this->persist($payload, 0);

        if (is_wp_error($created)) {
            wp_send_json_error($created->get_error_message());
        }

        wp_send_json_success(['data' => $this->formatRow($created)]);
    }

    public function update($request)
    {
        $this->guard();

        $id = $this->normalizeId($request);

        if ($id === 0) {
            wp_send_json_error(__('Connection id is required', 'bit-integrations'));
        }

        $name = $this->sanitizeScalar($request->connection_name ?? '');

        if ($name === '') {
            wp_send_json_error(__('Connection name is required', 'bit-integrations'));
        }

        $existing = $this->findById($id);

        if (is_wp_error($existing)) {
            wp_send_json_error($existing->get_error_message());
        }

        $update = [
            'connection_name' => $name,
            'updated_at'      => current_time('mysql'),
        ];

        if (isset($request->status)) {
            $update['status'] = $this->sanitizeStatus($request->status, ConnectionModel::STATUS_VERIFIED);
        }

        $result = (new ConnectionModel())->update($update, ['id' => $id]);

        if (is_wp_error($result) && $result->get_error_code() !== 'result_empty') {
            wp_send_json_error($result->get_error_message());
        }

        $row = $this->findById($id);

        if (is_wp_error($row)) {
            wp_send_json_error($row->get_error_message());
        }

        wp_send_json_success(['data' => $this->formatRow($row)]);
    }

    public function reauthorize($request)
    {
        $this->guard();

        $id = $this->normalizeId($request);

        if ($id === 0) {
            wp_send_json_error(__('Connection id is required', 'bit-integrations'));
        }

        if (empty($request->auth_details)) {
            wp_send_json_error(__('Authorization details are required', 'bit-integrations'));
        }

        $existing = $this->findById($id);

        if (is_wp_error($existing)) {
            wp_send_json_error($existing->get_error_message());
        }

        // Inherit the row's existing encrypt_keys when the request omits them, on top of
        // the floor for its auth type. Re-resolving from the request alone would let a
        // reauthorize that simply does not send the field rewrite encrypt_keys to '' and
        // store the new credentials in plaintext.
        $payload = [
            'app_slug'        => $existing->app_slug,
            'auth_type'       => (string) $existing->auth_type,
            'connection_name' => $existing->connection_name,
            'account_name'    => $existing->account_name,
            'status'          => ConnectionModel::STATUS_VERIFIED,
            'auth_details'    => $this->normalizeArray($request->auth_details),
            'encrypt_keys'    => array_values(array_unique(array_merge(
                AuthDataCodec::parseEncryptKeys($existing->encrypt_keys ?? ''),
                $this->resolveEncryptKeys($request, (string) $existing->auth_type)
            ))),
        ];

        if (!empty($request->account_name)) {
            $payload['account_name'] = $this->sanitizeScalar($request->account_name);
        }

        if (!empty($request->connection_name)) {
            $payload['connection_name'] = $this->sanitizeScalar($request->connection_name);
        }

        $row = $this->persist($payload, $id);

        if (is_wp_error($row)) {
            wp_send_json_error($row->get_error_message());
        }

        wp_send_json_success(['data' => $this->formatRow($row)]);
    }

    public function authorize($request)
    {
        $this->guard();

        $authType = $this->sanitizeScalar($request->auth_type ?? '');

        if (empty($authType)) {
            wp_send_json_error(__('Auth type is required', 'bit-integrations'));
        }

        if (!\in_array($authType, self::ALLOWED_AUTH_TYPES, true)) {
            wp_send_json_error(__('Invalid auth type', 'bit-integrations'));
        }

        if ($authType === AuthorizationType::WP_PLUGIN_CHECK) {
            wp_send_json_error(
                __('WP Plugin Check does not use credential authorization. Use Plugin check endpoint instead.', 'bit-integrations'),
                400
            );
        }

        $appSlug = $this->sanitizeScalar($request->app_slug ?? '');
        $apiEndpoint = esc_url_raw((string) ($request->api_endpoint ?? ''));
        $method = strtoupper($this->sanitizeScalar($request->method ?? 'GET'));
        $payload = isset($request->payload) ? $this->normalizePayload($request->payload) : null;
        $headers = $this->normalizeHeaders($request->headers ?? []);

        if (empty($request->auth_details)) {
            wp_send_json_error(__('Authorization details are required', 'bit-integrations'));
        }

        if (empty($apiEndpoint)) {
            wp_send_json_error(__('API endpoint is required', 'bit-integrations'));
        }

        if (!$this->isPublicHttpsUrl($apiEndpoint)) {
            wp_send_json_error(__('API endpoint must be a public https endpoint', 'bit-integrations'), 400);
        }

        $authDetails = $this->normalizeArray($request->auth_details);

        if (empty($authDetails)) {
            wp_send_json_error(__('Authorization details are required', 'bit-integrations'));
        }

        try {
            // connectionId 0 + an override is the inline-credential seam: nothing is
            // persisted yet, so the handler reads the posted details directly.
            $handler = AuthorizationFactory::getAuthorizationHandler($authType, 0, $appSlug);
            $handler->setAuthDetailsOverride($authDetails);
            $result = (new ConnectionTestApi($handler))->test($apiEndpoint, $method, $payload, $headers);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }

        if (!empty($result['error'])) {
            wp_send_json_error(
                [
                    'message'  => $result['message'] ?? __('Authorization failed', 'bit-integrations'),
                    'response' => $result['response'] ?? null,
                ],
                400
            );
        }

        wp_send_json_success(
            [
                'message'  => __('Authorization successful', 'bit-integrations'),
                'response' => $result['response'] ?? null,
            ],
            200
        );
    }

    public function delete($request)
    {
        $this->guard();

        // Deleting a connection requires a delete-scoped capability (mirrors flow
        // deletion, Flow::deleteFlow) — the generic manage/create/edit guard above
        // is not sufficient for a destructive action.
        if (
            !Capabilities::Check('manage_options')
            && !Capabilities::Check(Config::withPrefix('manage_integrations'))
            && !Capabilities::Check(Config::withPrefix('delete_integrations'))
        ) {
            wp_send_json_error(__('You do not have permission to delete connections', 'bit-integrations'));
        }

        $id = $this->normalizeId($request);

        if ($id === 0) {
            wp_send_json_error(__('Connection id is required', 'bit-integrations'));
        }

        $linkedIntegrations = $this->getLinkedIntegrations($id);

        if (is_wp_error($linkedIntegrations)) {
            wp_send_json_error($linkedIntegrations->get_error_message());
        }

        if (!empty($linkedIntegrations)) {
            $linkedIntegrationCount = \count($linkedIntegrations);
            wp_send_json_error(
                [
                    'message' => wp_sprintf(
                        // translators: %d: number of linked integrations
                        __('Connection is linked with %d integration(s). Remove this connection from those integrations before deleting.', 'bit-integrations'),
                        $linkedIntegrationCount
                    ),
                    'linked_integrations' => $linkedIntegrations,
                    'linked_count'        => $linkedIntegrationCount,
                ],
                409
            );
        }

        $result = (new ConnectionModel())->delete(['id' => $id]);

        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }

        wp_send_json_success(['id' => $id]);
    }

    /**
     * Confirm a WordPress-plugin Plugin is installed/active. No DB persistence —
     * caller supplies a check spec (class/function/constant/plugin_file) with
     * AND/OR logic (optionally grouped) and PluginCheck evaluates it.
     *
     * Spec sanitization lives in PluginCheck so this controller stays a thin
     * adapter from the request shape to the evaluator.
     *
     * @param mixed $request
     */
    public function verifyPluginActivation($request)
    {
        $this->guard();

        $spec = ['logic' => $request->logic ?? null];

        if (isset($request->groups)) {
            $spec['groups'] = $request->groups;
        } else {
            $spec['checks'] = $request->checks ?? null;
        }

        $result = PluginCheck::evaluate($spec);

        if (empty($result['available'])) {
            wp_send_json_error(
                $result['message'] ?? __('Plugin check failed', 'bit-integrations'),
                400
            );
        }

        wp_send_json_success(['available' => true]);
    }

    /**
     * Server-side OAuth2 token exchange (auth_code, pkce, client_credentials, refresh_token).
     * Browsers cannot reach token endpoints (no CORS) and must not hold client_secret.
     *
     * @param mixed $request
     */
    public function oauth2Exchange($request)
    {
        $this->guard();

        $url = esc_url_raw((string) ($request->url ?? ''));
        $method = strtoupper($this->sanitizeScalar($request->method ?? 'POST'));
        $bodyParams = $this->normalizeArray($request->body_params ?? []);
        $headers = $this->normalizeHeaders($request->headers ?? []);

        if ($url === '') {
            wp_send_json_error(__('Token URL is required', 'bit-integrations'));
        }

        if (!$this->isPublicHttpsUrl($url)) {
            wp_send_json_error(__('Token URL must be a public https endpoint', 'bit-integrations'), 400);
        }

        if (!isset($headers['Content-Type']) && !isset($headers['content-type'])) {
            $headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        $options = [];

        // TLS verification is deliberately not negotiable from the request. This exchange
        // sends client_secret and receives access_token, so honouring a client-supplied
        // ssl_verify=false would hand an attacker a MITM on the credential itself. The URL
        // is already pinned to public HTTPS, where a valid certificate is the norm; a site
        // owner fronting an on-prem provider with a self-signed cert opts out per-URL here.
        if (!Hooks::apply('bit_integrations_connection_ssl_verify', true, $url)) {
            $options['sslverify'] = false;
            $options['verify'] = false;
        }

        $contentType = strtolower($headers['Content-Type'] ?? ($headers['content-type'] ?? ''));
        $isJson = strpos($contentType, 'application/json') !== false;
        // form-urlencoded: pass array, WP will http_build_query. JSON: encode. Default array.
        $payload = $isJson ? wp_json_encode($bodyParams) : $bodyParams;

        $response = $method === 'GET'
            ? HttpHelper::get($url, $bodyParams, $headers, $options)
            : HttpHelper::request($url, $method === '' ? 'POST' : $method, $payload, $headers, $options);

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message(), 400);
        }

        $responseCode = isset(HttpHelper::$responseCode) ? (int) HttpHelper::$responseCode : 0;
        $decoded = \is_object($response) ? Helper::jsonEncodeDecode($response) : $response;

        if ($responseCode < 200 || $responseCode >= 300 || (\is_array($decoded) && isset($decoded['error']))) {
            if (\is_array($decoded) && isset($decoded['error_description'])) {
                $errorMessage = $decoded['error_description'];
            } elseif (\is_array($decoded) && isset($decoded['error']) && \is_string($decoded['error'])) {
                $errorMessage = $decoded['error'];
            } else {
                $errorMessage = 'Token exchange failed';
            }

            wp_send_json_error(
                [
                    'message'  => $errorMessage,
                    'response' => $decoded,
                    'status'   => $responseCode,
                ],
                400
            );
        }

        wp_send_json_success(['data' => $decoded]);
    }

    private function buildPayload($request, bool $isUpdate)
    {
        $appSlug = $this->sanitizeScalar($request->app_slug ?? '');
        $authType = $this->sanitizeScalar($request->auth_type ?? '');

        if (!$isUpdate && $appSlug === '') {
            return new WP_Error('missing_app_slug', __('App slug is required', 'bit-integrations'));
        }

        if ($authType === AuthorizationType::WP_PLUGIN_CHECK) {
            return new WP_Error(
                'invalid_auth_type',
                __('WP Plugin Check does not require saving a reusable credential connection', 'bit-integrations')
            );
        }

        if ($authType !== '' && !\in_array($authType, self::ALLOWED_AUTH_TYPES, true)) {
            return new WP_Error('invalid_auth_type', __('Invalid auth type', 'bit-integrations'));
        }

        if (empty($request->auth_details)) {
            return new WP_Error('missing_auth_details', __('Authorization details are required', 'bit-integrations'));
        }

        $authDetails = $this->normalizeArray($request->auth_details);

        if (empty($authDetails)) {
            return new WP_Error('missing_auth_details', __('Authorization details are required', 'bit-integrations'));
        }

        $accountName = $this->sanitizeScalar($request->account_name ?? '');
        $connectionName = $this->sanitizeScalar($request->connection_name ?? '');

        // Only a caller-supplied account_name identifies a real account, and only that
        // may key the upsert. A synthesized one must never match an existing row: with
        // both names omitted the backfill below collapses to $appSlug for every account,
        // so a second connection would silently overwrite the first one's credentials.
        $accountNameProvided = $accountName !== '';

        if ($connectionName === '') {
            $connectionName = $accountName !== '' ? $accountName : $appSlug;
        }

        // Backfill account_name so the column is never empty — otherwise re-authorize
        // creates duplicate rows for the same logical account.
        if ($accountName === '') {
            $accountName = $connectionName;
        }

        $resolvedAuthType = $authType !== '' ? $authType : AuthorizationType::OAUTH2;

        return [
            'app_slug'              => $appSlug,
            'auth_type'             => $resolvedAuthType,
            'connection_name'       => $connectionName,
            'account_name'          => $accountName,
            'account_name_provided' => $accountNameProvided,
            'auth_details'          => $authDetails,
            'encrypt_keys'          => $this->resolveEncryptKeys($request, $resolvedAuthType),
            'status'                => isset($request->status)
                ? $this->sanitizeStatus($request->status, ConnectionModel::STATUS_VERIFIED)
                : ConnectionModel::STATUS_VERIFIED,
        ];
    }

    /**
     * Map an incoming status value to the allowed set, falling back to $default
     * when the value is not a recognised connection status.
     *
     * @param mixed $value
     */
    private function sanitizeStatus($value, int $default): int
    {
        $status = absint($value);

        $allowed = [
            ConnectionModel::STATUS_VERIFIED,
            ConnectionModel::STATUS_PENDING,
            ConnectionModel::STATUS_FAILED,
        ];

        return \in_array($status, $allowed, true) ? $status : $default;
    }

    private function persist(array $payload, int $existingId)
    {
        $authDetails = $payload['auth_details'];
        $encryptKeys = $payload['encrypt_keys'];

        if (!isset($authDetails['generated_at'])) {
            $authDetails['generated_at'] = time();
        }

        try {
            $authDetails = AuthDataCodec::encryptValues($authDetails, $encryptKeys);
        } catch (Throwable $e) {
            // Hash::encrypt throws rather than hand back an envelope it could not fill.
            // Refuse the save: storing the row anyway would write the credential to the
            // database in plaintext, which is the one outcome encrypt_keys exists to
            // prevent. The message is generic — the exception carries OpenSSL detail
            // that does not belong in an HTTP response.
            wp_send_json_error(__('Connection credentials could not be encrypted.', 'bit-integrations'), 500);
        }

        $now = current_time('mysql');

        $row = [
            'app_slug'        => $payload['app_slug'],
            'auth_type'       => $payload['auth_type'],
            'connection_name' => $payload['connection_name'],
            'account_name'    => $payload['account_name'],
            'encrypt_keys'    => implode(',', $encryptKeys),
            'auth_details'    => wp_json_encode($authDetails),
            'status'          => $payload['status'],
            'updated_at'      => $now,
        ];

        $connectionModel = new ConnectionModel();

        if ($existingId > 0) {
            $update = $connectionModel->update($row, ['id' => $existingId]);

            if (is_wp_error($update) && $update->get_error_code() !== 'result_empty') {
                return $update;
            }

            return $this->findById($existingId);
        }

        $row['user_id'] = get_current_user_id();
        $row['created_at'] = $now;

        $insertId = $connectionModel->insert($row);

        if (is_wp_error($insertId)) {
            return $insertId;
        }

        return $this->findById((int) $insertId);
    }

    /**
     * Reject non-https URLs and hosts that resolve to private / loopback / reserved ranges.
     * Token endpoints are always public https in practice; this closes SSRF surface for
     * the server-side token exchange.
     *
     * Known-partial: literal IPs are filtered, but hostnames are NOT DNS-resolved here —
     * a public hostname A-recording to a private IP would pass. Acceptable because the
     * caller is an authenticated admin and the URL is supplied per-flow (not user-input
     * from the public web). Add gethostbyname() screening if that threat model changes.
     */
    private function isPublicHttpsUrl(string $url): bool
    {
        // Shared with the OAuth2 refresh path so a URL rejected here cannot be reached
        // by a later refresh under a looser rule.
        return Common::isPublicHttpsUrl($url);
    }

    private function findById(int $id)
    {
        $rows = (new ConnectionModel())->get(self::COLUMNS, ['id' => $id], 1);

        if (is_wp_error($rows) || empty($rows[0])) {
            return new WP_Error('connection_not_found', __('Connection not found', 'bit-integrations'));
        }

        return $rows[0];
    }

    /**
     * The id of the existing connection this save should refresh, or 0 to create a new one.
     *
     * auth_type is part of the key: the same account can legitimately be connected two
     * ways (an API key and an OAuth2 grant), and those rows hold different credential
     * shapes. Matching on (app_slug, account_name) alone would let one overwrite the other.
     */
    private function findExistingIdForAccount(string $appSlug, string $accountName, string $authType = ''): int
    {
        if ($appSlug === '' || $accountName === '' || $authType === '') {
            return 0;
        }

        $rows = (new ConnectionModel())->get(
            ['id'],
            [
                'app_slug'     => $appSlug,
                'account_name' => $accountName,
                'auth_type'    => $authType,
                'status'       => ConnectionModel::STATUS_VERIFIED,
            ],
            1,
            null,
            'id',
            'DESC'
        );

        if (is_wp_error($rows) || empty($rows[0])) {
            return 0;
        }

        return (int) $rows[0]->id;
    }

    private function formatRow($row): array
    {
        $encryptKeys = AuthDataCodec::parseEncryptKeys($row->encrypt_keys ?? '');
        $authDetails = $this->normalizeArray($row->auth_details ?? null);
        $authDetails = $this->withoutSecrets($authDetails, $encryptKeys);

        return [
            'id'              => (int) $row->id,
            'app_slug'        => $row->app_slug,
            'auth_type'       => (string) ($row->auth_type ?? ''),
            'connection_name' => $row->connection_name,
            'account_name'    => $row->account_name,
            'encrypt_keys'    => $encryptKeys,
            'auth_details'    => $authDetails,
            'status'          => isset($row->status) ? (int) $row->status : ConnectionModel::STATUS_VERIFIED,
            'user_id'         => isset($row->user_id) ? (int) $row->user_id : 0,
            'created_at'      => $row->created_at ?? null,
            'updated_at'      => $row->updated_at ?? null,
        ];
    }

    /**
     * List responses should not expose decrypted credential payloads.
     *
     * @param mixed $row
     */
    private function formatListRow($row, ?array $linkedIntegrations = null): array
    {
        $payload = [
            'id'              => (int) $row->id,
            'app_slug'        => $row->app_slug,
            'auth_type'       => (string) ($row->auth_type ?? ''),
            'connection_name' => $row->connection_name,
            'account_name'    => $row->account_name,
            'status'          => isset($row->status) ? (int) $row->status : ConnectionModel::STATUS_VERIFIED,
            'user_id'         => isset($row->user_id) ? (int) $row->user_id : 0,
            'created_at'      => $row->created_at ?? null,
            'updated_at'      => $row->updated_at ?? null,
        ];

        if (\is_array($linkedIntegrations)) {
            $payload['linked_integrations'] = $linkedIntegrations;
            $payload['linked_count'] = \count($linkedIntegrations);
        }

        return $payload;
    }

    /**
     * Strip every credential the connection encrypts at rest.
     *
     * Responses carrying a connection must never hand back the secrets themselves.
     * Anything named in encrypt_keys is a credential by the connection's own
     * declaration, so it is dropped rather than decrypted; the remaining keys are
     * non-secret configuration (version, location_id, dataCenter, api_url, ...)
     * that the UI legitimately reads back. Callers needing to know a secret exists
     * can test encrypt_keys, which is still returned.
     *
     * Keys are dot-paths, resolved the same way AuthDataCodec encrypts them. A flat
     * unset() here would leave a nested credential (`tokenDetails.access_token`)
     * encrypted at rest but still present in the response.
     */
    private function withoutSecrets(array $authDetails, array $encryptKeys): array
    {
        foreach ($encryptKeys as $key) {
            AuthDataCodec::unsetNested($authDetails, (string) $key);
        }

        return $authDetails;
    }

    /**
     * Union the client's encrypt_keys with the server-side floor for this auth type.
     * A client may add keys but never drop one, and omitting the field entirely no
     * longer means "store everything in plaintext".
     *
     * Types with no derivable floor (CUSTOM) must declare their own keys: the request
     * is rejected instead of falling through to an empty set, which would store the
     * credentials in plaintext and return them verbatim to the browser.
     *
     * @param mixed $request
     */
    private function resolveEncryptKeys($request, string $authType = ''): array
    {
        $keys = $this->resolveRequestedEncryptKeys($request);
        $floor = self::ENCRYPT_KEY_FLOOR[$authType] ?? [];
        $resolved = array_values(array_unique(array_merge($floor, $keys)));

        if ($resolved === [] && \in_array($authType, self::ENCRYPT_KEYS_REQUIRED_TYPES, true)) {
            wp_send_json_error(
                __('This connection type must declare which credential fields to encrypt.', 'bit-integrations'),
                400
            );
        }

        return $resolved;
    }

    private function resolveRequestedEncryptKeys($request): array
    {
        if (!isset($request->encrypt_keys)) {
            return [];
        }

        if (\is_string($request->encrypt_keys)) {
            return AuthDataCodec::parseEncryptKeys($request->encrypt_keys);
        }

        if (\is_array($request->encrypt_keys)) {
            $keys = [];
            foreach ($request->encrypt_keys as $key) {
                $key = $this->sanitizeScalar($key);

                if ($key !== '') {
                    $keys[] = $key;
                }
            }

            return array_values(array_unique($keys));
        }

        return [];
    }

    private function normalizeArray($value): array
    {
        if (\is_array($value)) {
            return $value;
        }

        if (\is_object($value)) {
            return Helper::jsonEncodeDecode($value) ?: [];
        }

        if (\is_string($value) && $value !== '') {
            $decoded = json_decode($value, true);

            return \is_array($decoded) ? $decoded : [];
        }

        return [];
    }

    private function normalizePayload($value)
    {
        if (\is_array($value)) {
            return $value;
        }

        if (\is_object($value)) {
            return Helper::jsonEncodeDecode($value) ?: [];
        }

        return $value;
    }

    private function normalizeHeaders($value): array
    {
        if (\is_object($value)) {
            $value = Helper::jsonEncodeDecode($value) ?: [];
        }

        if (!\is_array($value)) {
            return [];
        }

        $headers = [];

        foreach ($value as $key => $headerValue) {
            if (!\is_scalar($key)) {
                continue;
            }

            $headerName = sanitize_text_field((string) $key);

            if ($headerName === '' || !\is_scalar($headerValue)) {
                continue;
            }

            $headers[$headerName] = sanitize_text_field((string) $headerValue);
        }

        return $headers;
    }

    private function getLinkedIntegrations(int $connectionId)
    {
        $linkedIntegrationMap = $this->buildLinkedIntegrationMap();

        if (is_wp_error($linkedIntegrationMap)) {
            return $linkedIntegrationMap;
        }

        return $linkedIntegrationMap[$connectionId] ?? [];
    }

    private function extractConnectionIdFromFlowDetails(array $flowDetails): int
    {
        foreach (['connection_id', 'connectionId'] as $key) {
            if (!isset($flowDetails[$key]) || $flowDetails[$key] === '') {
                continue;
            }

            return absint($flowDetails[$key]);
        }

        return 0;
    }

    private function buildLinkedIntegrationMap()
    {
        $flows = (new FlowModel())->get(['id', 'name', 'flow_details']);

        if (is_wp_error($flows)) {
            return $flows;
        }

        if (empty($flows)) {
            return [];
        }

        $linkedIntegrationMap = [];

        foreach ($flows as $flow) {
            $flowDetails = json_decode((string) ($flow->flow_details ?? ''), true);

            if (!\is_array($flowDetails)) {
                continue;
            }

            $connectionId = $this->extractConnectionIdFromFlowDetails($flowDetails);

            if ($connectionId < 1) {
                continue;
            }

            if (!isset($linkedIntegrationMap[$connectionId])) {
                $linkedIntegrationMap[$connectionId] = [];
            }

            $linkedIntegrationMap[$connectionId][] = [
                'id'   => absint($flow->id ?? 0),
                'name' => sanitize_text_field((string) ($flow->name ?? '')),
            ];
        }

        return $linkedIntegrationMap;
    }

    private function normalizeId($request): int
    {
        if (is_numeric($request)) {
            return absint($request);
        }

        if (\is_object($request)) {
            foreach (['id', 'connection_id', 'connectionId'] as $key) {
                if (!empty($request->{$key})) {
                    return absint($request->{$key});
                }
            }
        }

        if (\is_array($request)) {
            foreach (['id', 'connection_id', 'connectionId'] as $key) {
                if (!empty($request[$key])) {
                    return absint($request[$key]);
                }
            }
        }

        return 0;
    }

    private function sanitizeScalar($value): string
    {
        if (!\is_scalar($value)) {
            return '';
        }

        return sanitize_text_field((string) $value);
    }

    private function isTruthy($value): bool
    {
        if (\is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return absint($value) === 1;
        }

        if (!\is_scalar($value)) {
            return false;
        }

        $value = strtolower(trim((string) $value));

        return \in_array($value, ['1', 'true', 'yes', 'on'], true);
    }

    private function guard(): void
    {
        if (
            !Capabilities::Check('manage_options')
            && !Capabilities::Check(Config::withPrefix('manage_integrations'))
            && !Capabilities::Check(Config::withPrefix('create_integrations'))
            && !Capabilities::Check(Config::withPrefix('edit_integrations'))
        ) {
            wp_send_json_error(__('You do not have permission to manage connections', 'bit-integrations'));
        }
    }
}
