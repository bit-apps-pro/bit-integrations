<?php

namespace BitApps\Integrations\Actions\DoubleScaleCrm;

use DoubleScale\Core\UserRoles\UserRoles;
use DoubleScale\Modules\Contacts\Models\ContactModel;
use DoubleScale\Modules\Contacts\Models\ListModel;
use DoubleScale\Modules\Contacts\Models\TagModel;
use DoubleScale\Modules\Support\Models\MailboxModel;
use WP_Error;

class DoubleScaleCrmController
{
    public static function isExists()
    {
        if (!static::isPluginActive()) {
            wp_send_json_error(
                __(
                    'DoubleScale CRM is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshTags()
    {
        self::isExists();

        wp_send_json_success(['tags' => static::termOptions(TagModel::query()->orderBy('name')->get())], 200);
    }

    public function refreshLists()
    {
        self::isExists();

        wp_send_json_success(['lists' => static::termOptions(ListModel::query()->orderBy('name')->get())], 200);
    }

    public function refreshUsers()
    {
        self::isExists();

        $users = array_map(
            function ($user) {
                return (object) [
                    'value' => (int) $user->ID,
                    'label' => $user->user_email === '' ? $user->display_name : $user->display_name . ' (' . $user->user_email . ')',
                ];
            },
            get_users(
                [
                    'role__in' => array_merge(['administrator'], UserRoles::get_known_role_slugs()),
                    'orderby'  => 'display_name',
                    'fields'   => ['ID', 'display_name', 'user_email'],
                ]
            )
        );

        wp_send_json_success(['users' => $users], 200);
    }

    public function refreshMailboxes()
    {
        self::isExists();

        if (!\function_exists('doublescale_is_module_active') || !doublescale_is_module_active('support')) {
            wp_send_json_error(__('The DoubleScale Support module is off. Turn on Support in DoubleScale CRM.', 'bit-integrations'), 400);
        }

        $mailboxes = [];

        foreach (MailboxModel::query()->orderBy('id')->get() as $mailbox) {
            $mailboxes[] = (object) ['value' => (int) $mailbox->id, 'label' => (string) $mailbox->name];
        }

        wp_send_json_success(['mailboxes' => $mailboxes], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }

    public static function isPluginActive()
    {
        return class_exists(ContactModel::class);
    }

    private static function termOptions($terms)
    {
        $options = [];

        foreach ($terms as $term) {
            $options[] = (object) ['value' => (int) $term->id, 'label' => (string) $term->name];
        }

        return $options;
    }
}
