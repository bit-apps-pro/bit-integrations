<?php

declare(strict_types=1);

use BitApps\Restructure\Contract\Smoke\Wp\Dns;

if (!function_exists('dns_get_record')) {
    function dns_get_record(string $hostname, int $type = DNS_ANY, &$authoritative_name_servers = null, &$additional_records = null, bool $raw = false): array|false
    {
        return Dns::records($hostname);
    }
}

if (!function_exists('gethostbyname')) {
    function gethostbyname(string $hostname): string
    {
        return Dns::address($hostname);
    }
}

if (!function_exists('gethostbynamel')) {
    function gethostbynamel(string $hostname): array|false
    {
        return [Dns::address($hostname)];
    }
}

if (!function_exists('checkdnsrr')) {
    function checkdnsrr(string $hostname, string $type = 'MX'): bool
    {
        return true;
    }
}

if (!function_exists('dns_check_record')) {
    function dns_check_record(string $hostname, string $type = 'MX'): bool
    {
        return true;
    }
}

if (!function_exists('getmxrr')) {
    function getmxrr(string $hostname, &$hosts, &$weights = null): bool
    {
        $hosts = ['mx.' . $hostname];
        $weights = [10];

        return true;
    }
}

if (!function_exists('dns_get_mx')) {
    function dns_get_mx(string $hostname, &$hosts, &$weights = null): bool
    {
        return getmxrr($hostname, $hosts, $weights);
    }
}
