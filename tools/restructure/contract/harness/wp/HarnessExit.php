<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke\Wp;

use RuntimeException;

final class HarnessExit extends RuntimeException
{
    public function __construct(public readonly mixed $dieMessage, public readonly mixed $dieArgs)
    {
        parent::__construct('wp_die');
    }
}
