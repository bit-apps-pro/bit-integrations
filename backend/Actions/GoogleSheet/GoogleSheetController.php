<?php

/**
 * ZohoSheet Integration
 */

namespace BitApps\Integrations\Actions\GoogleSheet;

if (! defined('ABSPATH')) {
    exit;
}
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;
use WP_Error;

/**
 * Provide functionality for ZohoCrm integration
 */
class GoogleSheetController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'googlesheet',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at']],
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    /**
     * Helps to register ajax function's with wp
     *
     * @return null
     */
    public static function registerAjax()
    {
        add_action('wp_ajax_gsheet_refresh_spreadsheets', [__CLASS__, 'refreshSpreadsheetsAjaxHelper']);
        add_action('wp_ajax_gsheet_refresh_worksheets', [__CLASS__, 'refreshWorksheetsAjaxHelper']);
        add_action('wp_ajax_gsheet_refresh_worksheet_headers', [__CLASS__, 'refreshWorksheetHeadersAjaxHelper']);
        add_action('wp_ajax_gsheet_get_credentials', [__CLASS__, 'getCredentials']);
    }

    /**
     * Process ajax request for generate_token
     *
     * @param object $requestsParams
     *
     * @return JSON zoho crm api response and status
     */
    public static function generateTokens($requestsParams)
    {
        if (empty($requestsParams->clientId)
            || empty($requestsParams->clientSecret)
            || empty($requestsParams->redirectURI)
            || empty($requestsParams->code)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoint = 'https://oauth2.googleapis.com/token';
        $authorizationHeader['Content-Type'] = 'application/x-www-form-urlencoded';
        $requestParams = [
            'grant_type'    => 'authorization_code',
            'client_id'     => $requestsParams->clientId,
            'client_secret' => $requestsParams->clientSecret,
            'redirect_uri'  => urldecode($requestsParams->redirectURI),
            'code'          => urldecode($requestsParams->code)
        ];

        $apiResponse = HttpHelper::post($apiEndpoint, $requestParams, $authorizationHeader);

        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            wp_send_json_error(
                empty($apiResponse->error) ? 'Unknown' : $apiResponse->error,
                400
            );
        }
        $apiResponse->generates_on = time();
        wp_send_json_success($apiResponse, 200);
    }

    /**
     * Process ajax request for refresh crm modules
     *
     * @param object $queryParams Request Params
     *
     * @return JSON crm module data
     */
    public static function refreshSpreadsheetsAjaxHelper($queryParams)
    {
        $queryParams->tokenDetails = self::normalizeConnectionToken($queryParams->tokenDetails ?? null);
        $isConnectionAuth = !empty($queryParams->connection_id);

        if (empty($queryParams->tokenDetails->access_token)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $spreadSheets = "https://www.googleapis.com/drive/v3/files?q=mimeType%20%3D%20'application%2Fvnd.google-apps.spreadsheet'";
        $response = [];
        if (!$isConnectionAuth && (\intval($queryParams->tokenDetails->generates_on) + (55 * 60)) < time()) {
            $response['tokenDetails'] = GoogleSheetController::refreshAccessToken($queryParams);
            if ($response['tokenDetails'] && !empty($response['tokenDetails']->access_token)) {
                $authorizationHeader['Authorization'] = 'Bearer ' . $response['tokenDetails']->access_token;
            }
        }
        if (empty($authorizationHeader['Authorization'])) {
            $authorizationHeader['Authorization'] = "Bearer {$queryParams->tokenDetails->access_token}";
        }

        $spreadSheetResponse = HttpHelper::get($spreadSheets, null, $authorizationHeader);
        $allSpreadsheet = [];
        if (!is_wp_error($spreadSheetResponse) && empty($spreadSheetResponse->response->error)) {
            $spreadsheets = $spreadSheetResponse->files;
            foreach ($spreadsheets as $spreadsheet) {
                $allSpreadsheet[$spreadsheet->name] = (object) [
                    'spreadsheetId'   => $spreadsheet->id,
                    'spreadsheetName' => $spreadsheet->name
                ];
            }
            uksort($allSpreadsheet, 'strnatcasecmp');
            $response['spreadsheets'] = $allSpreadsheet;
        } else {
            wp_send_json_error(
                $spreadSheetResponse->response->error->message,
                400
            );
        }
        if (!$isConnectionAuth && !empty($response['tokenDetails']) && !empty($queryParams->id)) {
            GoogleSheetController::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request for refesh crm layouts
     *
     * @param object $queryParams Request Params
     *
     * @return JSON crm layout data
     */
    public static function refreshWorksheetsAjaxHelper($queryParams)
    {
        $queryParams->tokenDetails = self::normalizeConnectionToken($queryParams->tokenDetails ?? null);
        $isConnectionAuth = !empty($queryParams->connection_id);

        if (empty($queryParams->tokenDetails->access_token)
            || empty($queryParams->spreadsheetId)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $response = [];
        if (!$isConnectionAuth && (\intval($queryParams->tokenDetails->generates_on) + (55 * 60)) < time()) {
            $response['tokenDetails'] = GoogleSheetController::refreshAccessToken($queryParams);
            if ($response['tokenDetails'] && !empty($response['tokenDetails']->access_token)) {
                $queryParams->tokenDetails = $response['tokenDetails'];
            }
        }

        $worksheetsMetaApiEndpoint = "https://sheets.googleapis.com/v4/spreadsheets/{$queryParams->spreadsheetId}?&fields=sheets.properties";

        $authorizationHeader['Authorization'] = "Bearer {$queryParams->tokenDetails->access_token}";
        $worksheetsMetaResponse = HttpHelper::get($worksheetsMetaApiEndpoint, null, $authorizationHeader);

        if (!is_wp_error($worksheetsMetaResponse)) {
            $worksheets = $worksheetsMetaResponse->sheets;
            $response['worksheets'] = $worksheets;
            // wp_send_json_success($response, 200);
        } else {
            wp_send_json_error(
                $worksheetsMetaResponse->status === 'error' ? $worksheetsMetaResponse->message : 'Unknown',
                400
            );
        }
        if (!$isConnectionAuth && !empty($response['tokenDetails']) && !empty($queryParams->id)) {
            $response['queryWorkbook'] = $queryParams->workbook;
            GoogleSheetController::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request for refesh crm layouts
     *
     * @param object $queryParams Request Params
     *
     * @return JSON crm layout data
     */
    public static function refreshWorksheetHeadersAjaxHelper($queryParams)
    {
        $queryParams->tokenDetails = self::normalizeConnectionToken($queryParams->tokenDetails ?? null);
        $isConnectionAuth = !empty($queryParams->connection_id);

        if (empty($queryParams->worksheetName)
            || empty($queryParams->tokenDetails->access_token)
            || empty($queryParams->header)
            || empty($queryParams->headerRow)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $response = [];
        if (!$isConnectionAuth && (\intval($queryParams->tokenDetails->generates_on) + (55 * 60)) < time()) {
            $response['tokenDetails'] = GoogleSheetController::refreshAccessToken($queryParams);
            if ($response['tokenDetails'] && !empty($response['tokenDetails']->access_token)) {
                $queryParams->tokenDetails = $response['tokenDetails'];
            }
        }
        $headerRow = $queryParams->headerRow;
        if ($queryParams->header === 'ROWS') {
            $rangeNumber = preg_replace('/[^0-9]/', '', $headerRow);
            $range = "{$headerRow}:ZZ{$rangeNumber}";
        } else {
            $columnLetter = preg_replace('/\d/', '', $headerRow);
            $range = "{$headerRow}:{$columnLetter}1005";
        }

        $worksheetHeadersMetaApiEndpoint = "https://sheets.googleapis.com/v4/spreadsheets/{$queryParams->spreadsheetId}/values/{$queryParams->worksheetName}!{$range}?majorDimension={$queryParams->header}";

        $authorizationHeader['Authorization'] = "Bearer {$queryParams->tokenDetails->access_token}";
        $worksheetHeadersMetaResponse = HttpHelper::get($worksheetHeadersMetaApiEndpoint, null, $authorizationHeader);

        if (is_wp_error($worksheetHeadersMetaResponse)) {
            wp_send_json_error(
                $worksheetHeadersMetaResponse->status === 'error' ? $worksheetHeadersMetaResponse->message : 'Unknown',
                400
            );
        }

        $response['worksheet_headers'] = [];
        $allHeaders = empty($worksheetHeadersMetaResponse->values[0]) ? [] : $worksheetHeadersMetaResponse->values[0];

        foreach ($allHeaders as $key => $header) {
            $response['worksheet_headers'][] = "{$header}_{$key}";
        }

        if (!$isConnectionAuth && !empty($response['tokenDetails']) && !empty($queryParams->id)) {
            $response['queryModule'] = $queryParams->module;
            GoogleSheetController::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }

        wp_send_json_success($response, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;

        //    wp_send_json_success($integrationDetails);

        $tokenDetails = self::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);
        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $spreadsheetId = $integrationDetails->spreadsheetId;
        $worksheetName = $integrationDetails->worksheetName;
        $headerRow = $integrationDetails->headerRow;
        $header = $integrationDetails->header;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $defaultDataConf = $integrationDetails->default;
        // wp_send_json_success($fieldMap);
        if (empty($tokenDetails)
            || empty($spreadsheetId)
            || empty($worksheetName)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Google sheet'));
        }

        if (!$isConnectionAuth && (\intval($tokenDetails->generates_on) + (55 * 60)) < time()) {
            $requiredParams['clientId'] = $integrationDetails->clientId;
            $requiredParams['clientSecret'] = $integrationDetails->clientSecret;
            $requiredParams['tokenDetails'] = $tokenDetails;
            $newTokenDetails = GoogleSheetController::refreshAccessToken((object) $requiredParams);
            if ($newTokenDetails) {
                GoogleSheetController::saveRefreshedToken($this->_integrationID, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
            }
        }

        // $actions = $integrationDetails->actions;
        $recordApiHelper = new RecordApiHelper($tokenDetails, $this->_integrationID);

        $gsheetApiResponse = $recordApiHelper->execute(
            $spreadsheetId,
            $worksheetName,
            $headerRow,
            $header,
            $actions,
            $defaultDataConf,
            $fieldValues,
            $fieldMap
        );

        if (is_wp_error($gsheetApiResponse)) {
            return $gsheetApiResponse;
        }

        return $gsheetApiResponse;
    }

    /**
     * Helps to refresh zoho crm access_token
     *
     * @param array $apiData Contains required data for refresh access token
     *
     * @return JSON $tokenDetails API token details
     */
    protected static function refreshAccessToken($apiData)
    {
        if (empty($apiData->clientId)
            || empty($apiData->clientSecret)
            || empty($apiData->tokenDetails)
        ) {
            return false;
        }
        $tokenDetails = $apiData->tokenDetails;

        $apiEndpoint = 'https://oauth2.googleapis.com/token';
        $requestParams = [
            'grant_type'    => 'refresh_token',
            'client_id'     => $apiData->clientId,
            'client_secret' => $apiData->clientSecret,
            'refresh_token' => $tokenDetails->refresh_token,
        ];

        $apiResponse = HttpHelper::post($apiEndpoint, $requestParams);
        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }
        $tokenDetails->generates_on = time();
        $tokenDetails->generated_at = $tokenDetails->generates_on;
        $tokenDetails->access_token = $apiResponse->access_token;

        return $tokenDetails;
    }

    /**
     * Save updated access_token to avoid unnecessary token generation
     *
     * @param int        $integrationID ID of Google Sheet Integration
     * @param Obeject    $tokenDetails  refreshed token info
     * @param null|mixed $others
     *
     * @return null
     */
    protected static function saveRefreshedToken($integrationID, $tokenDetails, $others = null)
    {
        if (empty($integrationID)) {
            return;
        }

        $flow = new FlowController();
        $gsheetDetails = $flow->get(['id' => $integrationID]);

        if (is_wp_error($gsheetDetails)) {
            return;
        }
        $newDetails = json_decode($gsheetDetails[0]->flow_details);

        $newDetails->tokenDetails = $tokenDetails;
        if (!empty($others['spreadsheets'])) {
            $newDetails->default->workbooks = $others['spreadsheets'];
        }
        if (!empty($others['worksheets'])) {
            $newDetails->default->worksheets = $others['worksheets'];
        }
        if (!empty($others['worksheet_headers'])) {
            $newDetails->default->worksheets->headers->{$others['worksheet']} = $others['worksheet_headers'];
        }

        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }

    private static function normalizeConnectionToken($token)
    {
        if (!\is_object($token)) {
            $token = (object) [];
        }

        if (empty($token->generates_on) && !empty($token->generated_at)) {
            $token->generates_on = (int) $token->generated_at;
        }

        return $token;
    }
}
