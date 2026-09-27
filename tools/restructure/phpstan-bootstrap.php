<?php

$freeRoot = dirname(__DIR__, 2);

if (!defined('BIT_INTEGRATIONS_PLUGIN_FILE')) {
    define('BIT_INTEGRATIONS_PLUGIN_FILE', $freeRoot . '/bitwpfi.php');
}

require_once $freeRoot . '/vendor/autoload.php';
