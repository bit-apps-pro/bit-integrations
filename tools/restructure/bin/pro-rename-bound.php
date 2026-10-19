<?php

if ($argc < 4) {
    fwrite(STDERR, "Usage: php pro-rename-bound.php <proRoot> <Folder> <BoundClass>\n");

    exit(2);
}

[, $proRoot, $folder, $old] = $argv;
$new = $folder . 'Service';
$dir = "{$proRoot}/backend/Actions/{$folder}";
$namespace = 'BitApps\\IntegrationsPro\\Actions\\' . $folder;

function wholeWord(string $text, string $from, string $to, int &$count): string
{
    return preg_replace('/(?<![A-Za-z0-9_\\\\])' . preg_quote($from, '/') . '(?![A-Za-z0-9_])/', $to, $text, -1, $count);
}

function run(string $cmd): void
{
    exec($cmd . ' 2>&1', $out, $code);

    if ($code !== 0) {
        fwrite(STDERR, "failed: {$cmd}\n" . implode("\n", $out) . "\n");

        exit(1);
    }
}

$renames = [[$old, $new]];

if ($folder === 'WebbaBooking' && is_file("{$dir}/Helper.php")) {
    $renames[] = ['Helper', 'WebbaBookingHelper'];
}

foreach ($renames as [$from, $to]) {
    if (is_file("{$dir}/{$to}.php")) {
        fwrite(STDERR, "{$dir}/{$to}.php already exists\n");

        exit(1);
    }

    run('git -C ' . escapeshellarg($proRoot) . ' mv ' . escapeshellarg("backend/Actions/{$folder}/{$from}.php") . ' ' . escapeshellarg("backend/Actions/{$folder}/{$to}.php"));
}

foreach (glob("{$dir}/*.php") as $file) {
    $text = file_get_contents($file);
    $original = $text;

    foreach ($renames as [$from, $to]) {
        $count = 0;
        $text = str_replace($namespace . '\\' . $from, $namespace . '\\' . $to, $text);
        $text = wholeWord($text, $from, $to, $count);
    }

    if ($text !== $original) {
        file_put_contents($file, $text);
        echo basename($file), " updated\n";
    }
}

foreach ($renames as [, $to]) {
    if (!preg_match('/^\s*(?:final\s+|abstract\s+)?class\s+' . preg_quote($to, '/') . '\b/m', file_get_contents("{$dir}/{$to}.php"))) {
        fwrite(STDERR, "{$to}.php does not declare class {$to}\n");

        exit(1);
    }
}
