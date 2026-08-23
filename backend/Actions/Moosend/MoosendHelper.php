<?php

/**
 * Moosend Record Api
 */

namespace BitApps\Integrations\Actions\Moosend;

class MoosendHelper
{
    public static function formatPhoneNumber($field)
    {
        if (!preg_match('/^\+?[0-9\s\-\(\)]+$/', $field)) {
            return $field;
        }

        $leadingPlus = $field[0] === '+' ? '+' : '';
        $cleanedNumber = preg_replace('/[^\d]/', '', $field);
        $formattedDigits = trim(chunk_split($cleanedNumber, 3, ' '));

        return $leadingPlus . $formattedDigits;
    }
}
