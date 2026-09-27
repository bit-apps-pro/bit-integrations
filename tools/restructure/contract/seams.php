<?php

declare(strict_types=1);

use BitApps\Restructure\Contract\Lib\FirePoints;

require_once __DIR__ . '/lib/autoload.php';

if ($argc !== 2 || !is_dir($argv[1])) {
    fwrite(STDERR, "usage: php tools/restructure/contract/seams.php <actions-dir>   (e.g. backend/Actions)\n");

    exit(2);
}

try {
    $rows = FirePoints::scan(rtrim($argv[1], '/\\'));
} catch (Throwable $e) {
    fwrite(STDERR, 'seams failed: ' . $e->getMessage() . "\n");

    exit(1);
}

echo FirePoints::HEADER, "\n";

foreach ($rows as $row) {
    echo $row, "\n";
}
