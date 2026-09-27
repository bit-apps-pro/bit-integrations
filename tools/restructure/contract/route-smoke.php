<?php

declare(strict_types=1);

use BitApps\Restructure\Contract\Smoke\Options;
use BitApps\Restructure\Contract\Smoke\RouteSmoke;
use BitApps\Restructure\Contract\Smoke\Session;

require __DIR__ . '/harness/autoload.php';

$usage = <<<'TXT'
Usage: php tools/restructure/contract/route-smoke.php --wp=<WordPress root> (--only=A,B | --batch=F1)
         [--record=DIR | --compare=DIR] [--pro=on,off] [--timeout=180] [--keep-tmp] [--verbose]

Runs every route of the selected integrations in its own `wp eval-file` process, the way
admin-ajax.php and Route::action dispatch it, once without and once with a connection_id.
Each process runs inside a transaction that is rolled back; HTTP and mail are stubbed.
--record writes one JSON per route into DIR; --compare re-runs with the recorded inputs and
exits 1 on any difference. Exit 2 means a safety check failed.

TXT;

try {
    $options = new Options($argv);

    if ($options->flag('help')) {
        fwrite(STDOUT, $usage);

        exit(0);
    }

    exit((new RouteSmoke(new Session($options)))->run());
} catch (InvalidArgumentException $e) {
    fwrite(STDERR, $e->getMessage() . "\n\n" . $usage);

    exit(3);
} catch (Throwable $e) {
    fwrite(STDERR, 'route smoke: ' . $e->getMessage() . "\n");

    exit(3);
}
