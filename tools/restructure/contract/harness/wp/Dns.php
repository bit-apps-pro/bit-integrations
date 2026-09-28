<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke\Wp;

/**
 * Common::isSafeRemoteUrl() resolves hosts before any pre_http_request filter runs, so without this
 * an NXDOMAIN API host ends a route before its request is even logged, and results depend on DNS.
 */
final class Dns
{
    public const PUBLIC_ADDRESS = '93.184.216.34';

    private const LOOPBACK = '127.0.0.1';

    /**
     * @var array<string, string>
     */
    private static array $lookups = [];

    public static function address(string $hostname): string
    {
        $host = strtolower(rtrim($hostname, '.'));

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return $host;
        }

        $address = self::isLocal($host) ? self::LOOPBACK : self::PUBLIC_ADDRESS;
        self::$lookups[$host] = $address;

        return $address;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function records(string $hostname): array
    {
        $address = self::address($hostname);

        return [['host' => $hostname, 'class' => 'IN', 'ttl' => 300, 'type' => 'A', 'ip' => $address]];
    }

    /**
     * @return array<string, string>
     */
    public static function lookups(): array
    {
        $lookups = self::$lookups;
        ksort($lookups, SORT_STRING);

        return $lookups;
    }

    private static function isLocal(string $host): bool
    {
        if ($host === 'localhost' || str_ends_with($host, '.localhost')) {
            return true;
        }

        foreach (['home_url', 'site_url'] as $function) {
            if (\function_exists($function)) {
                $own = parse_url((string) $function(), PHP_URL_HOST);

                if (\is_string($own) && strtolower($own) === $host) {
                    return true;
                }
            }
        }

        return false;
    }
}
