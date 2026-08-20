<?php

namespace BitApps\Integrations\Core\Database;

class ConnectionModel extends Model
{
    public const STATUS_VERIFIED = 1;

    public const STATUS_PENDING = 2;

    public const STATUS_FAILED = 3;

    protected static $table = 'btcbi_connections';
}
