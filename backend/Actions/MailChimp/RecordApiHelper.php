<?php

/**
 * MailChimp Record Api
 */

namespace BitApps\Integrations\Actions\MailChimp;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_defaultHeader;

    private $_tokenDetails;

    private $_integrationID;

    private $_integrationDetails;

    public function __construct($tokenDetails, $integId, $integrationDetails)
    {
        $this->_defaultHeader['Authorization'] = "Bearer {$tokenDetails->access_token}";
        $this->_defaultHeader['Content-Type'] = 'application/json';
        $this->_tokenDetails = $tokenDetails;
        $this->_integrationID = $integId;
        $this->_integrationDetails = $integrationDetails;
    }

    public function insertRecord($listId, $data)
    {
        $insertRecordEndpoint = $this->_apiEndPoint() . "/lists/{$listId}/members";

        return HttpHelper::post($insertRecordEndpoint, $data, $this->_defaultHeader);
    }

    public function addRemoveTag($module, $listId, $data)
    {
        // translators: %s: Plugin name
        $msg = wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro');
        $subscriber_hash = md5(strtolower(trim($data['email_address'])));
        $endpoint = $this->_apiEndPoint() . "/lists/{$listId}/members/{$subscriber_hash}/tags";

        $response = Hooks::apply(Config::withPrefix('mailchimp_add_remove_tag'), $module, $data, $endpoint, $this->_defaultHeader);

        $response = Hooks::apply('btcbi_mailchimp_add_remove_tag', $response, $data, $endpoint, $this->_defaultHeader);

        if (\is_string($response) && $response == $module) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $module], 'error', $msg);

            return (object) ['status' => 400, 'message' => $msg];
        }

        return $response;
    }

    public function updateRecord($listId, $contactId, $data)
    {
        $updateRecordEndpoint = $this->_apiEndPoint() . "/lists/{$listId}/members/{$contactId}";

        return HttpHelper::request($updateRecordEndpoint, 'PUT', $data, $this->_defaultHeader);
    }

    public function existContact($listId, $queryParam)
    {
        $existSearchEnpoint = $this->_apiEndPoint() . "/search-members?query={$queryParam}&list_id={$listId}";

        return HttpHelper::get($existSearchEnpoint, null, $this->_defaultHeader);
    }

    public function execute($listId, $module, $tags, $defaultConf, $fieldValues, $fieldMap, $actions, $addressFields)
    {
        $fieldData = static::generateFieldMap($fieldMap, $fieldValues, $actions, $addressFields, $tags);

        if (empty($module) || $module == 'add_a_member_to_an_audience') {
            $fieldData = Hooks::apply(Config::withPrefix('mailchimp_map_language'), $fieldData, $this->_integrationDetails);

            $fieldData = Hooks::apply('btcbi_mailchimp_map_language', $fieldData, $this->_integrationDetails);

            $contactEmail = $fieldData['email_address'];
            $foundContact = $this->existContact($listId, $contactEmail);

            if (!empty($actions->update) && !empty($foundContact->exact_matches->members)) {
                $contactId = $foundContact->exact_matches->members[0]->id;
                $fieldData['status'] = $foundContact->exact_matches->members[0]->status;
                $recordApiResponse = $this->updateRecord($listId, $contactId, wp_json_encode($fieldData));
                $type = 'update';
            } else {
                $recordApiResponse = $this->insertRecord($listId, wp_json_encode($fieldData));
                $type = 'insert';
            }

            if (isset($recordApiResponse->id, $this->_integrationDetails->selectedGDPR)) {
                Hooks::run(Config::withPrefix('mailchimp_store_gdpr_permission'), $recordApiResponse, $this->_integrationDetails->selectedGDPR, $listId, $this->_apiEndPoint(), $this->_defaultHeader, $this->_integrationID);

                Hooks::run('btcbi_mailchimp_store_gdpr_permission', $recordApiResponse, $this->_integrationDetails->selectedGDPR, $listId, $this->_apiEndPoint(), $this->_defaultHeader, $this->_integrationID);
            }
        } elseif ($module == 'add_tag_to_a_member' || $module == 'remove_tag_from_a_member') {
            $type = $module;
            $recordApiResponse = $this->addRemoveTag($module, $listId, $fieldData);
        }

        if (isset($recordApiResponse->status) && ($recordApiResponse->status === 400 || $recordApiResponse->status === 404)) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'error', wp_json_encode($recordApiResponse));
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'success', wp_json_encode($recordApiResponse));
        }

        return $recordApiResponse;
    }

    private static function generateFieldMap($fieldMap, $fieldValues, $actions, $addressFields, $tags)
    {
        $fieldData = [];
        $mergeFields = [];
        foreach ($fieldMap as $fieldKey => $fieldPair) {
            if (!empty($fieldPair->mailChimpField)) {
                if ($fieldPair->mailChimpField === 'email_address') {
                    $fieldData['email_address'] = $fieldValues[$fieldPair->formField];
                } elseif ($fieldPair->mailChimpField === 'BIRTHDAY') {
                    $date = $fieldValues[$fieldPair->formField];
                    $mergeFields[$fieldPair->mailChimpField] = gmdate('m/d', strtotime($date));
                } elseif ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $mergeFields[$fieldPair->mailChimpField] = $fieldPair->customValue;
                } else {
                    $mergeFields[$fieldPair->mailChimpField] = $fieldValues[$fieldPair->formField];
                }
            }
        }

        $doubleOptIn = !empty($actions->double_opt_in) && $actions->double_opt_in ? true : false;

        $fieldData['merge_fields'] = (object) $mergeFields;
        $fieldData['tags'] = !empty($tags) ? $tags : [];
        $fieldData['status'] = $doubleOptIn ? 'pending' : 'subscribed';
        $fieldData['double_optin'] = $doubleOptIn;
        if (!empty($actions->address)) {
            $fvalue = [];
            foreach ($addressFields as $key) {
                foreach ($fieldValues as $k => $v) {
                    if ($key->formField == $k) {
                        $fvalue[$key->mailChimpAddressField] = $v;
                    }
                }
            }
            $fieldData['merge_fields']->ADDRESS = (object) $fvalue;
        }

        return $fieldData;
    }

    private function _apiEndPoint()
    {
        return "https://{$this->_tokenDetails->dc}.api.mailchimp.com/3.0";
    }
}
