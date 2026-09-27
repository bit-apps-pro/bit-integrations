<?php

declare(strict_types=1);

$pluginRoot = dirname(__DIR__, 3);

if (!defined('ABSPATH')) {
    define('ABSPATH', $pluginRoot . '/');
}

if (!is_file($pluginRoot . '/vendor/autoload.php')) {
    fwrite(STDERR, "vendor/autoload.php is missing; run composer install in the plugin root\n");

    exit(2);
}

require_once $pluginRoot . '/vendor/autoload.php';

$salesforce = 'BitApps\\Integrations\\Actions\\Salesforce\\SalesforceController';
$moosend = 'BitApps\\Integrations\\Actions\\Moosend\\MoosendHelper';

$failures = [];
$check = static function (bool $ok, string $label, string $detail = '') use (&$failures): void {
    echo ($ok ? 'ok    ' : 'FAIL  ') . $label . ($ok || $detail === '' ? '' : " ({$detail})") . "\n";

    if (!$ok) {
        $failures[] = $label;
    }
};

$classLoads = static function (string $class) use ($check): bool {
    try {
        $loaded = class_exists($class);
        $error = 'not found';
    } catch (Throwable $e) {
        $loaded = false;
        $error = get_class($e) . ': ' . $e->getMessage();
    }

    $check($loaded, "{$class} exists", $error);

    return $loaded;
};

$staticMethod = static function (string $class, string $method, int $arguments) use ($check): void {
    $label = "{$class}::{$method}() is public static, requires <= {$arguments} and accepts {$arguments} argument(s)";

    if (!method_exists($class, $method)) {
        $check(false, $label, 'method missing');

        return;
    }

    $reflection = new ReflectionMethod($class, $method);
    $problems = [];

    if (!$reflection->isPublic()) {
        $problems[] = 'not public';
    }

    if (!$reflection->isStatic()) {
        $problems[] = 'not static';
    }

    if ($reflection->getNumberOfRequiredParameters() > $arguments) {
        $problems[] = $reflection->getNumberOfRequiredParameters() . ' required';
    }

    if (!$reflection->isVariadic() && $reflection->getNumberOfParameters() < $arguments) {
        $problems[] = 'only ' . $reflection->getNumberOfParameters() . ' declared';
    }

    $check($problems === [], $label, implode(', ', $problems));
};

if ($classLoads($salesforce)) {
    $label = "{$salesforce}::\$actions is a public static array";

    if (!property_exists($salesforce, 'actions')) {
        $check(false, $label, 'missing, or private to a parent class');
    } else {
        $property = new ReflectionProperty($salesforce, 'actions');
        $value = $property->isStatic() ? $property->getValue() : null;
        $check(
            $property->isPublic() && $property->isStatic() && is_array($value) && $value !== [],
            $label,
            ($property->isPublic() ? '' : 'not public ') . ($property->isStatic() ? '' : 'not static ') . get_debug_type($value)
        );
    }

    $staticMethod($salesforce, 'refreshTokenDetails', 1);
    $staticMethod($salesforce, 'setHeaders', 1);
    $staticMethod($salesforce, 'saveRefreshedToken', 2);
}

if ($classLoads($moosend)) {
    $staticMethod($moosend, 'formatPhoneNumber', 1);
}

if ($failures !== []) {
    echo count($failures) . " public contract check(s) failed\n";

    exit(1);
}

echo "public contract holds\n";
