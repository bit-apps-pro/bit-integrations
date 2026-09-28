<?php

declare(strict_types=1);

require_once __DIR__ . '/Dns.php';
require_once __DIR__ . '/resolver-stubs.php';
require_once __DIR__ . '/Scrub.php';
require_once __DIR__ . '/HarnessExit.php';
require_once __DIR__ . '/Probe.php';
require_once __DIR__ . '/Tables.php';
require_once __DIR__ . '/Runners.php';

BitApps\Restructure\Contract\Smoke\Wp\Probe::boot();
