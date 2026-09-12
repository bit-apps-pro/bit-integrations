<?php

namespace BitApps\Integrations\Core\Util;

use WP_Error;

final class ActionUser
{
    /**
     * Flows saved before the email mapping existed carry no `userSource`, so they
     * keep resolving to the logged-in user.
     *
     * @param object $flowDetails
     * @param array  $fieldValues
     *
     * @return int|WP_Error
     */
    public static function resolve($flowDetails, $fieldValues)
    {
        if (empty($flowDetails->userSource) || $flowDetails->userSource !== 'email') {
            return get_current_user_id();
        }

        $email = self::mappedEmail($flowDetails, $fieldValues);

        if (empty($email) || !is_email($email)) {
            // translators: %s: Mapped email value
            return new WP_Error('BI_USER_INVALID_EMAIL', wp_sprintf(__('A valid user email is required, got: %s', 'bit-integrations'), $email === '' ? __('empty value', 'bit-integrations') : $email));
        }

        $user = get_user_by('email', $email);

        if (!$user) {
            // translators: %s: Mapped email value
            return new WP_Error('BI_USER_NOT_FOUND', wp_sprintf(__('No user found with the email: %s', 'bit-integrations'), $email));
        }

        return $user->ID;
    }

    private static function mappedEmail($flowDetails, $fieldValues)
    {
        $map = $flowDetails->userEmailField ?? null;

        if (empty($map)) {
            return '';
        }

        $formField = $map->formField ?? '';

        $value = $formField === 'custom'
            ? Common::replaceFieldWithValue($map->customValue ?? '', $fieldValues)
            : ($fieldValues[$formField] ?? '');

        if (\is_array($value)) {
            $value = reset($value);
        }

        return trim((string) $value);
    }
}
