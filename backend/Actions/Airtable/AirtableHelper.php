<?php

namespace BitApps\Integrations\Actions\Airtable;

use BitApps\Integrations\Core\Util\HttpHelper;

class AirtableHelper
{
    protected $_defaultHeader;

    public function fetchAllBases($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->auth_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->auth_token;
        $apiEndpoint = 'https://api.airtable.com/v0/meta/bases';
        $header = [
            'Authorization' => "Bearer {$apiKey}"
        ];

        $response = HttpHelper::get($apiEndpoint, null, $header);

        if (isset($response->bases)) {
            $bases = [];
            foreach ($response->bases as $base) {
                if ($base->permissionLevel === 'create') {
                    $bases[] = [
                        'id'   => $base->id,
                        'name' => $base->name
                    ];
                }
            }
            wp_send_json_success($bases, 200);
        } else {
            wp_send_json_error(__('Authentication failed', 'bit-integrations'), 400);
        }
    }

    public function getAllTables($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->auth_token) || empty($fieldsRequestParams->baseId)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->auth_token;
        $baseId = $fieldsRequestParams->baseId;
        $apiEndpoint = "https://api.airtable.com/v0/meta/bases/{$baseId}/tables/";
        $header = [
            'Authorization' => "Bearer {$apiKey}"
        ];

        $response = HttpHelper::get($apiEndpoint, null, $header);

        if (isset($response->tables)) {
            $tables = [];
            foreach ($response->tables as $table) {
                $tables[] = [
                    'id'   => $table->id,
                    'name' => $table->name,
                ];
            }
            wp_send_json_success($tables, 200);
        } else {
            wp_send_json_error(__('Tables fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllFields($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->auth_token) || empty($fieldsRequestParams->baseId) || empty($fieldsRequestParams->tableId)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->auth_token;
        $baseId = $fieldsRequestParams->baseId;
        $tableId = $fieldsRequestParams->tableId;
        $apiEndpoint = "https://api.airtable.com/v0/meta/bases/{$baseId}/tables/";
        $header = [
            'Authorization' => "Bearer {$apiKey}"
        ];

        $response = HttpHelper::get($apiEndpoint, null, $header);
        $acceptedTypes = ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelects', 'multipleAttachments', 'date', 'phoneNumber', 'email', 'url', 'number', 'currency', 'percent', 'duration', 'rating', 'barcode'];

        if (isset($response->tables)) {
            $fields = [];
            foreach ($response->tables as $table) {
                if ($table->id === $tableId) {
                    foreach ($table->fields as $field) {
                        if (\in_array($field->type, $acceptedTypes)) {
                            $fields[] = [
                                'key'      => $field->id . '{btcbi}' . $field->type,
                                'label'    => $field->name,
                                'required' => false
                            ];
                        }
                    }
                }
            }
            wp_send_json_success($fields, 200);
        } else {
            wp_send_json_error(__('Table fields fetching failed', 'bit-integrations'), 400);
        }
    }
}
