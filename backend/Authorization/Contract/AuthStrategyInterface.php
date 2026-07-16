<?php

namespace BitApps\Integrations\Authorization\Contract;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AuthCredential;
use BitApps\Integrations\Authorization\RequestContext;

/**
 * Strategy consumed by BaseApi to authenticate outbound requests.
 */
interface AuthStrategyInterface
{
    /**
     * Produce the credential for ONE request. May compute per-call values
     * (e.g. KirimEmail HMAC + Timestamp), so callers must never memoize the
     * result across requests.
     *
     * $context describes the request being authenticated. Strategies whose credential
     * derives from stored secrets alone ignore it; OAuth 1.0a signs over the method,
     * URL and parameters and cannot produce a valid credential without it. Callers
     * should always pass it — it is optional only so the strategies that predate it
     * keep their signatures.
     *
     * @throws \BitApps\Integrations\Authorization\Exception\AuthorizationException when credentials cannot be produced
     */
    public function credential(?RequestContext $context = null): AuthCredential;

    /**
     * Region/instance-resolved API base URL persisted with the connection,
     * or null when the integration derives its base elsewhere.
     */
    public function getEndpointBase(): ?string;

    /**
     * Extra WP HTTP API options for every request (e.g. sslverify).
     */
    public function requestOptions(): array;
}
