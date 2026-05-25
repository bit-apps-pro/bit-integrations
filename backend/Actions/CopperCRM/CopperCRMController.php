<?php

/**
 * CopperCRM Integration
 */

namespace BitApps\Integrations\Actions\CopperCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for CopperCRM integration
 */
class CopperCRMController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'coppercrm',
        'fields'   => [
            'api_key'   => 'value',
            'api_email' => 'api_email',
        ],
    ];

    protected $_defaultHeader;

    protected $apiEndpoint;

    public function __construct()
    {
        $this->apiEndpoint = 'https://api.copper.com/developer_api/v1';
    }

    public function getCustomFields($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $action = $fieldsRequestParams->action;
        $apiEmail = $fieldsRequestParams->api_email;
        // if ($action == 'person' || $action == 'company') {
        //     $apiEndpoint = $this->apiEndpoint."/peoples/fields/definitions";
        // } elseif ($action == 'opportunity') {
        //     $apiEndpoint = $this->apiEndpoint."/opportunities/fields/definitions";
        // } elseif ($action == 'task') {
        //     $apiEndpoint = $this->apiEndpoint."/kases/fields/definitions";
        // }

        $apiEndpoint = $this->apiEndpoint . '/custom_field_definitions';
        $headers = [
            'X-PW-AccessToken' => $apiKey,
            'X-PW-Application' => 'developer_api',
            'X-PW-UserEmail'   => $apiEmail,
            'Content-Type'     => 'application/json'
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);
        if (isset($response)) {
            foreach ($response as $customField) {
                if (\in_array($action, $customField->available_on)) {
                    $customFields[] = [
                        'key'   => $customField->id,
                        'label' => $customField->name,
                    ];
                }
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
        $apiEmail = $fieldsRequestParams->api_email;
        $apiEndpoint = $this->apiEndpoint . '/users';
        $headers = [
            'X-PW-AccessToken' => $apiKey,
            'X-PW-Application' => 'developer_api',
            'X-PW-UserEmail'   => $apiEmail,
            'Content-Type'     => 'application/json'
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response)) {
            foreach ($response as $owner) {
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

    public function getAllCompanies($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
        $apiKey = $fieldsRequestParams->api_key;
        $apiEmail = $fieldsRequestParams->api_email;
        $apiEndpoint = $this->apiEndpoint . '/companies/search';
        $headers = [
            'X-PW-AccessToken' => $apiKey,
            'X-PW-Application' => 'developer_api',
            'X-PW-UserEmail'   => $apiEmail,
            'Content-Type'     => 'application/json'
        ];

        $response = HttpHelper::post($apiEndpoint, null, $headers);

        if (isset($response)) {
            foreach ($response as $company) {
                $companies[] = [
                    'id'   => (string) $company->id,
                    'name' => $company->name
                ];
            }
            wp_send_json_success($companies, 200);
        } else {
            wp_send_json_error(__('Companies fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllTags($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
        $apiKey = $fieldsRequestParams->api_key;
        $apiEmail = $fieldsRequestParams->api_email;
        $apiEndpoint = $this->apiEndpoint . '/tags';
        $headers = [
            'X-PW-AccessToken' => $apiKey,
            'X-PW-Application' => 'developer_api',
            'X-PW-UserEmail'   => $apiEmail,
            'Content-Type'     => 'application/json'
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->error)) {
            wp_send_json_error($response->error ?? __('Unknown error', 'bit-integrations'), 400);
        }

        wp_send_json_success(array_column((array) $response, 'name'), 200);
    }

    public function getAllPipelineStages($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEmail = $fieldsRequestParams->api_email;
        $apiEndpoint = $this->apiEndpoint . '/pipeline_stages';
        $headers = [
            'X-PW-AccessToken' => $apiKey,
            'X-PW-Application' => 'developer_api',
            'X-PW-UserEmail'   => $apiEmail,
            'Content-Type'     => 'application/json'
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response)) {
            foreach ($response as $pipelineStage) {
                $pipelineStages[] = [
                    'id'   => (string) $pipelineStage->id,
                    'name' => $pipelineStage->name
                ];
            }
            wp_send_json_success($pipelineStages, 200);
        } else {
            wp_send_json_error(__('PipelineStages fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCRMPeoples($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEmail = $fieldsRequestParams->api_email;
        $apiEndpoint = $this->apiEndpoint . '/people/search';
        $headers = [
            'X-PW-AccessToken' => $apiKey,
            'X-PW-Application' => 'developer_api',
            'X-PW-UserEmail'   => $apiEmail,
            'Content-Type'     => 'application/json'
        ];

        $response = HttpHelper::post($apiEndpoint, null, $headers);

        if (!empty($response)) {
            foreach ($response as $people) {
                $peoples[] = [
                    'id'   => (string) $people->id,
                    'name' => $people->name
                ];
            }
            wp_send_json_success($peoples, 200);
        } else {
            wp_send_json_error(__('Peoples fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCRMPipelines($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEmail = $fieldsRequestParams->api_email;
        $apiEndpoint = $this->apiEndpoint . '/pipelines';
        $headers = [
            'X-PW-AccessToken' => $apiKey,
            'X-PW-Application' => 'developer_api',
            'X-PW-UserEmail'   => $apiEmail,
            'Content-Type'     => 'application/json'
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (!empty($response)) {
            foreach ($response as $pipeline) {
                $pipelines[] = [
                    'id'   => (string) $pipeline->id,
                    'name' => $pipeline->name
                ];
            }
            wp_send_json_success($pipelines, 200);
        } else {
            wp_send_json_error(__('Pipelines fetching failed', 'bit-integrations'), 400);
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
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Copper CRM'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $coppercrmApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($coppercrmApiResponse)) {
            return $coppercrmApiResponse;
        }

        return $coppercrmApiResponse;
    }
}
