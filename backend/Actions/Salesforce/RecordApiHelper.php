<?php

namespace BitApps\Integrations\Actions\Salesforce;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use DateTime;
use DateTimeImmutable;
use DateTimeZone;
use Throwable;

/**
 * Provide functionality for Record insert,upsert
 */
class RecordApiHelper
{
    private $_defaultHeader;

    private $_apiDomain;

    private $_integrationID;

    public function __construct($tokenDetails, $_integrationID)
    {
        $this->_defaultHeader['Authorization'] = "Bearer {$tokenDetails->access_token}";
        $this->_defaultHeader['Content-Type'] = 'application/json';
        $this->_apiDomain = $tokenDetails->instance_url;
        $this->_integrationID = $_integrationID;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->selesforceField;

            $dataFinal[$actionValue] = self::convertToSalesforceFormat(
                $triggerValue === 'custom' && isset($value->customValue)
                    ? Common::replaceFieldWithValue($value->customValue, $data)
                    : ($data[$triggerValue] ?? null)
            );
        }

        return $dataFinal;
    }

    public function insertContact($finalData, $update = false)
    {
        $apiEndpoint = $this->_apiDomain . '/services/data/v37.0/sobjects/Contact';

        $response = HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->_defaultHeader);

        if (!$update) {
            return $response;
        }

        $filteredResult = Hooks::apply(Config::withPrefix('salesforce_update_record'), $response, $apiEndpoint, $finalData, $this->_defaultHeader);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_salesforce_update_record` filter instead.
         * @since 2.7.8
         */
        return Hooks::apply('btcbi_salesforce_update_record', $filteredResult, $apiEndpoint, $finalData, $this->_defaultHeader);
    }

    public function insertRecord($finalData, $action)
    {
        $apiEndpoint = $this->_apiDomain . '/services/data/v37.0/sobjects/' . $action;

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->_defaultHeader);
    }

    public function insertLead($finalData, $update = false)
    {
        $apiEndpoint = $this->_apiDomain . '/services/data/v37.0/sobjects/Lead';

        $response = HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->_defaultHeader);

        if (!$update) {
            return $response;
        }

        $filteredResult = Hooks::apply(Config::withPrefix('salesforce_update_record'), $response, $apiEndpoint, $finalData, $this->_defaultHeader);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_salesforce_update_record` filter instead.
         * @since 2.7.8
         */
        return Hooks::apply('btcbi_salesforce_update_record', $filteredResult, $apiEndpoint, $finalData, $this->_defaultHeader);
    }

    public function createAccount($finalData)
    {
        $apiEndpoint = $this->_apiDomain . '/services/data/v37.0/sobjects/Account';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->_defaultHeader);
    }

    public function createCampaign($finalData)
    {
        $apiEndpoint = $this->_apiDomain . '/services/data/v37.0/sobjects/Campaign';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->_defaultHeader);
    }

    public function insertCampaignMember($campaignId, $leadId, $contactId, $statusId)
    {
        $apiEndpoint = $this->_apiDomain . '/services/data/v37.0/sobjects/CampaignMember';
        $finalData = [
            'CampaignId' => $campaignId,
            'LeadId'     => $leadId,
            'ContactId'  => $contactId,
            'Status'     => $statusId
        ];

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->_defaultHeader);
    }

    public function createTask($contactId, $accountId, $subjectId, $priorityId, $statusId)
    {
        $apiEndpoint = $this->_apiDomain . '/services/data/v37.0/sobjects/Task';
        $finalData = [
            'Subject'  => $subjectId,
            'Priority' => $priorityId,
            'WhoId'    => $contactId,
            'WhatId'   => $accountId,
            'Status'   => $statusId
        ];

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->_defaultHeader);
    }

    public function createOpportunity($finalData, $opportunityTypeId, $opportunityStageId, $opportunityLeadSourceId, $accountId, $campaignId)
    {
        $apiEndpoint = $this->_apiDomain . '/services/data/v37.0/sobjects/Opportunity';
        $finalData['AccountId'] = $accountId;
        $finalData['CampaignId'] = $campaignId;
        $finalData['Type'] = $opportunityTypeId;
        $finalData['StageName'] = $opportunityStageId;
        $finalData['LeadSource'] = $opportunityLeadSourceId;

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->_defaultHeader);
    }

    public function createEvent($finalData, $contactId, $accountId, $eventSubjectId)
    {
        $apiEndpoint = $this->_apiDomain . '/services/data/v37.0/sobjects/Event';
        $finalData['WhoId'] = $contactId;
        $finalData['WhatId'] = $accountId;
        $finalData['Subject'] = $eventSubjectId;

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->_defaultHeader);
    }

    public function createCase($finalData, $actionsData)
    {
        $apiEndpoint = $this->_apiDomain . '/services/data/v37.0/sobjects/Case';

        foreach ($actionsData as $key => $value) {
            if (isset($value)) {
                $finalData[$key] = $value;
            }
        }

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->_defaultHeader);
    }

    public function execute($integrationDetails, $fieldValues, $fieldMap, $actions)
    {
        $actionName = $integrationDetails->actionName;
        $update = isset($actions->update) ? $actions->update : false;

        if ($actionName === 'contact-create') {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $response = $this->insertContact($finalData, $update);

            $responseType = self::getResponseType();
            $typeName = !$update || (\is_object($response) && isset($response->id)) ? 'Contact-create' : 'Contact-update';

            $message = wp_json_encode($response);

            if ($responseType === 'success' && $update) {
                $message = __('Contact Updated Successfully', 'bit-integrations');
            } elseif ($responseType === 'success') {
                // translators: %s: Placeholder value
                $message = wp_json_encode(wp_sprintf(__('Created contact id is : %s', 'bit-integrations'), $response->id));
            }

            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Contact', 'type_name' => $typeName]), $responseType, $message);
        } elseif ($actionName === 'lead-create') {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

            $finalData = Hooks::apply(Config::withPrefix('salesforce_add_lead_utilities'), $finalData, $actions);

            /**
             * @deprecated 2.7.8 Use `bit_integrations_salesforce_add_lead_utilities` filter instead.
             * @since 2.7.8
             */
            $finalData = Hooks::apply('btcbi_salesforce_add_lead_utilities', $finalData, $actions);

            $insertLeadResponse = $this->insertLead($finalData, $update);

            $responseType = self::getResponseType();
            $typeName = !$update || (\is_object($insertLeadResponse) && isset($insertLeadResponse->id)) ? 'Lead-create' : 'Lead-update';

            $message = wp_json_encode($insertLeadResponse);

            if ($responseType === 'success' && $update) {
                $message = __('Lead Updated Successfully', 'bit-integrations');
            } elseif ($responseType === 'success') {
                // translators: %s: Placeholder value
                $message = wp_json_encode(wp_sprintf(__('Created lead id is : %s', 'bit-integrations'), $insertLeadResponse->id));
            }

            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Lead', 'type_name' => $typeName]), $responseType, $message);
        } elseif ($actionName === 'account-create') {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

            if (isset($actions->selectedAccType)) {
                $finalData['Type'] = $actions->selectedAccType;
            }
            if (isset($actions->selectedOwnership)) {
                $finalData['Ownership'] = $actions->selectedOwnership;
            }

            $createAccountResponse = $this->createAccount($finalData);

            if (\is_object($createAccountResponse) && property_exists($createAccountResponse, 'id')) {
                // translators: %s: Placeholder value
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Account', 'type_name' => 'Account-create']), 'success', wp_json_encode(wp_sprintf(__('Created account id is : %s', 'bit-integrations'), $createAccountResponse->id)));
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Account', 'type_name' => 'Account-create']), 'error', wp_json_encode($createAccountResponse));
            }
        } elseif ($actionName === 'campaign-create') {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $insertCampaignResponse = $this->createCampaign($finalData);
            if (\is_object($insertCampaignResponse) && property_exists($insertCampaignResponse, 'id')) {
                // translators: %s: Placeholder value
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Campaign', 'type_name' => 'Campaign-create']), 'success', wp_json_encode(wp_sprintf(__('Created campaign id is : %s', 'bit-integrations'), $insertCampaignResponse->id)));
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Campaign', 'type_name' => 'Campaign-create']), 'error', wp_json_encode($insertCampaignResponse));
            }
        } elseif ($actionName === 'add-campaign-member') {
            $campaignId = $integrationDetails->campaignId;
            $leadId = isset($integrationDetails->leadId) ? $integrationDetails->leadId : null;
            $contactId = isset($integrationDetails->contactId) ? $integrationDetails->contactId : null;
            $statusId = isset($integrationDetails->statusId) ? $integrationDetails->statusId : null;
            $insertCampaignMember = $this->insertCampaignMember($campaignId, $leadId, $contactId, $statusId);
            if (\is_object($insertCampaignMember) && property_exists($insertCampaignMember, 'id')) {
                // translators: %s: Placeholder value
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'CampaignMember', 'type_name' => 'CampaignMember-create']), 'success', wp_json_encode(wp_sprintf(__('Created campaign member id is : %s', 'bit-integrations'), $insertCampaignMember->id)));
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'CampaignMember', 'type_name' => 'CampaignMember-create']), 'error', wp_json_encode($insertCampaignMember));
            }
        } elseif ($actionName === 'task-create') {
            $contactId = isset($integrationDetails->contactId) ? $integrationDetails->contactId : null;
            $accountId = isset($integrationDetails->accountId) ? $integrationDetails->accountId : null;
            $subjectId = $integrationDetails->subjectId;
            $priorityId = $integrationDetails->priorityId;
            $statusId = isset($integrationDetails->statusId) ? $integrationDetails->statusId : null;
            $apiResponse = $this->createTask($contactId, $accountId, $subjectId, $priorityId, $statusId);
            if (\is_object($apiResponse) && property_exists($apiResponse, 'id')) {
                // translators: %s: Placeholder value
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Task', 'type_name' => 'Task-create']), 'success', wp_json_encode(wp_sprintf(__('Created task id is : %s', 'bit-integrations'), $apiResponse->id)));
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Task', 'type_name' => 'Task-create']), 'error', wp_json_encode($apiResponse));
            }
        } elseif ($actionName === 'opportunity-create') {
            $opportunityTypeId = isset($actions->opportunityTypeId) ? $actions->opportunityTypeId : null;
            $opportunityStageId = isset($actions->opportunityStageId) ? $actions->opportunityStageId : null;
            $opportunityLeadSourceId = isset($actions->opportunityLeadSourceId) ? $actions->opportunityLeadSourceId : null;
            $accountId = isset($actions->accountId) ? $actions->accountId : null;
            $campaignId = isset($actions->campaignId) ? $actions->campaignId : null;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $opportunityResponse = $this->createOpportunity($finalData, $opportunityTypeId, $opportunityStageId, $opportunityLeadSourceId, $accountId, $campaignId);
            if (\is_object($opportunityResponse) && property_exists($opportunityResponse, 'id')) {
                // translators: %s: Placeholder value
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Opportunity', 'type_name' => 'Opportunity-create']), 'success', wp_json_encode(wp_sprintf(__('Created opportunity id is : %s', 'bit-integrations'), $opportunityResponse->id)));
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Opportunity', 'type_name' => 'Opportunity-create']), 'error', wp_json_encode($opportunityResponse));
            }
        } elseif ($actionName === 'event-create') {
            $contactId = isset($actions->contactId) ? $actions->contactId : null;
            $accountId = isset($actions->accountId) ? $actions->accountId : null;
            $eventSubjectId = isset($actions->eventSubjectId) ? $actions->eventSubjectId : null;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $createEventResponse = $this->createEvent($finalData, $contactId, $accountId, $eventSubjectId);
            if (\is_object($createEventResponse) && property_exists($createEventResponse, 'id')) {
                // translators: %s: Placeholder value
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Event', 'type_name' => 'Event-create']), 'success', wp_json_encode(wp_sprintf(__('Created event id is : %s', 'bit-integrations'), $createEventResponse->id)));
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Event', 'type_name' => 'Event-create']), 'error', wp_json_encode($createEventResponse));
            }
        } elseif ($actionName === 'case-create') {
            $actionsData['ContactId'] = isset($actions->contactId) ? $actions->contactId : null;
            $actionsData['AccountId'] = isset($actions->accountId) ? $actions->accountId : null;
            $actionsData['Status'] = isset($actions->caseStatusId) ? $actions->caseStatusId : null;
            $actionsData['Origin'] = isset($actions->caseOriginId) ? $actions->caseOriginId : null;
            $actionsData['Priority'] = isset($actions->casePriorityId) ? $actions->casePriorityId : null;
            $actionsData['Reason'] = isset($actions->caseReason) ? $actions->caseReason : null;
            $actionsData['Type'] = isset($actions->caseType) ? $actions->caseType : null;
            $actionsData['PotentialLiability__c'] = isset($actions->potentialLiabilityId) ? $actions->potentialLiabilityId : null;
            $actionsData['SLAViolation__c'] = isset($actions->slaViolationId) ? $actions->slaViolationId : null;

            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $createCaseResponse = $this->createCase($finalData, $actionsData);

            if (\is_object($createCaseResponse) && property_exists($createCaseResponse, 'id')) {
                // translators: %s: Placeholder value
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Case', 'type_name' => 'Case-create']), 'success', wp_json_encode(wp_sprintf(__('Created case id is : %s', 'bit-integrations'), $createCaseResponse->id)));
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Case', 'type_name' => 'Case-create']), 'error', wp_json_encode($createCaseResponse));
            }
        } else {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $insertContactResponse = $this->insertRecord($finalData, $actionName);
            if (\is_object($insertContactResponse) && property_exists($insertContactResponse, 'id')) {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => $actionName, 'type_name' => $actionName . '-create']), 'success', wp_json_encode("{$actionName} id is : {$insertContactResponse->id}"));
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => $actionName, 'type_name' => $actionName . '-create']), 'error', wp_json_encode($insertContactResponse));
            }
        }

        return true;
    }

    public static function convertToSalesforceFormat($input)
    {
        try {
            if (!$input || !\is_string($input)) {
                return $input;
            }

            $input = trim($input);

            if (empty($input)) {
                return $input;
            }

            // ----------------------------
            // PHONE NUMBER PROTECTION
            // ----------------------------
            if (preg_match('/^\+?\d{7,15}$/', $input)) {
                return $input;
            }

            // ------------------------------------------------------------
            // 1) Handle UNIX timestamps (10 or 13 digits)
            // ------------------------------------------------------------
            if (self::validateNumericDateWithLength($input, 10)) {
                return gmdate('Y-m-d\TH:i:s\Z', (int) $input);
            }
            if (self::validateNumericDateWithLength($input, 13)) {
                return gmdate('Y-m-d\TH:i:s\Z', (int) ($input / 1000));
            }

            // ------------------------------------------------------------
            // 2) Natural-language dates ("today", "tomorrow", "next Monday", etc.)
            // ------------------------------------------------------------
            // WP 5.1 compat: strpos() in place of str_contains() (WP 5.9)
            if (preg_match('/^[a-zA-Z ]+$/', $input) || strpos($input, 'ago') !== false) {
                $ts = strtotime($input);
                if ($ts) {
                    return gmdate('Y-m-d', $ts);
                }
            }

            // ------------------------------------------------------------
            // 3) Clean ordinals: 1st, 2nd, 3rd, 21st, 31st...
            // ------------------------------------------------------------
            $clean = preg_replace('/\b(\d+)(st|nd|rd|th)\b/i', '$1', $input);

            // ------------------------------------------------------------
            // 4) Japanese/Chinese/Korean locale replacements
            // ------------------------------------------------------------
            $clean = str_replace(
                ['年', '月', '日', '년', '월', '일'],
                ['-', '-', '', '-', '-', ''],
                $clean
            );

            // ------------------------------------------------------------
            // 5) Week-based formats (2025-W05 or 2025-W05-6)
            // ------------------------------------------------------------
            if (preg_match('/^(\d{4})-?W(\d{2})(?:-?(\d))?$/i', $clean, $m)) {
                $year = $m[1];
                $week = $m[2];
                $day = $m[3] ?? 1;

                try {
                    $dt = new DateTime("{$year}-W{$week}-{$day}", new DateTimeZone('UTC'));

                    return $dt->format('Y-m-d');
                } catch (Throwable $e) {
                }
            }

            // ------------------------------------------------------------
            // 6) Quarter formats (Q1 2025, 2025 Q1, 1st Quarter 2025)
            // ------------------------------------------------------------
            if (preg_match('/(Q[1-4]|[1-4]st Quarter)\s*[, ]*\s*(\d{4})/i', $clean, $m)) {
                $q = preg_replace('/\D/', '', $m[1]); // Extract 1–4
                $year = $m[2];
                $month = (($q - 1) * 3) + 1;

                return "{$year}-" . str_pad($month, 2, '0', STR_PAD_LEFT) . '-01';
            }

            // ------------------------------------------------------------
            // 7) Compact numeric formats (01022025, 20250201, 250201, 010225)
            // ------------------------------------------------------------
            if (self::validateNumericDateWithLength($clean, 8)) {
                // YYYYMMDD or DDMMYYYY or MMDDYYYY → try multiple interpretations
                $candidates = [
                    substr($clean, 0, 4) . '-' . substr($clean, 4, 2) . '-' . substr($clean, 6, 2), // YMD
                    substr($clean, 4, 4) . '-' . substr($clean, 2, 2) . '-' . substr($clean, 0, 2), // DMY
                ];
                foreach ($candidates as $c) {
                    if (strtotime($c)) {
                        return $c;
                    }
                }
            }

            if (self::validateNumericDateWithLength($clean, 6)) {
                // DDMMYY / YYMMDD / MMDDYY
                $yy = \intval(substr($clean, -2));

                // Sliding window: interpret two-digit year as closest to current year within 50 years
                $currentYear = \intval(gmdate('Y'));
                $century = \intval($currentYear / 100) * 100;
                $fullYear = $century + $yy;
                $window = 50;

                if ($fullYear < $currentYear - $window) {
                    $fullYear += 100;
                } elseif ($fullYear > $currentYear + $window) {
                    $fullYear -= 100;
                }

                $dm = substr($clean, 0, 2) . '-' . substr($clean, 2, 2) . '-' . $fullYear;
                $md = substr($clean, 2, 2) . '-' . substr($clean, 0, 2) . '-' . $fullYear;

                foreach ([$dm, $md] as $c) {
                    $ts = strtotime($c);
                    if ($ts) {
                        return gmdate('Y-m-d', $ts);
                    }
                }
            }

            // ------------------------------------------------------------
            // 8) Try direct DateTime parsing for most formats
            // ------------------------------------------------------------
            $dt = self::tryParseDateTimeImmutable($clean);

            if ($dt instanceof DateTimeImmutable) {
                // Detect if datetime or pure date
                if (preg_match('/\d{1,2}:\d/', $clean)) {
                    return $dt->setTimezone(new DateTimeZone('UTC'))
                        ->format('Y-m-d\TH:i:s\Z');
                }

                return $dt->format('Y-m-d');
            }

            // ------------------------------------------------------------
            // 9) Last fallback using strtotime()
            // ------------------------------------------------------------
            $ts = strtotime($clean);
            if ($ts) {
                // Detect datetime or date-only
                if (preg_match('/\d{1,2}:\d/', $clean)) {
                    return gmdate('Y-m-d\TH:i:s\Z', $ts);
                }

                return gmdate('Y-m-d', $ts);
            }

            // ------------------------------------------------------------
            // 10) No match → return original
            // ------------------------------------------------------------
            return $input;
        } catch (Throwable $th) {
            return $input;
        }
    }

    private static function tryParseDateTimeImmutable($value)
    {
        try {
            return new DateTimeImmutable($value);
        } catch (Throwable $e) {
            return;
        }
    }

    private static function validateNumericDateWithLength($input, $length)
    {
        return is_numeric($input) && \strlen($input) === $length;
    }

    private static function getResponseType()
    {
        return strpos(HttpHelper::$responseCode, 20) === 0 ? 'success' : 'error';
    }
}
