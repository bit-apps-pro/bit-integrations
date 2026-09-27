<?php

declare(strict_types=1);

$vendor = dirname(__DIR__, 2) . '/vendor/autoload.php';

if (!is_readable($vendor)) {
    fwrite(STDERR, "Run: composer --working-dir=tools/restructure install\n");

    exit(3);
}

require_once $vendor;

spl_autoload_register(static function (string $class): void {
    $prefix = 'BitApps\\Restructure\\Contract\\Smoke\\';

    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $file = __DIR__ . '/src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';

    if (is_file($file)) {
        require_once $file;
    }
});
