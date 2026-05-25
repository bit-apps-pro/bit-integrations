<?php

/**
 * Livestorm Integration
 */

namespace BitApps\Integrations\Actions\Livestorm;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Livestorm integration
 */
class LivestormController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'livestorm',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    protected $_defaultHeader;

    protected $_apiEndpoint;

    public function __construct()
    {
        $this->_apiEndpoint = 'https://api.livestorm.co/v1';
    }

    public function getAllEvents($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->api_key);
        $apiEndpoint = $this->_apiEndpoint . '/events';
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);

        if (isset($response->data)) {
            $data = [
                'events'    => [],
                'allFields' => [],
            ];

            foreach ($response->data as $event) {
                $data['events'][]
                = (object) [
                    'id'   => $event->id,
                    'name' => $event->attributes->title
                ]
                ;
                foreach ($event->attributes->fields as $field) {
                    $data['allFields'][]
                    = (object) [
                        'eventId'  => $event->id,
                        'key'      => $field->id,
                        'label'    => ucwords(str_replace('_', ' ', $field->id)),
                        'required' => $field->required
                    ]
                    ;
                }
            }

            wp_send_json_success($data, 200);
        } else {
            wp_send_json_error(__('Events fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllSessions($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams, $fieldsRequestParams->event_id);
        $this->setHeaders($fieldsRequestParams->api_key);
        $apiEndpoint = $this->_apiEndpoint . "/events/{$fieldsRequestParams->event_id}/sessions";
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);

        if (isset($response->data)) {
            $sessions = [];
            foreach ($response->data as $session) {
                $sessions[]
                = (object) [
                    'id'       => $session->id,
                    'datetime' => gmdate('l, F jS Y h:i:s A (T)', $session->attributes->estimated_started_at)
                ]
                ;
            }
            wp_send_json_success($sessions, 200);
        } else {
            wp_send_json_error(__('Session fetching failed', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap) || empty($apiKey)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Livestorm'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $apiKey);
        $livestormApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($livestormApiResponse)) {
            return $livestormApiResponse;
        }

        return $livestormApiResponse;
    }

    private function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->api_key) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($apiKey)
    {
        $this->_defaultHeader = [
            'Authorization' => $apiKey,
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json'
        ];
    }
}
