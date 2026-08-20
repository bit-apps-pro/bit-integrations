<?php

namespace BitApps\Integrations\Actions\MailMint;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;
use Mint\MRM\Admin\API\Controllers\MessageController;
use Mint\MRM\DataBase\Models\ContactGroupModel;
use Mint\MRM\DataBase\Models\ContactModel;
use Mint\MRM\DataStores\ContactData;

class RecordApiHelper
{
    private static $integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        self::$integrationID = $integId;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->mailMintFormField;
            $isDataTriggerValueSet = isset($data[$triggerValue]);
            // WP 5.1 compat: strpos() in place of str_contains() (WP 5.9)
            $containsCustomMetaField = strpos($actionValue, 'custom_meta_field_') !== false;

            if ($containsCustomMetaField) {
                $customFieldKey = str_replace('custom_meta_field_', '', $actionValue);
            }

            if ($triggerValue === 'custom') {
                if ($containsCustomMetaField) {
                    $dataFinal['meta_fields'][$customFieldKey] = Common::replaceFieldWithValue($value->customValue, $data);
                } else {
                    $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
                }
            } elseif ($isDataTriggerValueSet) {
                if ($containsCustomMetaField) {
                    $dataFinal['meta_fields'][$customFieldKey] = $data[$triggerValue];
                } else {
                    $dataFinal[$actionValue] = $data[$triggerValue];
                }
            }
        }

        return $dataFinal;
    }

    public function listFormat($selectedList)
    {
        $allLists = [];
        if (class_exists('Mint\MRM\DataBase\Models\ContactGroupModel')) {
            $listData = ContactGroupModel::get_all('lists');
            if (!empty($listData)) {
                foreach ($listData['data'] as $list) {
                    if (\in_array($list['id'], $selectedList)) {
                        $allLists[] = [
                            'id'   => $list['id'],
                            'name' => $list['title'],
                        ];
                    }
                }
            }
        }

        return $allLists;
    }

    public function tagFormat($selectedTags)
    {
        $allTags = [];
        if (class_exists('Mint\MRM\DataBase\Models\ContactGroupModel')) {
            $tagData = ContactGroupModel::get_all('tags');
            if (!empty($tagData)) {
                foreach ($tagData['data'] as $list) {
                    if (\in_array($list['id'], $selectedTags)) {
                        $allTags[] = [
                            'id'   => $list['id'],
                            'name' => $list['title'],
                        ];
                    }
                }
            }
        }

        return $allTags;
    }

    public function createContact($selectedList, $selectedTags, $selectedSubStatus, $finalData)
    {
        $selectedList = explode(',', $selectedList);
        $selectedTags = explode(',', $selectedTags);
        $listFormat = $this->listFormat($selectedList);
        $tagFormat = $this->tagFormat($selectedTags);

        $finalData['status'] = $selectedSubStatus;
        $finalData['_locale'] = 'user';
        $finalData['created_by'] = get_current_user_id();

        $contact_id = null;
        if (class_exists('Mint\MRM\DataStores\ContactData') && class_exists('Mint\MRM\DataBase\Models\ContactModel')) {
            $contact = new ContactData($finalData['email'], $finalData);
            $contact_id = ContactModel::insert($contact);

            if ('pending' === $selectedSubStatus) {
                MessageController::get_instance()->send_double_opt_in($contact_id);
            }

            if (isset($tagFormat)) {
                ContactGroupModel::set_tags_to_contact($tagFormat, $contact_id);
            }

            if (isset($listFormat)) {
                ContactGroupModel::set_lists_to_contact($listFormat, $contact_id);
            }
        }

        return $contact_id;
    }

    public function updateContact($selectedList, $selectedTags, $selectedSubStatus, $finalData, $contact_id)
    {
        $selectedList = explode(',', $selectedList);
        $selectedTags = explode(',', $selectedTags);

        $listFormat = $this->listFormat($selectedList);
        $tagFormat = $this->tagFormat($selectedTags);

        $finalData['_locale'] = 'user';
        $finalData['status'] = $selectedSubStatus;
        $finalData['created_by'] = get_current_user_id();

        if (class_exists('Mint\MRM\DataStores\ContactData') && class_exists('Mint\MRM\DataBase\Models\ContactModel')) {
            ContactModel::update($finalData, $contact_id);

            if ('pending' === $selectedSubStatus) {
                MessageController::get_instance()->send_double_opt_in($contact_id);
            }

            if (isset($tagFormat)) {
                ContactGroupModel::set_tags_to_contact($tagFormat, $contact_id);
            }

            if (isset($listFormat)) {
                ContactGroupModel::set_lists_to_contact($listFormat, $contact_id);
            }
        }

        return $contact_id;
    }

    public function execute(
        $mainAction,
        $fieldValues,
        $fieldMap,
        $integrationDetails
    ) {
        $fieldData = [];
        $apiResponse = null;
        $update = $integrationDetails->update;
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $contactExist = ContactModel::is_contact_exist($finalData['email']);
        if ($mainAction === '1' && !$contactExist) {
            $selectedList = $integrationDetails->selectedList;
            $selectedTags = $integrationDetails->selectedTags;
            $selectedSubStatus = $integrationDetails->selectedSubStatus;
            $apiResponse = $this->createContact($selectedList, $selectedTags, $selectedSubStatus, $finalData);

            if ($apiResponse && \gettype($apiResponse) === 'integer') {
                // translators: %s: Placeholder value
                LogHandler::save(self::$integrationID, ['type' => 'create', 'type_name' => 'create contact'], 'success', wp_json_encode(wp_sprintf(__('Contact created successfully and id is %s', 'bit-integrations'), $apiResponse)));
            } else {
                LogHandler::save(self::$integrationID, ['type' => 'create', 'type_name' => 'create contact'], 'error', __('Failed to create contact', 'bit-integrations'));
            }

            return $apiResponse;
        } elseif ($mainAction === '1' && $contactExist && $update) {
            $selectedList = $integrationDetails->selectedList;
            $selectedTags = $integrationDetails->selectedTags;
            $selectedSubStatus = $integrationDetails->selectedSubStatus;
            $apiResponse = $this->updateContact($selectedList, $selectedTags, $selectedSubStatus, $finalData, $contactExist);

            if ($apiResponse && (is_numeric($apiResponse) || (\is_bool($apiResponse) && $apiResponse))) {
                LogHandler::save(self::$integrationID, ['type' => 'update', 'type_name' => 'update contact'], 'success', __('Contact updated successfully', 'bit-integrations'));
            } else {
                LogHandler::save(self::$integrationID, ['type' => 'update', 'type_name' => 'update contact'], 'error', __('Failed to create contact', 'bit-integrations'));
            }

            return $apiResponse;
        }
        LogHandler::save(self::$integrationID, ['type' => 'create', 'type_name' => 'create contact'], 'error', __('Email already exist', 'bit-integrations'));

        return $apiResponse;
    }
}
