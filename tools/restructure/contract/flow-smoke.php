<?php

declare(strict_types=1);

use BitApps\Restructure\Contract\Smoke\FlowSmoke;
use BitApps\Restructure\Contract\Smoke\Options;
use BitApps\Restructure\Contract\Smoke\Session;

require __DIR__ . '/harness/autoload.php';

$usage = <<<'TXT'
Usage: php tools/restructure/contract/flow-smoke.php --wp=<WordPress root> (--only=A,B | --batch=F1)
         [--record=DIR | --compare=DIR] [--results=DIR] [--pro=on,off] [--force-expiry] [--flow=ID,...]
         [--timeout=180] [--keep-tmp] [--verbose]

Replays every stored flow whose action type is one of the selected integrations, plus the
fixture flows in harness/fixtures/flows/<Integration>/, through Flow::execute, one
`wp eval-file` process per flow and Pro state. Field values come from the flow's latest
btcbi_log capture, else from its field_map. Each process runs inside a transaction that is
rolled back; HTTP and mail are stubbed. --pro=off runs with --skip-plugins=bit-integrations-pro.
--force-expiry adds a run per state with tokenDetails (and the connection) expired, and fails
unless the token is written back (T1).
--record writes one JSON per flow into DIR; --compare re-runs with the recorded inputs and
exits 1 on any difference, including a PHP diagnostic or error_log line the baseline lacks.
--results (with --compare) writes flow-smoke and, with --force-expiry, T1 evidence per
integration for bi verify --tests. Exit 2 means a safety check failed.

TXT;

try {
    $options = new Options($argv);

    if ($options->flag('help')) {
        fwrite(STDOUT, $usage);

        exit(0);
    }

    exit((new FlowSmoke(new Session($options)))->run());
} catch (InvalidArgumentException $e) {
    fwrite(STDERR, $e->getMessage() . "\n\n" . $usage);

    exit(3);
} catch (Throwable $e) {
    fwrite(STDERR, 'flow smoke: ' . $e->getMessage() . "\n");

    exit(3);
}
