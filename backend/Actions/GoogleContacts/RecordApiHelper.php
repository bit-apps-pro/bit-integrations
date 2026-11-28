<?php

namespace BitApps\Integrations\Actions\GoogleContacts;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class RecordApiHelper
{
    private const API_BASE = 'https://people.googleapis.com/v1';

    private const SEARCH_READ_MASK = 'names,emailAddresses';

    private const UPDATE_PERSON_FIELDS = ['phoneNumbers', 'names', 'emailAddresses'];

    protected $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function handleInsertContact($data)
    {
        return HttpHelper::post(self::API_BASE . '/people:createContact', wp_json_encode($this->buildPerson($data)), $this->headers());
    }

    public function searchContact($data)
    {
        $query = trim((string) ($data['name'] ?? ''));

        if ($query === '') {
            return null;
        }

        HttpHelper::get(self::API_BASE . '/people:searchContacts', ['query' => '', 'readMask' => self::SEARCH_READ_MASK], $this->headers());

        $response = HttpHelper::get(self::API_BASE . '/people:searchContacts', ['query' => $query, 'readMask' => self::SEARCH_READ_MASK], $this->headers());

        if (is_wp_error($response) || !\is_object($response) || empty($response->results)) {
            return null;
        }

        $email = strtolower(trim((string) ($data['email'] ?? '')));

        foreach ($response->results as $result) {
            foreach ($result->person->emailAddresses ?? [] as $address) {
                if ($email !== '' && strtolower((string) ($address->value ?? '')) === $email) {
                    return $result->person;
                }
            }
        }

        return $response->results[0]->person ?? null;
    }

    public function handleUpdateContact($data, $resourceName, $eTag, $existingPerson = null)
    {
        $person = array_intersect_key($this->buildPerson($data), array_flip(self::UPDATE_PERSON_FIELDS));

        if (isset($person['names']) && !isset($data['lastName']) && !empty($existingPerson->names[0]->familyName)) {
            $person['names'][0]['familyName'] = $existingPerson->names[0]->familyName;
        }

        if (empty($person)) {
            return new WP_Error('GOOGLE_CONTACTS_NOTHING_TO_UPDATE', __('No mapped field has a value to update', 'bit-integrations'));
        }

        $apiEndpoint = self::API_BASE . "/{$resourceName}:updateContact?updatePersonFields=" . implode(',', array_keys($person));

        return HttpHelper::request($apiEndpoint, 'PATCH', wp_json_encode(['etag' => $eTag] + $person), $this->headers());
    }

    public function handleUploadPhoto($imageLocation, $resourceName)
    {
        $imageData = $this->readImage($imageLocation);

        if (is_wp_error($imageData)) {
            return $imageData;
        }

        return HttpHelper::request(
            self::API_BASE . "/{$resourceName}:updateContactPhoto",
            'PATCH',
            wp_json_encode(['photoBytes' => base64_encode($imageData)]),
            $this->headers()
        );
    }

    public function executeRecordApi($integrationId, $fieldValues, $fieldMap, $actions, $mainAction)
    {
        $fieldData = $this->mapFields($fieldValues, $fieldMap);
        $imageLocation = $this->attachmentValue($fieldValues, $actions);

        if ($mainAction === '1') {
            $response = $this->handleInsertContact($fieldData);

            if (!$this->logResult($integrationId, 'insert', $response, __('Failed to add contact', 'bit-integrations'))) {
                return;
            }

            $this->uploadPhoto($integrationId, $imageLocation, $response->resourceName ?? '');

            return;
        }

        if ($mainAction === '2') {
            $person = $this->searchContact($fieldData);

            if (empty($person->resourceName) || empty($person->etag)) {
                LogHandler::save($integrationId, wp_json_encode(['type' => 'contact', 'type_name' => 'update']), 'error', wp_json_encode(__('Contact not found, please check the name', 'bit-integrations')));

                return;
            }

            $response = $this->handleUpdateContact($fieldData, $person->resourceName, $person->etag, $person);

            if ($this->logResult($integrationId, 'update', $response, __('Failed to update contact', 'bit-integrations'))) {
                $this->uploadPhoto($integrationId, $imageLocation, $person->resourceName);
            }
        }
    }

