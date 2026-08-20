<?php

namespace BitApps\Integrations\Authorization\Contract;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AuthCredential;
use BitApps\Integrations\Core\Http\ApiClient;

interface AuthStrategyInterface
{
    public function credential(): AuthCredential;

    public function getEndpointBase(): ?string;

    public function requestOptions(): array;

    public function applyCredential(ApiClient $client): void;
}
