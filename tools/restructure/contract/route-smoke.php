<?php

declare(strict_types=1);

use BitApps\Restructure\Contract\Smoke\Options;
use BitApps\Restructure\Contract\Smoke\RouteSmoke;
use BitApps\Restructure\Contract\Smoke\Session;

require __DIR__ . '/harness/autoload.php';

$usage = <<<'TXT'
Usage: php tools/restructure/contract/route-smoke.php --wp=<WordPress root> (--only=A,B | --batch=F1)
         [--record=DIR | --compare=DIR] [--results=DIR] [--pro=on,off] [--timeout=180] [--keep-tmp] [--verbose]

Runs every route of the selected integrations in its own `wp eval-file` process, the way
admin-ajax.php and Route::action dispatch it, once without and once with a connection_id (T3).
The connection variant uses a fixture btcbi_connections row built from the handler's $authConfig.
Each process runs inside a transaction that is rolled back; HTTP, mail and DNS are stubbed.
--record writes one JSON per route into DIR; --compare re-runs with the recorded inputs and
exits 1 on any difference, including a PHP warning/notice/deprecation or error_log line the
baseline lacks (harness/fixtures/allowed-diagnostics.txt lists expected ones).
Either mode exits 1 when a handler that makes HTTP calls reaches none, unless the route is in
harness/fixtures/coverage-exempt.json with a reason.
--results (with --compare) writes route-smoke and T3 evidence per integration for bi verify --tests.
Exit 2 means a safety check failed.

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
