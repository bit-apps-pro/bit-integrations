<?php

namespace BitApps\Integrations\Actions\SuiteDash;

use BitApps\Integrations\Core\Util\HttpHelper;

class SuiteDashHelper
{
    protected $_defaultHeader;

    protected $_apiEndpoint;

    public function __construct()
    {
        $this->_apiEndpoint = 'https://app.suitedash.com/secure-api';
    }

    public function getAllFields($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->public_id, $fieldsRequestParams->secret_key);
        $apiEndpoint = $this->_apiEndpoint . '/contact/meta';
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);

        if (isset($response->success) && $response->success === false) {
            wp_send_json_error(__('Fields fetching failed', 'bit-integrations'), 400);
        } else {
            $fieldMap = [];
            $fieldNames = ['uid', 'name_prefix', 'active', 'role', 'tags', 'created', 'company', 'companies'];
            foreach ($response as $key => $field) {
                if (array_search($key, $fieldNames) === false && $key !== 'custom_fields' && $key !== 'address') {
                    $fieldMap[]
                    = [
                        'key'      => $key,
                        'label'    => $field->field_name,
                        'required' => $field->required
                    ]
                    ;
                } elseif (array_search($key, $fieldNames) === false && $key === 'address') {
                    foreach ($field->properties as $addressFKey => $addressField) {
                        $fieldMap[]
                        = [
                            'key'      => "address-{$addressFKey}",
                            'label'    => $addressField->field_name,
                            'required' => $addressField->required
                        ]
                        ;
                    }
                } elseif (array_search($key, $fieldNames) === false && $key === 'custom_fields') {
                    foreach ($field->properties as $customFKey => $customField) {
                        $fieldMap[]
                        = [
                            'key'      => "custom-{$customFKey}",
                            'label'    => $customField->field_name,
                            'required' => $customField->required
                        ]
                        ;
                    }
                }
            }

            wp_send_json_success($fieldMap, 200);
        }
    }

    public function getAllCompanies($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->public_id, $fieldsRequestParams->secret_key);
        $apiEndpoint = $this->_apiEndpoint . '/companies';
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);

        if (isset($response->success) && $response->success) {
            $companies = [];
            foreach ($response->data as $company) {
                $companies[]
                = $company->name
                ;
            }
            wp_send_json_success($companies, 200);
        } else {
            wp_send_json_error(__('Tags fetching failed', 'bit-integrations'), 400);
        }
    }

    private function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->public_id) || empty($fieldsRequestParams->secret_key) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($publicId, $secretKey)
    {
        $this->_defaultHeader = [
            'accept'       => 'application/json',
            'X-Public-ID'  => $publicId,
            'X-Secret-Key' => $secretKey
        ];
    }
}
