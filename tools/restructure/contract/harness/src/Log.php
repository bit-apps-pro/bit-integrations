<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

final class Log
{
    public function __construct(private bool $verbose = false)
    {
    }

    public function info(string $message): void
    {
        fwrite(STDERR, $message . "\n");
    }

    public function debug(string $message): void
    {
        if ($this->verbose) {
            fwrite(STDERR, '  . ' . $message . "\n");
        }
    }
}
