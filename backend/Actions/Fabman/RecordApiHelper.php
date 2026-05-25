<?php

namespace BitApps\Integrations\Actions\Fabman;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use DateTime;
use WP_Error;

class RecordApiHelper
{
    private const API_ENDPOINT = 'https://fabman.io/api/v1';

    private const SUCCESS_HTTP_CODES = [200, 201, 204];

    private const REQUIRED_FIELDS = ['emailAddress', 'firstName', 'lastName'];

    private const VALID_PRIVILEGES = ['member', 'admin', 'owner'];

    private const DATE_FORMATS = ['Y-m-d', 'd/m/Y', 'm/d/Y', 'Y-m-d H:i:s'];

    private const MAX_STRING_LENGTH = 255;

    private const MAX_NAME_LENGTH = 100;

    private const MAX_NOTES_LENGTH = 1000;

    private const MAX_MEMBER_NUMBER_LENGTH = 50;

    private const MIN_PHONE_LENGTH = 7;

    private const MAX_PHONE_LENGTH = 20;

    private $integrationID;

    private $apiKey;

    private $workspaceId;

    private $accountId;

    private $memberId;

    private $lockVersion;

    public function __construct($apiKey, $workspaceId, $accountId, $integrationID = null, $memberId = null, $lockVersion = null)
    {
        $this->integrationID = $integrationID;
        $this->apiKey = $apiKey;
        $this->workspaceId = $workspaceId;
        $this->accountId = $accountId;
        $this->memberId = $memberId;
        $this->lockVersion = $lockVersion;
    }

    public function execute($actionName, $fieldValues, $integrationDetails)
    {
        $finalData = $this->buildBaseData();

        foreach ($integrationDetails->field_map ?? [] as $fieldMap) {
            if (empty($fieldMap->formField) || empty($fieldMap->fabmanFormField)) {
                continue;
            }

            $rawValue = $this->getFieldValue($fieldMap, $fieldValues);
            $validatedValue = $this->validateAndSanitizeField($fieldMap->fabmanFormField, $rawValue);

            if ($validatedValue === false) {
                $this->logValidationError($fieldMap->fabmanFormField, $rawValue);

                continue;
            }

            $finalData[$fieldMap->fabmanFormField] = $validatedValue;
        }

        $apiResponse = $this->executeAction($actionName, $finalData);
        $this->logResponse($actionName, $apiResponse);

        return $apiResponse;
    }

    private function buildBaseData(): array
    {
        $data = ['account' => $this->accountId];

        if ($this->workspaceId) {
            $data['space'] = $this->workspaceId;
        }

        if ($this->memberId) {
            $data['memberId'] = $this->memberId;
        }

        return $data;
    }

    private function getFieldValue($fieldMap, $fieldValues)
    {
        if ($fieldMap->formField === 'custom') {
            return Common::replaceFieldWithValue($fieldMap->customValue, $fieldValues);
        }

        return $fieldValues[$fieldMap->formField] ?? null;
    }

    private function logValidationError($fieldName, $value): void
    {
        LogHandler::save(
            $this->integrationID,
            ['type' => 'validation', 'field' => $fieldName, 'value' => $value],
            'error',
            // translators: %s: Placeholder value
            \sprintf(__('Field validation failed for: %s', 'bit-integrations'), $fieldName)
        );
    }

    private function executeAction($actionName, $finalData)
    {
        switch ($actionName) {
            case 'create_member':
                return $this->createMember($finalData);
            case 'update_member':
                return $this->updateMember($finalData);
            case 'delete_member':
                return $this->deleteMember();
            case 'create_spaces':
                return $this->createSpace($finalData);
            case 'update_spaces':
                return $this->updateSpace($finalData);
            default:
                return new WP_Error('INVALID_ACTION', __('Invalid action name', 'bit-integrations'));
        }
    }

    private function logResponse($actionName, $apiResponse): void
    {
        $status = $this->determineResponseStatus($apiResponse);
        LogHandler::save(
            $this->integrationID,
            ['type' => 'record', 'type_name' => $actionName],
            $status,
            $apiResponse
        );
    }

