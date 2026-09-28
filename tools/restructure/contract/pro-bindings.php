<?php

$proBindingsRun = static function (array $arguments): int {
    $freeRoot = dirname(__DIR__, 3);
    $options = ['pro' => (string) getenv('BI_PRO_ROOT'), 'free' => $freeRoot, 'verbose' => false];

    foreach ($arguments as $argument) {
        $argument = (string) $argument;
        if ($argument === '--verbose' || $argument === 'verbose') {
            $options['verbose'] = true;
        } elseif (preg_match('/^(?:--)?(pro|free)=(.+)$/', $argument, $match)) {
            $options[$match[1]] = $match[2];
        } else {
            fwrite(STDERR, "usage: php pro-bindings.php [--pro=<proRoot>] [--free=<freeRoot>] [--verbose]\n"
                . "   or: wp --path=<site> eval-file pro-bindings.php [pro=<proRoot>] [free=<freeRoot>] [verbose]\n");

            return 2;
        }
    }

    if ($options['pro'] === '') {
        $options['pro'] = defined('WP_PLUGIN_DIR') ? WP_PLUGIN_DIR . '/bit-integrations-pro' : dirname($freeRoot) . '/bit-integrations-pro';
    }

    $script = $options['pro'] . '/tools/ci/bindings.php';
    if (!is_file($script)) {
        fwrite(STDERR, "Pro bindings check not found: {$script}\n");

        return 2;
    }

    $autoload = $options['pro'] . '/tools/ci/vendor/autoload.php';
    if (!is_file($autoload)) {
        $autoload = $freeRoot . '/tools/restructure/vendor/autoload.php';
    }

    $command = [PHP_BINARY !== '' ? PHP_BINARY : 'php', $script, '--free', $options['free'], '--pro', $options['pro'], '--autoload', $autoload, '--no-fail'];
    if ($options['verbose']) {
        $command[] = '--verbose';
    }

    $process = proc_open($command, [0 => ['pipe', 'r'], 1 => STDOUT, 2 => STDERR], $pipes);
    if (!is_resource($process)) {
        fwrite(STDERR, "could not start the Pro bindings check\n");

        return 2;
    }
    fclose($pipes[0]);

    return proc_close($process);
};

if (function_exists('add_filter')) {
    add_filter(
        'pre_http_request',
        static function () {
            return new WP_Error('pro_bindings_offline', 'Outgoing HTTP is blocked while the Pro bindings check runs');
        },
        PHP_INT_MAX
    );
    add_filter('pre_wp_mail', '__return_false', PHP_INT_MAX);
}

$proBindingsExit = $proBindingsRun(isset($args) && is_array($args) ? $args : array_slice($argv ?? [], 1));

if ($proBindingsExit !== 0) {
    exit($proBindingsExit);
}
