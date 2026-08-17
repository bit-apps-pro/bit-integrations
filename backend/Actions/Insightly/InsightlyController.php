<?php

/**
 * Insightly Integration
 */

namespace BitApps\Integrations\Actions\Insightly;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Insightly integration
 */
class InsightlyController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'insightly',
        'fields'   => [
            'api_key' => 'username',
            'api_url' => 'api_url',
        ],
    ];

    protected $_defaultHeader;

    public function getAllOrganisations($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key) || empty($fieldsRequestParams->api_url)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiUrl = $fieldsRequestParams->api_url;
        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = 'https://api.' . $apiUrl . '/v3.1/Organisations';
        $headers = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:"),
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);
        if (!empty($response)) {
            foreach ($response as $organisation) {
                $organisations[] = [
                    'id'   => (string) $organisation->ORGANISATION_ID,
                    'name' => $organisation->ORGANISATION_NAME
                ];
            }
            wp_send_json_success($organisations, 200);
        } else {
            wp_send_json_error(__('Owners fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCategories($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key) || empty($fieldsRequestParams->api_url)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiUrl = $fieldsRequestParams->api_url;
        $apiKey = $fieldsRequestParams->api_key;

        if ($fieldsRequestParams->action_name == 'opportunity') {
            $apiEndpoint = 'https://api.' . $apiUrl . '/v3.1/OpportunityCategories';
        } elseif ($fieldsRequestParams->action_name == 'project') {
            $apiEndpoint = 'https://api.' . $apiUrl . '/v3.1/ProjectCategories';
        } elseif ($fieldsRequestParams->action_name == 'task') {
            $apiEndpoint = 'https://api.' . $apiUrl . '/v3.1/TaskCategories';
        }

        $headers = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:"),
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);
        if (!empty($response)) {
            foreach ($response as $category) {
                $categories[] = [
                    'id'   => (string) $category->CATEGORY_ID,
                    'name' => $category->CATEGORY_NAME
                ];
            }
            wp_send_json_success($categories, 200);
        } else {
            wp_send_json_error('Categories fetching failed', 400);
        }
    }

    public function getAllStatuses($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key) || empty($fieldsRequestParams->api_url)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiUrl = $fieldsRequestParams->api_url;
        $apiEndpoint = "https://my.insightly.app/api/v1/crm-statuses?api_token={$apiKey}";
        $header = [
            'Brand' => $apiUrl
        ];

        $response = HttpHelper::get($apiEndpoint, null, $header);

        if (!empty($response->data)) {
            foreach ($response->data as $status) {
                $statuses[] = [
                    'id'   => (string) $status->id,
                    'name' => $status->type
                ];
            }
            wp_send_json_success($statuses, 200);
        } else {
            wp_send_json_error(__('Owners fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getLeadStatuses($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key) || empty($fieldsRequestParams->api_url)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiUrl = $fieldsRequestParams->api_url;
        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = 'https://api.' . $apiUrl . '/v3.1/LeadStatuses';
        $headers = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:"),
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);
        if (!empty($response)) {
            foreach ($response as $leadStatus) {
                $leadStatuses[] = [
                    'id'   => (string) $leadStatus->LEAD_STATUS_ID,
                    'name' => $leadStatus->LEAD_STATUS
                ];
            }
            wp_send_json_success($leadStatuses, 200);
        } else {
            wp_send_json_error(__('Lead Status fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getLeadSources($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key) || empty($fieldsRequestParams->api_url)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiUrl = $fieldsRequestParams->api_url;
        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = 'https://api.' . $apiUrl . '/v3.1/LeadSources';
        $headers = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:"),
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);
        if (!empty($response)) {
            foreach ($response as $leadSource) {
                $leadSources[] = [
                    'id'   => (string) $leadSource->LEAD_SOURCE_ID,
                    'name' => $leadSource->LEAD_SOURCE
                ];
            }
            wp_send_json_success($leadSources, 200);
        } else {
            wp_send_json_error(__('Lead Status fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCRMPipelines($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key) || empty($fieldsRequestParams->api_url)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiUrl = $fieldsRequestParams->api_url;
        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = 'https://api.' . $apiUrl . '/v3.1/Pipelines';
        $headers = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:"),
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (!empty($response)) {
            foreach ($response as $pipeline) {
                if ($fieldsRequestParams->action_name == 'opportunity' && $pipeline->FOR_OPPORTUNITIES == true) {
                    $pipelines[] = [
                        'id'   => (string) $pipeline->PIPELINE_ID,
                        'name' => $pipeline->PIPELINE_NAME
                    ];
                }
                if ($fieldsRequestParams->action_name == 'project' && $pipeline->FOR_PROJECTS == true) {
                    $pipelines[] = [
                        'id'   => (string) $pipeline->PIPELINE_ID,
                        'name' => $pipeline->PIPELINE_NAME
                    ];
                }
            }
            wp_send_json_success($pipelines, 200);
        } else {
            wp_send_json_error(__('Pipelines fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCRMPipelineStages($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key) || empty($fieldsRequestParams->api_url)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiUrl = $fieldsRequestParams->api_url;
        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = 'https://api.' . $apiUrl . '/v3.1/PipelineStages';
        $headers = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:"),
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);
        if (!empty($response)) {
            foreach ($response as $pipelineStage) {
                $pipelineStages[] = [
                    'id'          => (string) $pipelineStage->STAGE_ID,
                    'pipeline_id' => (string) $pipelineStage->PIPELINE_ID,
                    'name'        => $pipelineStage->STAGE_NAME
                ];
            }
            wp_send_json_success($pipelineStages, 200);
        } else {
            wp_send_json_error(__('Pipeline stages fetching failed', 'bit-integrations'), 400);
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
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Insightly'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $insightlyApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($insightlyApiResponse)) {
            return $insightlyApiResponse;
        }

        return $insightlyApiResponse;
    }
}
