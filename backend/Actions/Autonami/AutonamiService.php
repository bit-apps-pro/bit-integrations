<?php

namespace BitApps\Integrations\Actions\Autonami;

use BitApps\Integrations\Log\LogHandler;
use BWF_Contacts;
use BWFCRM_Contact;

class AutonamiService
{
    private $_integrationID;

    public function __construct($integrationId)
    {
        $this->_integrationID = $integrationId;
    }

    public function insertRecord($data, $actions, $lists, $tags)
    {
        $contact_obj = BWF_Contacts::get_instance();
        $contact = $contact_obj->get_contact_by('email', $data['email']);
        $userExist = (absint($contact->get_id()) > 0);

        if ($userExist && isset($actions->skip_if_exists) && $actions->skip_if_exists) {
            $response = ['success' => false, 'messages' => __('Contact already exists!', 'bit-integrations')];
        } else {
            foreach ($data as $key => $item) {
                $obj = 'set_' . $key;
                $contact->{$obj}($item);
            }
            $contact->set_status(1);
            $contact->save();

            static::addTags($data['email'], $tags);
            static::addLists($data['email'], $lists);
            $customContact = new BWFCRM_Contact($data['email']);
            foreach ($data as $key => $item) {
                if ($key == 'address') {
                    $key = 'address-1';
                }
                $customContact->set_field_by_slug($key, $item);
            }
            $customContact->save_fields();

            if (absint($contact->get_id()) > 0) {
                $response = ['success' => true, 'messages' => __('Insert successfully!', 'bit-integrations')];
            } else {
                $response = ['success' => false, 'messages' => __('Something wrong!', 'bit-integrations')];
            }
        }

        return $response;
    }

    public function execute($fieldValues, $fieldMap, $actions, $lists, $tags)
    {
        $fieldData = [];
        foreach ($fieldMap as $fieldPair) {
            if (!empty($fieldPair->autonamiField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldData[$fieldPair->autonamiField] = $fieldPair->customValue;
                } else {
                    $fieldData[$fieldPair->autonamiField] = \is_array($fieldValues[$fieldPair->formField]) ? wp_json_encode($fieldValues[$fieldPair->formField]) : $fieldValues[$fieldPair->formField];
                }
            }
        }

        $recordApiResponse = $this->insertRecord($fieldData, $actions, $lists, $tags);

        if ($recordApiResponse['success']) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'insert'], 'success', $recordApiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'insert'], 'error', $recordApiResponse);
        }

        return $recordApiResponse;
    }

    private static function addTags($email, $tags)
    {
        $customContact = new BWFCRM_Contact($email);
        foreach ($tags as $tag_id) {
            $tags_to_add[] = ['id' => $tag_id];
        }

        $customContact->add_tags($tags_to_add);
    }

    private static function addLists($email, $lists)
    {
        $customContact = new BWFCRM_Contact($email);
        foreach ($lists as $list_id) {
            $lists_to_add[] = ['id' => $list_id];
        }

        $customContact->add_lists($lists_to_add);
    }
}
