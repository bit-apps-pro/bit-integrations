<?php

declare(strict_types=1);

$vendorAutoload = dirname(__DIR__, 2) . '/vendor/autoload.php';

if (!is_file($vendorAutoload)) {
    fwrite(STDERR, "tools/restructure/vendor is missing; run: composer --working-dir=tools/restructure install\n");

    exit(2);
}

require_once $vendorAutoload;

spl_autoload_register(static function (string $class): void {
    $prefix = 'BitApps\\Restructure\\Contract\\Lib\\';

    if (strncmp($class, $prefix, \strlen($prefix)) !== 0) {
        return;
    }

    $file = __DIR__ . '/' . str_replace('\\', '/', substr($class, \strlen($prefix))) . '.php';

    if (is_file($file)) {
        require_once $file;
    }
});
