<?php

namespace BitApps\Integrations\Core\Database;

class ConnectionModel extends Model
{
    /**
     * Accepted 'status' wire values, validated by ConnectionController::sanitizeStatus().
     *
     * STATUS_VERIFIED is the default written on save/reauthorize; STATUS_PENDING and
     * STATUS_FAILED are reserved/accepted values a client may send.
     */
    public const STATUS_VERIFIED = 1;

    public const STATUS_PENDING = 2;

    public const STATUS_FAILED = 3;

    protected static $table = 'btcbi_connections';
}
