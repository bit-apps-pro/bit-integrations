<?php

/**
 * MailerPress Record Api
 */

namespace BitApps\Integrations\Actions\MailerPress;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    public function __construct($integId)
    {
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap, $lists, $tags, $mainAction)
    {
        if (!class_exists('\MailerPress\Core\Kernel')) {
            return [
                'success' => false,
                'message' => __('MailerPress is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::setFieldMap($fieldMap, $fieldValues);

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations')
        ];

        switch ($mainAction) {
            case 'create_or_update_contact':
                $response = $this->insertRecord($fieldData, $lists, $tags);
                $actionType = 'create';

                break;

            case 'delete_contact':
                $response = Hooks::apply(Config::withPrefix('mailerpress_delete_contact'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_mailerpress_delete_contact` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_mailerpress_delete_contact', $response, $fieldData);
                $actionType = 'delete';

                break;

            case 'add_tags':
                $response = Hooks::apply(Config::withPrefix('mailerpress_add_tags'), $defaultResponse, $fieldData, $tags);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_mailerpress_add_tags` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_mailerpress_add_tags', $response, $fieldData, $tags);
                $actionType = 'add_tags';

                break;

            case 'remove_tags':
                $response = Hooks::apply(Config::withPrefix('mailerpress_remove_tags'), $defaultResponse, $fieldData, $tags);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_mailerpress_remove_tags` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_mailerpress_remove_tags', $response, $fieldData, $tags);
                $actionType = 'remove_tags';

                break;

            case 'add_to_lists':
                $response = Hooks::apply(Config::withPrefix('mailerpress_add_to_lists'), $defaultResponse, $fieldData, $lists);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_mailerpress_add_to_lists` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_mailerpress_add_to_lists', $response, $fieldData, $lists);
                $actionType = 'add_to_lists';

                break;

            case 'remove_from_lists':
                $response = Hooks::apply(Config::withPrefix('mailerpress_remove_from_lists'), $defaultResponse, $fieldData, $lists);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_mailerpress_remove_from_lists` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_mailerpress_remove_from_lists', $response, $fieldData, $lists);
                $actionType = 'remove_from_lists';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $actionType = 'create';

                break;
        }

        if ($response['success']) {
            LogHandler::save($this->_integrationID, ['type' => 'Contact', 'type_name' => $actionType], 'success', $response);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'Contact', 'type_name' => $actionType], 'error', $response);
        }

        return $response;
    }

    private function insertRecord($contactData, $lists, $tags)
    {
        $email = key_exists('email', $contactData) ? sanitize_email($contactData['email']) : null;

        if (\is_null($email)) {
            return [
                'success' => false,
                'message' => __('Email is required', 'bit-integrations')
            ];
        }

        $tagIds = [];
        if (\is_array($tags)) {
            $tagIds = array_map(
                function ($id) {
                    return ['id' => $id];
                },
                $tags
            );
        }

        $listIds = [];
        if (\is_array($lists)) {
            $listIds = array_map(
                function ($id) {
                    return ['id' => $id];
                },
                $lists
            );
        }

        if (!\function_exists('add_mailerpress_contact')) {
            return [
                'success' => false,
                'message' => __('MailerPress is not installed or activated', 'bit-integrations')
            ];
        }

        $mailerPressContact = [
            'contactEmail'        => $email,
            'contactFirstName'    => isset($contactData['first_name']) ? sanitize_text_field($contactData['first_name']) : '',
            'contactLastName'     => isset($contactData['last_name']) ? sanitize_text_field($contactData['last_name']) : '',
            'contactStatus'       => isset($contactData['status']) ? sanitize_text_field($contactData['status']) : 'subscribed',
            'subscription_status' => isset($contactData['status']) ? sanitize_text_field($contactData['status']) : 'subscribed',
            'opt_in_source'       => 'bit-integrations',
            'tags'                => $tagIds,
            'lists'               => $listIds,
        ];

        $result = add_mailerpress_contact($mailerPressContact);

        if (isset($result['success']) && $result['success']) {
            $isUpdate = $result['update'] ?? false;

            return [
                'success' => true,
                'result'  => $result,
                'message' => $isUpdate ? __('Contact updated successfully', 'bit-integrations') : __('Contact created successfully', 'bit-integrations')
            ];
        }

        return [
            'success' => false,
            'message' => $result['message'] ?? __('Failed to create or update contact', 'bit-integrations')
        ];
    }

    /**
     * Map form fields to MailerPress fields
     *
     * @param array $fieldMap    Field mapping
     * @param array $fieldValues Field values
     *
     * @return array
     */
    private static function setFieldMap($fieldMap, $fieldValues)
    {
        $fieldData = [];

        foreach ($fieldMap as $fieldPair) {
            if (!isset($fieldPair->mailerPressField) || \is_null($fieldPair->mailerPressField) || $fieldPair->mailerPressField === '') {
                continue;
            }

            $fieldData[$fieldPair->mailerPressField] = ($fieldPair->formField == 'custom' && isset($fieldPair->customValue))
                ? Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues)
                : $fieldValues[$fieldPair->formField];
        }

        return $fieldData;
    }
}