    private function determineResponseStatus($apiResponse): string
    {
        if (is_wp_error($apiResponse) || (\is_object($apiResponse) && isset($apiResponse->error))) {
            return 'error';
        }

        return \in_array(HttpHelper::$responseCode, self::SUCCESS_HTTP_CODES) ? 'success' : 'error';
    }

    private function createMember($data)
    {
        unset($data['memberId']);
        $apiEndpoint = self::API_ENDPOINT . '/members';
        $apiResponse = HttpHelper::post($apiEndpoint, json_encode($data), $this->setHeaders());

        if (\is_wp_error($apiResponse)) {
            return $apiResponse;
        }

        if (HttpHelper::$responseCode === 201) {
            return $apiResponse;
        }

        return new WP_Error('API_ERROR', __('Failed to create member', 'bit-integrations'), $apiResponse);
    }

    private function updateMember($data)
    {
        $this->addLockVersionIfValid($data);

        if (empty($this->memberId)) {
            return new WP_Error('MISSING_MEMBER_ID', __('The email provided did not match any existing Fabman member.', 'bit-integrations'));
        }

        $response = Hooks::apply(Config::withPrefix('fabman_update_member'), false, json_encode($data), $this->setHeaders(), self::API_ENDPOINT, $this->memberId);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_fabman_update_member` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_fabman_update_member', $response, json_encode($data), $this->setHeaders(), self::API_ENDPOINT, $this->memberId);

        return $this->handleFilterResponse($response);
    }

    private function deleteMember()
    {
        if (empty($this->memberId)) {
            return new WP_Error('MISSING_MEMBER_ID', __('The email provided did not match any existing Fabman member.', 'bit-integrations'));
        }

        $response = Hooks::apply(Config::withPrefix('fabman_delete_member'), false, $this->setHeaders(), self::API_ENDPOINT, $this->memberId);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_fabman_delete_member` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_fabman_delete_member', $response, $this->setHeaders(), self::API_ENDPOINT, $this->memberId);

        return $this->handleFilterResponse($response);
    }

    private function createSpace($data)
    {
        unset($data['space']);
        $response = Hooks::apply(Config::withPrefix('fabman_create_space'), false, json_encode($data), $this->setHeaders(), self::API_ENDPOINT);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_fabman_create_space` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_fabman_create_space', $response, json_encode($data), $this->setHeaders(), self::API_ENDPOINT);

        return $this->handleFilterResponse($response);
    }

    private function updateSpace($data)
    {
        if (empty($this->workspaceId)) {
            return new WP_Error('MISSING_SPACE_ID', __('Please select a space to update.', 'bit-integrations'));
        }

        // lockVersion is required for update operations
        if (empty($this->lockVersion) || !is_numeric($this->lockVersion)) {
            return new WP_Error('MISSING_LOCK_VERSION', __('Lock version is required for updating space.', 'bit-integrations'));
        }

        $data['lockVersion'] = (int) $this->lockVersion;

        $response = Hooks::apply(Config::withPrefix('fabman_update_space'), false, json_encode($data), $this->setHeaders(), self::API_ENDPOINT, $this->workspaceId);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_fabman_update_space` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_fabman_update_space', $response, json_encode($data), $this->setHeaders(), self::API_ENDPOINT, $this->workspaceId);

        return $this->handleFilterResponse($response);
    }

    private function addLockVersionIfValid(array &$data): void
    {
        if ($this->lockVersion === null || $this->lockVersion === '') {
            return;
        }

        if (is_numeric($this->lockVersion)) {
            $data['lockVersion'] = (int) $this->lockVersion;
        }
    }

