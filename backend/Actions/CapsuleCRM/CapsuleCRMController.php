<?php

/**
 * CapsuleCRM Integration
 */

namespace BitApps\Integrations\Actions\CapsuleCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for CapsuleCRM integration
 */
class CapsuleCRMController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'capsulecrm',
        'fields'   => [
            'api_key' => 'token',
            'api_url' => 'api_url',
        ],
    ];

    protected $_defaultHeader;

    protected $apiEndpoint;

    public function __construct()
    {
        $this->apiEndpoint = 'https://api.capsulecrm.com/api/v2';
    }

    public function getCustomFields($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $action = $fieldsRequestParams->action;
        if ($action == 'person' || $action == 'organisation') {
            $apiEndpoint = $this->apiEndpoint . '/parties/fields/definitions';
        } elseif ($action == 'opportunity') {
            $apiEndpoint = $this->apiEndpoint . '/opportunities/fields/definitions';
        } elseif ($action == 'project') {
            $apiEndpoint = $this->apiEndpoint . '/kases/fields/definitions';
        }

        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->definitions)) {
            foreach ($response->definitions as $customField) {
                $customFields[] = [
                    'key'      => $customField->id,
                    'label'    => $customField->name,
                    'required' => $customField->important,
                ];
            }
            wp_send_json_success($customFields, 200);
        } else {
            wp_send_json_error(__('Custom field fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllOpportunities($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->apiEndpoint . '/opportunities';
        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->opportunities)) {
            foreach ($response->opportunities as $opportunity) {
                $opportunities[] = [
                    'id'   => (string) $opportunity->id,
                    'name' => $opportunity->name
                ];
            }
            wp_send_json_success($opportunities, 200);
        } else {
            wp_send_json_error(__('Opportunity fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllOwners($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->apiEndpoint . '/users';
        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->users)) {
            foreach ($response->users as $owner) {
                $owners[] = [
                    'id'   => (string) $owner->id,
                    'name' => $owner->name
                ];
            }
            wp_send_json_success($owners, 200);
        } else {
            wp_send_json_error(__('Owners fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllTeams($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->apiEndpoint . '/teams';
        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->teams)) {
            foreach ($response->teams as $team) {
                $teams[] = [
                    'id'   => (string) $team->id,
                    'name' => $team->name
                ];
            }
            wp_send_json_success($teams, 200);
        } else {
            wp_send_json_error(__('Teams fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCurrencies($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->apiEndpoint . '/currencies';
        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->currencies)) {
            foreach ($response->currencies as $currency) {
                $currencies[] = [
                    'id'   => (string) $currency->code,
                    'name' => $currency->code
                ];
            }
            wp_send_json_success($currencies, 200);
        } else {
            wp_send_json_error(__('Currencies fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCRMParties($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->apiEndpoint . '/parties';
        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (!empty($response->parties)) {
            foreach ($response->parties as $party) {
                if ($party->type == 'organisation') {
                    $parties[] = [
                        'id'   => (string) $party->id,
                        'name' => $party->name
                    ];
                } else {
                    $parties[] = [
                        'id'   => (string) $party->id,
                        'name' => $party->firstName . ' ' . $party->lastName
                    ];
                }
            }
            wp_send_json_success($parties, 200);
        } else {
            wp_send_json_error(__('Parties fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCRMMilestones($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->apiEndpoint . '/milestones';
        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (!empty($response->milestones)) {
            foreach ($response->milestones as $milestone) {
                $milestones[] = [
                    'id'   => (string) $milestone->id,
                    'name' => $milestone->name
                ];
            }
            wp_send_json_success($milestones, 200);
        } else {
            wp_send_json_error(__('Milestones fetching failed', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authToken = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($authToken) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Capsule CRM'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $capsulecrmApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($capsulecrmApiResponse)) {
            return $capsulecrmApiResponse;
        }

        return $capsulecrmApiResponse;
    }
}
