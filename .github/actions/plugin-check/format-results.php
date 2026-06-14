<?php
/**
 * Render WordPress Plugin Check JSON results for GitHub Actions.
 *
 * Prints an aligned, file-grouped table to the log, writes a Markdown table to
 * the job summary, and exits non-zero when blocking findings are present.
 *
 * Usage: php format-results.php <results.json> [ignore-warnings]
 *
 * The input is WP-CLI `plugin check --format=json` output: a "FILE: <path>"
 * line followed by a JSON array of findings, repeated per file.
 */

$path           = $argv[1] ?? '';
$ignoreWarnings = filter_var($argv[2] ?? 'false', FILTER_VALIDATE_BOOLEAN);

$raw = ($path !== '' && is_readable($path)) ? (string) file_get_contents($path) : '';

$findings = [];
$file     = '';
foreach (preg_split('/\R/', $raw) as $line) {
    if (preg_match('/^FILE:\s*(.+)$/', $line, $m)) {
        $file = trim($m[1]);
        continue;
    }
    $line = trim($line);
    if ($line === '' || $line[0] !== '[') {
        continue;
    }
    $rows = json_decode($line, true);
    if (!is_array($rows)) {
        continue;
    }
    foreach ($rows as $row) {
        $row['file'] = $file;
        // With --ignore-warnings the tool omits the type field; all rows are errors.
        $row['type'] = $row['type'] ?? 'ERROR';
        $findings[]  = $row;
    }
}

$errors   = count(array_filter($findings, static fn ($f) => $f['type'] === 'ERROR'));
$warnings = count(array_filter($findings, static fn ($f) => $f['type'] === 'WARNING'));

// --- Log output: aligned columns, grouped by file ---
echo "::group::Plugin Check results\n";
if (!$findings) {
    echo "No issues found.\n";
}
$grouped = [];
foreach ($findings as $f) {
    $grouped[$f['file']][] = $f;
}
foreach ($grouped as $file => $rows) {
    $wLine = $wCol = $wType = 0;
    foreach ($rows as $r) {
        $wLine = max($wLine, strlen((string) $r['line']));
        $wCol  = max($wCol, strlen((string) $r['column']));
        $wType = max($wType, strlen($r['type']));
    }
    echo "\nFILE: {$file}\n";
    foreach ($rows as $r) {
        $message = preg_replace('/\s+/', ' ', (string) $r['message']);
        printf(
            "  %-{$wLine}s  %-{$wCol}s  %-{$wType}s  %s — %s\n",
            $r['line'],
            $r['column'],
            $r['type'],
            $r['code'],
            $message
        );
    }
}
echo "::endgroup::\n";

// --- Job summary: Markdown ---
$summaryFile = getenv('GITHUB_STEP_SUMMARY');
if ($summaryFile) {
    $md = "## WordPress Plugin Check\n\n";
    if (!$findings) {
        $md .= "✅ No issues found.\n";
    } else {
        $md .= sprintf("**%d error(s), %d warning(s)**\n\n", $errors, $warnings);
        $md .= "| File | Line | Col | Type | Code | Message |\n";
        $md .= "| --- | --- | --- | --- | --- | --- |\n";
        foreach ($findings as $f) {
            $message = preg_replace('/\s+/', ' ', (string) $f['message']);
            $message = str_replace('|', '\\|', $message);
            $md     .= sprintf(
                "| %s | %s | %s | %s | %s | %s |\n",
                $f['file'],
                $f['line'],
                $f['column'],
                $f['type'],
                $f['code'],
                $message
            );
        }
    }
    file_put_contents($summaryFile, $md . "\n", FILE_APPEND);
}

// --- Gate: errors block; with --ignore-warnings every reported finding is an error ---
$blocking = $ignoreWarnings ? count($findings) : $errors;
if ($blocking > 0) {
    echo "::error::Plugin Check reported {$blocking} blocking issue(s). See the job summary or the uploaded artifact.\n";
    exit(1);
}
exit(0);
