<?php

namespace BitApps\Integrations\Actions\FluentSupport;

use FluentSupport\App\Models\Agent;
use FluentSupport\App\Models\MailBox;

class FluentSupportHelper
{
    public function getCustomFields()
    {
        if (!class_exists(\FluentSupportPro\App\Services\CustomFieldsService::class)) {
            // translators: %s: Plugin name
            wp_send_json_error(wp_sprintf(__('%s is not active or not installed', 'bit-integrations'), 'Fluent Support'), 400);
        }

        $customFields = [];
        $response = \FluentSupportPro\App\Services\CustomFieldsService::getCustomFields();

        foreach ($response as $field) {
            $customFields[] = (object) ['key' => $field['slug'], 'label' => $field['label'], 'required' => $field['required'] == 'yes' ? true : false];
        }

        wp_send_json_success($customFields, 200);
    }

    public function getAllSupportStaff($tokenRequestParams)
    {
        $supportStaff = Agent::get();

        if (is_wp_error($supportStaff)) {
            wp_send_json_error(
                empty($supportStaff->error) ? 'Unknown' : $supportStaff->error,
                400
            );
        }
        wp_send_json_success(\is_string($supportStaff) ? json_decode($supportStaff) : $supportStaff, 200);
    }

    public function getAllBusinessInboxes()
    {
        $businessInboxes = MailBox::all();

        if (is_wp_error($businessInboxes)) {
            wp_send_json_error(
                empty($businessInboxes->error) ? 'Unknown' : $businessInboxes->error,
                400
            );
        }
        wp_send_json_success(\is_string($businessInboxes) ? json_decode($businessInboxes) : $businessInboxes, 200);
    }
}
