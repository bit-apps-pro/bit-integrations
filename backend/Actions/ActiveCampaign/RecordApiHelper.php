<?php

/**
 * Active Campaign Record Api
 */

namespace BitApps\Integrations\Actions\ActiveCampaign;

use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_defaultHeader;

    private $_integrationID;

    private $_apiEndpoint;

    public function __construct($api_key, $api_url, $integId)
    {
        $this->_defaultHeader['Api-Token'] = $api_key;
        $this->_apiEndpoint = $api_url . '/api/3';
        $this->_integrationID = $integId;
    }

    public function storeOrModifyRecord($method, $data)
    {
        $insertRecordEndpoint = "{$this->_apiEndpoint}/{$method}";

        return HttpHelper::post($insertRecordEndpoint, $data, $this->_defaultHeader);
    }

    public function updateRecord($id, $data, $existContact)
    {
        $contactData = $data['contact'];
        foreach ($contactData as $key => $value) {
            if ($value === '') {
                $contactData->{$key} = $existContact->contacts[0]->{$key};
            }
        }

        $updateRecordEndpoint = "{$this->_apiEndpoint}/contacts/{$id}";

        return HttpHelper::request($updateRecordEndpoint, 'PUT', wp_json_encode($data), $this->_defaultHeader);
    }

    public function execute($integrationDetails, $fieldValues, $fieldMap, $actions, $listId, $tags)
    {
        $fieldData = [];
        $customFields = [];

        foreach ($fieldMap as $fieldPair) {
            if (empty($fieldPair->activeCampaignField)) {
                continue;
            }
            $acField = $fieldPair->activeCampaignField;
            $formField = $fieldPair->formField;
            $customValue = $fieldPair->customValue ?? null;

            if ($formField === 'custom' && isset($customValue)) {
                if (is_numeric($acField)) {
                    $customFields[] = ['field' => (int) $acField, 'value' => $customValue];
                } else {
                    $fieldData[$acField] = $customValue;
                }
            } elseif (is_numeric($acField)) {
                $customFields[] = ['field' => (int) $acField, 'value' => $fieldValues[$formField] ?? ''];
            } else {
                $fieldData[$acField] = $fieldValues[$formField] ?? '';
            }
        }

        if ($customFields) {
            $fieldData['fieldValues'] = $customFields;
        }
        $activeCampaign = ['contact' => (object) $fieldData];
        $email = $fieldData['email'] ?? null;
        $existContact = $email ? $this->existContact($email) : null;

        $updateContact = !empty($actions->update);
        $hasContact = !empty($existContact->contacts);
        $type = 'notSet';
        $recordApiResponse = null;

        if (!$updateContact && !$hasContact) {
            $recordApiResponse = $this->storeOrModifyRecord('contacts', wp_json_encode($activeCampaign));
            $type = 'insert';
        } elseif ($updateContact && $hasContact) {
            $contactId = $existContact->contacts[0]->id;
            $recordApiResponse = $this->updateRecord($contactId, $activeCampaign, $existContact);
            $type = 'update';
        } elseif ($updateContact && !$hasContact) {
            $recordApiResponse = $this->storeOrModifyRecord('contacts', wp_json_encode($activeCampaign));
            $type = 'insert';
        }

        if (!empty($recordApiResponse->contact)) {
            $related = $this->handleRelatedActions($recordApiResponse->contact->id, $listId, $tags, $integrationDetails);
            $recordApiResponse = (object) array_merge((array) $recordApiResponse, $related);
        }

        if ($type === 'notSet') {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'insert'], 'error', __('Email already exist', 'bit-integrations'));

            return false;
        }
        if ($recordApiResponse && !empty($recordApiResponse->errors)) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'error', $recordApiResponse->errors);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'success', $recordApiResponse);
        }

        return $recordApiResponse;
    }

    private function handleRelatedActions($contactId, $listId, $tags, $integrationDetails)
    {
        $data = [];
        $result = [];
        if (!empty($listId)) {
            $data['contactList'] = (object) [
                'list'    => $listId,
                'contact' => $contactId,
                'status'  => 1
            ];
            $result['lists'] = $this->storeOrModifyRecord('contactLists', wp_json_encode($data));
        }

        if (!empty($tags)) {
            if ($integrationDetails->actions->tagUpdate) {
                $contactTagsResponse = HttpHelper::get("{$this->_apiEndpoint}/contacts/{$contactId}/contactTags", null, $this->_defaultHeader);
                $contactTags = $contactTagsResponse->contactTags ?? [];

                if (!empty($contactTags)) {
                    foreach ($contactTags as $contactTag) {
                        HttpHelper::delete("{$this->_apiEndpoint}/contactTags/{$contactTag->id}", null, $this->_defaultHeader);
                        $result['tags_removed'][] = HttpHelper::$responseCode === 200
                            ? __('Tag removed successfully', 'bit-integrations')
                            : __('Failed to remove tag', 'bit-integrations');
                    }
                } else {
                    $result['tags_removed'] = __('No tags to remove', 'bit-integrations');
                }
            }

            $result['tags_added'] = array_map(
                function ($tag) use ($contactId) {
                    $data = [
                        'contactTag' => (object) [
                            'contact' => $contactId,
                            'tag'     => $tag
                        ]
                    ];

                    return $this->storeOrModifyRecord('contactTags', wp_json_encode($data));
                },
                $tags
            );
        }

        if (!empty($integrationDetails->selectedAccount)) {
            $data['accountContact'] = [
                'account' => $integrationDetails->selectedAccount,
                'contact' => $contactId,
            ];
            if (!empty($integrationDetails->job_title)) {
                $data['accountContact']['jobTitle'] = $integrationDetails->job_title;
            }
            $result['account'] = $this->storeOrModifyRecord('accountContacts', wp_json_encode((object) $data));
        }

        return $result;
    }

    private function existContact($email)
    {
        $searchEndPoint = "{$this->_apiEndpoint}/contacts?email={$email}";

        return HttpHelper::get($searchEndPoint, null, $this->_defaultHeader);
    }
}
