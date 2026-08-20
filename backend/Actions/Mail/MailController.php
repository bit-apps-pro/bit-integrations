<?php

namespace BitApps\Integrations\Actions\Mail;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;

final class MailController
{
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
        $candidates = \is_array($emailAddresses) ? $emailAddresses : [$emailAddresses];
        $valid = [];

        foreach ($candidates as $email) {
            if (!\is_scalar($email)) {
                continue;
            }

            $email = (string) $email;

            if (!is_email($email)) {
                $email = Common::replaceFieldWithValue($email, $fieldValues);
            }

            foreach (explode(',', (string) $email) as $candidate) {
                $candidate = sanitize_email(trim($candidate));

                if ($candidate !== '' && is_email($candidate)) {
                    $valid[] = $candidate;
                }
            }
        }

        return array_values(array_unique($valid));
    }

    public function processHeader($type, $address, $fields)
    {
        $headers = [];

        foreach ($this->validateAddresses($address, $fields) as $validAddress) {
            $displayName = sanitize_text_field(explode('@', $validAddress)[0]);
            $headers[] = "{$type}: {$displayName}<{$validAddress}>";
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
