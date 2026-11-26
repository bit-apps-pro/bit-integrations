<?php

namespace BitApps\Integrations\Actions\Autonami;

use BWFCRM_Fields;
use BWFCRM_Lists;
use BWFCRM_Tag;

class AutonamiHelper
{
    public static function checkedExistsAutonami()
    {
        if (!class_exists('BWFCRM_Contact')) {
            wp_send_json_error(__('Autonami Pro Plugin is not active or installed', 'bit-integrations'), 400);
        } else {
            return true;
        }
    }

    public static function autonamiListsAndTags()
    {
        self::checkedExistsAutonami();

        $lists = BWFCRM_Lists::get_lists();
        $autonamiList = [];
        foreach ($lists as $list) {
            $autonamiList[$list['name']] = (object) [
                'id'    => $list['ID'],
                'title' => $list['name']
            ];
        }

        $tags = BWFCRM_Tag::get_tags();
        $autonamiTags = [];
        foreach ($tags as $tag) {
            $autonamiTags[$tag['name']] = (object) [
                'id'    => $tag['ID'],
                'title' => $tag['name']
            ];
        }

        $response['autonamiList'] = $autonamiList;
        $response['autonamiTags'] = $autonamiTags;
        wp_send_json_success($response, 200);
    }

    public static function autonamiFields()
    {
        self::checkedExistsAutonami();

        $fieldOptions = [];
        $fieldOptions['Email'] = (object) [
            'key'      => 'email',
            'label'    => 'Email',
            'type'     => 'primary',
            'required' => true
        ];
        foreach (BWFCRM_Fields::get_default_fields() as $key => $column) {
            $fieldOptions[$column] = (object) [
                'key'   => $key,
                'label' => $column,
                'type'  => 'primary'
            ];
        }
        foreach (BWFCRM_Fields::get_custom_fields(1, 1) as $field) {
            $fieldOptions[$field['slug']] = (object) [
                'key'   => $field['slug'],
                'label' => $field['name'],
                'type'  => 'custom',
            ];
        }
        $response['autonamiFields'] = $fieldOptions;
        wp_send_json_success($response, 200);
    }
}
