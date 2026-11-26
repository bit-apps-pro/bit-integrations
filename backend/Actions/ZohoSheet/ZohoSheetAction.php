<?php

namespace BitApps\Integrations\Actions\ZohoSheet;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Flow\FlowController;
use WP_Error;

class ZohoSheetAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'zohosheet',
        'fields'   => [
            'dataCenter'   => 'dataCenter',
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at', 'generates_on']],
        ],
    ];

    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $tokenDetails = ZohoSheetHelper::tokenExpiryCheck($integrationDetails->tokenDetails, $integrationDetails->clientId, $integrationDetails->clientSecret, $integrationDetails->dataCenter);
        if ($tokenDetails->access_token !== $integrationDetails->tokenDetails->access_token) {
            $this->saveRefreshedToken($this->integrationID, $tokenDetails);
        }

        if (empty($fieldMap) || empty($tokenDetails)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Field map, token details are required for ZohoSheet api', 'bit-integrations'));
        }

        $recordApiHelper = new ZohoSheetService($integrationDetails, $integId, $tokenDetails->access_token);
        $zohoSheetApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($zohoSheetApiResponse)) {
            return $zohoSheetApiResponse;
        }

        return $zohoSheetApiResponse;
    }

    protected function saveRefreshedToken($integrationID, $tokenDetails)
    {
        if (empty($integrationID)) {
            return;
        }

        $flow = new FlowController();
        $zohoSheetDetails = $flow->get(['id' => $integrationID]);
        if (is_wp_error($zohoSheetDetails)) {
            return;
        }

        $newDetails = json_decode($zohoSheetDetails[0]->flow_details);
        $newDetails->tokenDetails = $tokenDetails;
        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }
}
