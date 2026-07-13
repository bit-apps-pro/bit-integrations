<?php

namespace BitApps\Integrations\Actions\Mail;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;

final class MailController
{
    /**
     * Helps to execute integration flow for Mail action
     *
     * @param object $integrationData Details of flow
     * @param array  $fieldValues     Data to use in send mail
     *
     * @return null
     */
    public function execute($integrationData, $fieldValues)
    {
        $flow = $integrationData->flow_details;
        if (property_exists($flow, 'to')) {
            $mailTo = $this->validateAddresses($flow->to, $fieldValues);
            if (!empty($mailTo)) {
                $mailSubject = property_exists($flow, 'subject') ? Common::replaceFieldWithValue($flow->subject, $fieldValues) : '';
                $mailBody = property_exists($flow, 'body') ? Common::replaceFieldWithValue($flow->body, $fieldValues) : '';

                $mailHeaders = [];
                if (!empty($flow->replyto)) {
                    $mailHeaders = array_merge($mailHeaders, $this->processHeader('Reply-To', $flow->replyto, $fieldValues));
                }
                if (!empty($flow->bcc)) {
                    $mailHeaders = array_merge($mailHeaders, $this->processHeader('Bcc', $flow->bcc, $fieldValues));
                }
                if (!empty($flow->cc)) {
                    $mailHeaders = array_merge($mailHeaders, $this->processHeader('Cc', $flow->cc, $fieldValues));
                }
                if (!empty($flow->from)) {
                    $mailHeaders = array_merge($mailHeaders, $this->processHeader('FROM', $flow->from, $fieldValues));
                }
                $attachments = [];
                if (!empty($flow->attachment)) {
                    $files = $flow->attachment;
                    if (\is_array($files)) {
                        foreach ($files as $file) {
                            $attachments = array_merge($attachments, $this->processAttachment($file, $fieldValues));
                        }
                    } elseif (isset($fieldValues[$files])) {
                        $attachments = array_merge($attachments, $this->processAttachment($files, $fieldValues));
                    }
                }

                $mailBody = stripcslashes(wpautop($mailBody));
                $mailSubject = stripcslashes($mailSubject);
                add_filter('wp_mail_content_type', [self::class, 'filterMailContentType']);
                $status = wp_mail($mailTo, $mailSubject, $mailBody, $mailHeaders, $attachments);
                if (!$status) {
                    $status = wp_mail($mailTo, $mailSubject, $mailBody, $mailHeaders);
                }
                if (!$status) {
                    // translators: %s: Placeholder value
                    LogHandler::save($integrationData->id, 'Send Mail', 'failed', wp_sprintf(__('%1$s failed sends mail to %2$s', 'bit-integrations'), $flow->name, implode(', ', $mailTo)));
                } else {
                    // translators: %s: Placeholder value
                    LogHandler::save($integrationData->id, 'Send Mail', 'success', wp_sprintf(__('%1$s successfully sends mail to %2$s', 'bit-integrations'), $flow->name, implode(', ', $mailTo)));
                }

                remove_filter('wp_mail_content_type', [self::class, 'filterMailContentType']);
            }
        }
    }

    public static function filterMailContentType()
    {
        return 'text/html; charset=UTF-8';
    }

    public function validateAddresses($emailAddresses, $fieldValues)
    {
        if (!\is_array($emailAddresses)) {
            return [Common::replaceFieldWithValue($emailAddresses, $fieldValues)];
        }
        foreach ($emailAddresses as $key => $email) {
            if (!is_email($email)) {
                $email = Common::replaceFieldWithValue($email, $fieldValues);
            }
            if (is_email($email)) {
                $emailAddresses[$key] = $email;
            }
        }

        return $emailAddresses;
    }

    public function processHeader($type, $address, $fields)
    {
        $headers = [];
        $addresses = $this->validateAddresses($address, $fields);
        if (\is_array($addresses)) {
            foreach ($addresses as $address) {
                $headers[] = "{$type}: " . explode('@', $address)[0] . '<' . sanitize_email($address) . '>';
            }
        } else {
            $headers[] = "{$type}: " . explode('@', $addresses)[0] . '<' . sanitize_email($addresses) . '>';
        }

        return $headers;
    }

    public function processAttachment($file, $fields)
    {
        $attachments = [];
        if (isset($fields[$file])) {
            $files = \is_array($fields[$file]) ? $fields[$file] : [$fields[$file]];

            foreach ($files as $singleFile) {
                $safeFilePath = Common::safeUploadFilePath($singleFile);
                if ($safeFilePath !== '') {
                    $attachments[] = $safeFilePath;
                }
            }
        }

        return $attachments;
    }
}