    private function handleFilterResponse($response)
    {
        if (empty($response)) {
            // translators: %s: Placeholder value
            return (object) ['error' => \wp_sprintf(\__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integration Pro')];
        }

        return $response;
    }

    /**
     * Validates and sanitizes field values based on Fabman API field requirements
     *
     * @param string $fieldName The Fabman field name
     * @param mixed  $value     The raw value to validate
     *
     * @return mixed|false The sanitized value or false if validation fails
     */
    private function validateAndSanitizeField($fieldName, $value)
    {
        if ($this->isEmptyValue($value)) {
            return $this->isFieldRequired($fieldName) ? false : null;
        }

        $value = trim((string) $value);
        if ($value === '') {
            return $this->isFieldRequired($fieldName) ? false : null;
        }

        return $this->validateByFieldType($fieldName, $value);
    }

    private function isEmptyValue($value): bool
    {
        return $value === null || $value === '';
    }

    private function validateByFieldType($fieldName, $value)
    {
        switch ($fieldName) {
            case 'emailAddress':
                return $this->validateEmail($value);
            case 'firstName':
            case 'lastName':
            case 'displayName':
                return $this->validateName($value);
            case 'phone':
                return $this->validatePhone($value);
            case 'notes':
                return $this->validateNotes($value);
            case 'lockVersion':
                return $this->validateLockVersion($value);
            case 'privileges':
                return $this->validatePrivileges($value);
            case 'memberNumber':
                return $this->validateMemberNumber($value);
            case 'birthday':
                return $this->validateDate($value);
            case 'space':
            case 'account':
            case 'memberId':
                return $this->validateId($value);
            default:
                return $this->sanitizeString($value, self::MAX_STRING_LENGTH);
        }
    }

    private function isFieldRequired($fieldName): bool
    {
        return \in_array($fieldName, self::REQUIRED_FIELDS);
    }

    private function validateEmail($value)
    {
        $email = sanitize_email($value);

        return is_email($email) ? $email : false;
    }

    private function validateName($value)
    {
        return $this->sanitizeString($value, self::MAX_NAME_LENGTH);
    }

    private function validatePhone($value)
    {
        $phone = preg_replace('/[^\d\s\+\-\(\)]/', '', $value);
        $phone = trim($phone);

        $phoneLength = \strlen($phone);
        if ($phoneLength < self::MIN_PHONE_LENGTH || $phoneLength > self::MAX_PHONE_LENGTH) {
            return false;
        }

        return $phone;
    }

    private function validateNotes($value)
    {
        return $this->sanitizeString($value, self::MAX_NOTES_LENGTH);
    }

    private function validateLockVersion($value)
    {
        if (!is_numeric($value)) {
            return false;
        }

        $version = (int) $value;

        return $version >= 0 ? $version : false;
    }

    private function validatePrivileges($value)
    {
        if (\is_array($value)) {
            return $this->validatePrivilegesArray($value);
        }

        return $this->validatePrivilegesScalar($value);
    }

    private function validatePrivilegesArray($value)
    {
        $sanitizedArray = array_map('sanitize_text_field', $value);

        foreach ($sanitizedArray as $privilege) {
            if (!\in_array($privilege, self::VALID_PRIVILEGES, true)) {
                return false;
            }
        }

        return $sanitizedArray;
    }

    private function validatePrivilegesScalar($value)
    {
        $sanitizedValue = sanitize_text_field($value);

        return \in_array($sanitizedValue, self::VALID_PRIVILEGES, true) ? $sanitizedValue : false;
    }

    private function validateMemberNumber($value)
    {
        $memberNumber = preg_replace('/[^a-zA-Z0-9\-_]/', '', $value);

        return \strlen($memberNumber) <= self::MAX_MEMBER_NUMBER_LENGTH ? $memberNumber : false;
    }

    private function validateDate($value)
    {
        foreach (self::DATE_FORMATS as $format) {
            $dateObj = DateTime::createFromFormat($format, $value);
            if ($dateObj !== false) {
                return $dateObj->format('c');
            }
        }

        return false;
    }

    private function validateId($value)
    {
        if (!is_numeric($value)) {
            return false;
        }

        $id = (int) $value;

        return $id > 0 ? $id : false;
    }

    private function sanitizeString($value, $maxLength = self::MAX_STRING_LENGTH)
    {
        $sanitized = wp_strip_all_tags($value);

        if (mb_strlen($sanitized) > $maxLength) {
            $sanitized = mb_substr($sanitized, 0, $maxLength);
        }

        return $sanitized;
    }

    private function setHeaders(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type'  => 'application/json'
        ];
    }
}