    private function buildPerson(array $data): array
    {
        $value = fn ($key) => trim((string) ($data[$key] ?? ''));
        $person = [];

        $single = [
            'phoneNumber' => 'phoneNumbers',
            'nickname'    => 'nicknames',
            'locations'   => 'locations',
            'biographies' => 'biographies',
            'email'       => 'emailAddresses',
            'occupation'  => 'occupations',
        ];

        foreach ($single as $key => $personField) {
            if ($value($key) !== '') {
                $person[$personField] = [['value' => $value($key)]];
            }
        }

        if ($value('name') !== '' || $value('lastName') !== '') {
            $person['names'] = [array_filter(['givenName' => $value('name'), 'familyName' => $value('lastName')], 'strlen')];
        }

        if ($value('city') !== '' || $value('country') !== '') {
            $person['addresses'] = [array_filter(['city' => $value('city'), 'country' => $value('country')], 'strlen')];
        }

        if ($value('organization') !== '') {
            $person['organizations'] = [['name' => $value('organization')]];
        }

        return $person;
    }

    private function mapFields($fieldValues, $fieldMap): array
    {
        $fieldData = [];

        foreach ($fieldMap as $value) {
            if (empty($value->googleContactsFormField)) {
                continue;
            }

            if ($value->formField === 'custom' && isset($value->customValue)) {
                $fieldData[$value->googleContactsFormField] = Common::replaceFieldWithValue($value->customValue, $fieldValues);

                continue;
            }

            $fieldValue = $fieldValues[$value->formField] ?? '';
            $fieldData[$value->googleContactsFormField] = \is_array($fieldValue) ? wp_json_encode($fieldValue) : $fieldValue;
        }

        return $fieldData;
    }

    private function attachmentValue($fieldValues, $actions): string
    {
        $field = \is_object($actions) ? ($actions->attachments ?? '') : '';
        $value = $field === '' ? '' : ($fieldValues[$field] ?? '');

        if (\is_array($value)) {
            $value = reset($value);
        }

        return \is_string($value) ? $value : '';
    }

    private function readImage(string $imageLocation)
    {
        $localPath = Common::safeUploadFilePath($imageLocation);

        if ($localPath !== '') {
            $imageData = file_get_contents($localPath);

            return $imageData === false || $imageData === ''
                ? new WP_Error('GOOGLE_CONTACTS_PHOTO_UNREADABLE', __('The photo file could not be read', 'bit-integrations'))
                : $imageData;
        }

        $response = Common::safeRemoteGet($imageLocation);

        if (is_wp_error($response)) {
            return $response;
        }

        if (wp_remote_retrieve_response_code($response) !== 200 || wp_remote_retrieve_body($response) === '') {
            return new WP_Error('GOOGLE_CONTACTS_PHOTO_UNREADABLE', __('The photo file could not be downloaded', 'bit-integrations'));
        }

        return wp_remote_retrieve_body($response);
    }

    private function uploadPhoto($integrationId, string $imageLocation, string $resourceName): void
    {
        if ($imageLocation === '' || $resourceName === '') {
            return;
        }

        $this->logResult($integrationId, 'photo', $this->handleUploadPhoto($imageLocation, $resourceName), __('Failed to upload contact photo', 'bit-integrations'));
    }

    private function logResult($integrationId, string $typeName, $response, string $fallbackMessage): bool
    {
        $type = wp_json_encode(['type' => 'contact', 'type_name' => $typeName]);

        if (is_wp_error($response) || !\is_object($response) || isset($response->error)) {
            LogHandler::save($integrationId, $type, 'error', wp_json_encode($this->errorMessage($response, $fallbackMessage)));

            return false;
        }

        LogHandler::save($integrationId, $type, 'success', wp_json_encode($response));

        return true;
    }

    private function errorMessage($response, string $fallbackMessage): string
    {
        if (is_wp_error($response)) {
            return $response->get_error_message();
        }

        $message = \is_object($response) ? ($response->error->message ?? '') : '';

        return \is_string($message) && $message !== '' ? $message : $fallbackMessage;
    }

    private function headers(): array
    {
        return [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $this->token,
        ];
    }
}
