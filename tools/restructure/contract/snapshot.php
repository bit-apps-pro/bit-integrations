<?php

if (!defined('ABSPATH') || !function_exists('add_filter')) {
    fwrite(STDERR, "Run through WP-CLI: wp --path=<site> eval-file tools/restructure/contract/snapshot.php\n");

    exit(2);
}

require_once __DIR__ . '/lib/autoload.php';

$contractBlockedRequests = [];

add_filter(
    'pre_http_request',
    static function ($preempt, $args, $url) use (&$contractBlockedRequests) {
        $contractBlockedRequests[] = (string) $url;

        return new WP_Error('contract_snapshot_offline', 'Outgoing HTTP is blocked while the contract snapshot runs');
    },
    PHP_INT_MAX,
    3
);
add_filter('pre_wp_mail', '__return_false', PHP_INT_MAX);

global $wpdb;

$wpdb->query('START TRANSACTION');
ob_start();

try {
    BitApps\Restructure\Contract\Lib\ParserKit::assertBundledParser();
    $contractSnapshot = (new BitApps\Restructure\Contract\Lib\Snapshot())->build();
    $contractFailure = null;
} catch (Throwable $e) {
    $contractSnapshot = null;
    $contractFailure = $e;
} finally {
    $contractStrayOutput = (string) ob_get_clean();
    $wpdb->query('ROLLBACK');
}

if ($contractStrayOutput !== '') {
    fwrite(STDERR, "output printed while building the snapshot (not part of it):\n{$contractStrayOutput}\n");
}

if ($contractBlockedRequests !== []) {
    fwrite(STDERR, 'blocked outgoing HTTP: ' . implode(', ', $contractBlockedRequests) . "\n");
}

if ($contractFailure !== null) {
    fwrite(STDERR, 'snapshot failed: ' . get_class($contractFailure) . ': ' . $contractFailure->getMessage() . "\n");

    exit(1);
}

echo BitApps\Restructure\Contract\Lib\Json::encode($contractSnapshot);
