<?php

namespace BitApps\Integrations\Authorization\Contract;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AuthCredential;

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
     * @throws \BitApps\Integrations\Authorization\Exception\AuthorizationException when credentials cannot be produced
     */
    public function credential(): AuthCredential;

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
