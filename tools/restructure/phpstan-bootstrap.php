<?php

$freeRoot = \dirname(__DIR__, 2);
$pluginFile = $freeRoot . '/bitwpfi.php';

$pluginConstants = [
    'BIT_INTEGRATIONS_PLUGIN_FILE' => $pluginFile,
    'BTCBI_VERSION'                => '0.0.0',
    'BTCBI_PLUGIN_MAIN_FILE'       => $pluginFile,
    'BTCBI_PLUGIN_BASENAME'        => 'bit-integrations/bitwpfi.php',
    'BTCBI_PLUGIN_BASEDIR'         => $freeRoot . '/',
    'BTCBI_PLUGIN_DIR_PATH'        => $freeRoot . '/',
    'BTCBI_ROOT_URI'               => 'https://example.test/wp-content/plugins/bit-integrations',
    'BTCBI_ASSET_URI'              => 'https://example.test/wp-content/plugins/bit-integrations/assets',
];

foreach ($pluginConstants as $name => $value) {
    if (!\defined($name)) {
        \define($name, $value);
    }
}

require_once $freeRoot . '/vendor/autoload.php';
