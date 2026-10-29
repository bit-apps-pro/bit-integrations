<?php

namespace BitApps\Integrations\Actions\SystemeIO;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class SystemeIOService
{
    private $integrationDetails;

    private $integrationId;

    private $apiUrl;

    private $defaultHeader;

    private $type;

    private $typeName;

    public function __construct($integrationDetails, $integId, $apiKey)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = 'https://api.systeme.io/api';
        $this->defaultHeader = [
            'x-api-key'    => $apiKey,
            'Content-Type' => 'application/json'
        ];
    }

    public function addContact($finalData)
    {
        $this->type = 'Add People to Contacts';
        $this->typeName = 'Add People to Contacts';

        if (empty($finalData['email'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }

        $apiEndpoint = $this->apiUrl . '/contacts';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function findContactByEmail($email)
    {
        $apiEndpoint = add_query_arg(['email' => rawurlencode($email)], $this->apiUrl . '/contacts');
        $response = HttpHelper::get($apiEndpoint, null, $this->defaultHeader);

        if (!static::isSuccessResponse() || empty($response->items[0]->id)) {
            return;
        }

        return $response->items[0];
    }

    public function addTag($contactId, $tag)
    {
        if (empty($contactId)) {
            return ['success' => false, 'message' => __('Contact is not created', 'bit-integrations'), 'code' => 400];
        }
        if (empty($tag)) {
            return ['success' => false, 'message' => __('Required field tag is empty', 'bit-integrations'), 'code' => 400];
        }

        $apiEndpoint = $this->apiUrl . '/contacts/' . $contactId . '/tags';

        $data['tagId'] = (int) $tag;

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode($data), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField ?? null;
            $actionValue = $value->systemeIOFormField ?? null;

            if (empty($actionValue)) {
                continue;
            }

            $fieldValue = ($triggerValue === 'custom')
                ? ($value->customValue ?? null)
                : ($data[$triggerValue] ?? null);

            if (\is_null($fieldValue)) {
                continue;
            }

            if ($actionValue === 'email') {
                $dataFinal[$actionValue] = $fieldValue;

                continue;
            }

            $dataFinal['fields'][] = (object) [
                'slug'  => $actionValue,
                'value' => $fieldValue
            ];
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $updateContact = !empty($this->integrationDetails->actions->update);
        $updateTags = !empty($this->integrationDetails->actions->updateTags);

        if (($updateContact || $updateTags) && !empty($finalData['email'])) {
            $existingContact = $this->findContactByEmail($finalData['email']);

            if (!empty($existingContact)) {
                return $this->handleExistingContact($existingContact, $finalData, $updateContact, $updateTags);
            }
        }

        $apiResponse = $this->addContact($finalData);

        if (\is_array($apiResponse) && isset($apiResponse['success']) && false === $apiResponse['success']) {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));

            return $apiResponse;
        }

        if (!static::isSuccessResponse()) {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));

            return $apiResponse;
        }

        $res = [$this->typeName . '  successfully'];
        LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));

        if (!empty($this->integrationDetails->selectedTag) && !empty($apiResponse->id)) {
            $this->addTagWithLog($apiResponse->id, $this->integrationDetails->selectedTag);
        }

        return $apiResponse;
    }

    private function handleExistingContact($contact, $finalData, $updateContact, $updateTags)
    {
        $response = $contact;

        if ($updateContact) {
            $response = Hooks::apply(Config::withPrefix('systemeio_update_contact'), static::proRequiredResponse(), $contact->id, $finalData, $this->apiUrl, $this->defaultHeader);
            $this->saveLog('Update Contact', $response, __('Contact updated successfully', 'bit-integrations'));
        }

        $tag = $this->integrationDetails->selectedTag ?? null;
        $assignedTagIds = array_map('intval', wp_list_pluck($contact->tags ?? [], 'id'));

        if ($updateTags && !empty($tag) && !\in_array((int) $tag, $assignedTagIds, true)) {
            $tagResponse = Hooks::apply(Config::withPrefix('systemeio_add_tag_to_existing_contact'), static::proRequiredResponse(), $contact->id, $tag, $this->apiUrl, $this->defaultHeader);
            $this->saveLog('Add Tag to Existing Contact', $tagResponse, __('Tag added to existing contact successfully', 'bit-integrations'));
        }

        return $response;
    }

    private function saveLog($typeName, $response, $successMessage)
    {
        $logType = wp_json_encode(['type' => $typeName, 'type_name' => $typeName]);
        $failed = is_wp_error($response)
            || (\is_array($response) && isset($response['success']) && false === $response['success'])
            || !static::isSuccessResponse();

        LogHandler::save($this->integrationId, $logType, $failed ? 'error' : 'success', wp_json_encode($failed ? $response : [$successMessage]));
    }

    private static function proRequiredResponse()
    {
        return ['success' => false, 'message' => __('Bit Integrations Pro is required.', 'bit-integrations'), 'code' => 400];
    }

    private function addTagWithLog($contactId, $tag)
    {
        $tagResponse = $this->addTag($contactId, $tag);
        $logType = wp_json_encode(['type' => 'Add Tag to Contact', 'type_name' => 'Add Tag to Contact']);

        if (\is_array($tagResponse) && isset($tagResponse['success']) && false === $tagResponse['success']) {
            LogHandler::save($this->integrationId, $logType, 'error', wp_json_encode($tagResponse));

            return;
        }
        if (static::isSuccessResponse()) {
            LogHandler::save($this->integrationId, $logType, 'success', wp_json_encode([__('Tag added to contact successfully', 'bit-integrations')]));
        } else {
            LogHandler::save($this->integrationId, $logType, 'error', wp_json_encode($tagResponse));
        }
    }

    private static function isSuccessResponse()
    {
        return HttpHelper::$responseCode >= 200 && HttpHelper::$responseCode < 300;
    }
}
