<?php

/**
 * EmailOctopus Record Api
 */

namespace BitApps\Integrations\Actions\EmailOctopus;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_requestStoringType;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->_authToken = $this->_integrationDetails->auth_token;
    }

    public function addContact($selectedTags, $finalData, $selectedList)
    {
        $apiEndpoint = 'https://emailoctopus.com/api/1.6/lists/' . $selectedList . '/contacts';

        if (empty($finalData['EmailAddress'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }

        $data = [
            'api_key' => $this->_authToken
        ];

        foreach ($finalData as $key => $value) {
            if ($key == 'EmailAddress') {
                $data['email_address'] = $value;
            } else {
                $fields[$key] = $value;
            }
        }

        if (!empty($fields)) {
            $data['fields'] = (object) $fields;
        }

        if (!empty($selectedTags)) {
            $selectedTagsArray = explode(',', $selectedTags);
            foreach ($selectedTagsArray as $tag) {
                $tags[] = $tag;
            }
            $data['tags'] = $tags;
        }

        if (!empty($this->_integrationDetails->actions->status)) {
            $data['status'] = 'UNSUBSCRIBED';
        } elseif (!empty($this->_integrationDetails->actions->pending)) {
            $data['status'] = 'PENDING';
        } else {
            $data['status'] = 'SUBSCRIBED';
        }

        $isContactExist = $this->isExist($selectedList, $finalData['EmailAddress']);

        if ($isContactExist && !empty($this->_integrationDetails->actions->update)) {
            $tagsUpdate = [];
            if (!empty($selectedTags)) {
                $selectedTagsUpdate = explode(',', $selectedTags);
                foreach ($selectedTagsUpdate as $tag) {
                    $tagsUpdate[$tag] = true;
                }
            }
            if (!empty($isContactExist->tags)) {
                $tagsUpdateRemove = [];
                foreach ($isContactExist->tags as $existingTag) {
                    if (empty($selectedTags)) {
                        $tagsUpdateRemove[$existingTag] = false;
                    } else {
                        if (!\array_key_exists($existingTag, $tagsUpdate)) {
                            $tagsUpdateRemove[$existingTag] = false;
                        }
                    }
                }
                $tagsUpdate = array_merge($tagsUpdate, $tagsUpdateRemove);
            }
            if (!empty($tagsUpdate)) {
                $data['tags'] = (object) $tagsUpdate;
            }

            $apiEndpoint = 'https://emailoctopus.com/api/1.6/lists/' . $selectedList . '/contacts/' . $isContactExist->id;
            $this->_requestStoringType = 'updated';

            return HttpHelper::request($apiEndpoint, 'PUT', $data, null);
        }

        $this->_requestStoringType = 'created';

        return HttpHelper::post($apiEndpoint, $data, null);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->emailOctopusFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($selectedTags, $fieldValues, $fieldMap, $selectedList)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $apiResponse = $this->addContact($selectedTags, $finalData, $selectedList);

        if ($apiResponse->id) {
            $successMessage = ['message' => 'Contact ' . $this->_requestStoringType . ' successfully'];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'Contact ' . $this->_requestStoringType]), 'success', wp_json_encode($successMessage));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'Adding Contact']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    public function isExist($listId, $EmailAddress)
    {
        $md5encodedEmail = md5($EmailAddress);
        $apiEndpoint = 'https://emailoctopus.com/api/1.6/lists/' . $listId . '/contacts/' . $md5encodedEmail . '?api_key=' . $this->_authToken;
        $response = HttpHelper::get($apiEndpoint, null, null);

        if (isset($response->id)) {
            return $response;
        }

        return false;
    }
}
