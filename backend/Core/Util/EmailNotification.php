<?php

namespace BitApps\Integrations\Core\Util;

use BitApps\Integrations\Config;

final class EmailNotification
{
    public static function sendFailureNotification($flowId, $actionName, $triggerName, $recordType, $errorMessage)
    {
        $adminEmail = get_option('admin_email');

        if (empty($adminEmail)) {
            return false;
        }

        $siteName = get_bloginfo('name');
        $subject = \sprintf(
            // translators: 1: Site name, 2: Flow ID
            __('[%1$s] Integration Failure Alert - Flow #%2$d', 'bit-integrations'),
            $siteName,
            $flowId
        );

        $message = self::buildEmailMessage($flowId, $actionName, $triggerName, $recordType, $errorMessage, $siteName);
        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $siteName . ' <' . $adminEmail . '>'
        ];

        return wp_mail($adminEmail, $subject, $message, $headers);
    }

    private static function buildEmailMessage($flowId, $actionName, $triggerName, $recordType, $errorMessage, $siteName)
    {
        $adminUrl = admin_url('admin.php?page=bit-integrations#/flow/action/edit/' . $flowId);
        $logUrl = admin_url('admin.php?page=bit-integrations#/flow/action/log/' . $flowId . '/' . $actionName);
        $timestamp = current_time('mysql');

        ob_start();

        include Config::get('BASEDIR') . '/views/emails/integration-failure-notification.php';

        return ob_get_clean();
    }
}
