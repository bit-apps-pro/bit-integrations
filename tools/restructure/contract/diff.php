<?php

declare(strict_types=1);

use BitApps\Restructure\Contract\Lib\ClassRenames;
use BitApps\Restructure\Contract\Lib\Json;
use BitApps\Restructure\Contract\Lib\SnapshotDiff;

require_once __DIR__ . '/lib/autoload.php';

$usage = "usage: php tools/restructure/contract/diff.php <base.json> <head.json> [--allow=From:To,...] [--verbose]\n";
$files = [];
$allow = '';
$verbose = false;

foreach (array_slice($argv, 1) as $argument) {
    if (str_starts_with($argument, '--allow=')) {
        $allow = substr($argument, \strlen('--allow='));
    } elseif ($argument === '--verbose') {
        $verbose = true;
    } elseif (str_starts_with($argument, '--')) {
        fwrite(STDERR, "unknown option {$argument}\n{$usage}");

        exit(2);
    } else {
        $files[] = $argument;
    }
}

if (\count($files) !== 2) {
    fwrite(STDERR, $usage);

    exit(2);
}

try {
    $renames = ClassRenames::fromOption($allow);
    $base = Json::decodeFile($files[0]);
    $head = Json::decodeFile($files[1]);
} catch (Throwable $e) {
    fwrite(STDERR, $e->getMessage() . "\n");

    exit(2);
}

$diff = new SnapshotDiff($renames);
$diff->compare($base, $head);

$accepted = $diff->acceptedRenames();
$problems = $diff->problems();

if ($verbose) {
    foreach ($accepted as $rename => $occurrences) {
        echo "renamed  {$rename} ({$occurrences})\n";
    }
}

foreach ($problems as $problem) {
    echo "DIFF  {$problem}\n";
}

echo \sprintf(
    "%s: %d difference(s); %d allowed class rename(s) across %d field(s)\n",
    $problems === [] ? 'equivalent' : 'NOT equivalent',
    \count($problems),
    \count($accepted),
    array_sum($accepted)
);

exit($problems === [] ? 0 : 1);
