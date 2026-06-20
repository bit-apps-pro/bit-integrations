<?php

/**
 * Vimeo Record Api
 */

namespace BitApps\Integrations\Actions\Vimeo;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Vimeo write actions.
 * Free maps the form fields and delegates every action to Pro, which builds
 * the Vimeo request body and performs the API call.
 */
class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    private $_baseUrl;

    private $_defaultHeader;

    public function __construct($token, $integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->_baseUrl = VimeoController::BASE_URL;
        $this->_defaultHeader = VimeoController::authHeader($token);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->vimeoFormField;

            if (empty($actionValue)) {
                continue;
            }

            if ($triggerValue === 'custom' && isset($value->customValue)) {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (isset($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($integrationDetails, $fieldValues, $fieldMap, $action)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $videoId = $integrationDetails->videoId ?? '';
        $showcaseId = $integrationDetails->showcaseId ?? '';
        $folderId = $integrationDetails->folderId ?? '';
        $channelId = $integrationDetails->channelId ?? '';
        $privacy = $integrationDetails->privacy ?? '';
        $trackType = $integrationDetails->trackType ?? '';

        switch ($action) {
            case 'upload_video':
                $apiResponse = Hooks::apply(Config::withPrefix('vimeo_upload_video'), false, $finalData, $privacy, $this->_baseUrl, $this->_defaultHeader);

                break;

            case 'edit_video':
                $apiResponse = Hooks::apply(Config::withPrefix('vimeo_edit_video'), false, $videoId, $finalData, $privacy, $this->_baseUrl, $this->_defaultHeader);

                break;

            case 'delete_video':
                $apiResponse = Hooks::apply(Config::withPrefix('vimeo_delete_video'), false, $videoId, $this->_baseUrl, $this->_defaultHeader);

                break;

            case 'add_comment':
                $apiResponse = Hooks::apply(Config::withPrefix('vimeo_add_comment'), false, $videoId, $finalData, $this->_baseUrl, $this->_defaultHeader);

                break;

            case 'create_showcase':
                $apiResponse = Hooks::apply(Config::withPrefix('vimeo_create_showcase'), false, $finalData, $this->_baseUrl, $this->_defaultHeader);

                break;

            case 'add_video_to_showcase':
                $apiResponse = Hooks::apply(Config::withPrefix('vimeo_add_video_to_showcase'), false, $showcaseId, $videoId, $this->_baseUrl, $this->_defaultHeader);

                break;

            case 'create_folder':
                $apiResponse = Hooks::apply(Config::withPrefix('vimeo_create_folder'), false, $finalData, $this->_baseUrl, $this->_defaultHeader);

                break;

            case 'add_video_to_folder':
                $apiResponse = Hooks::apply(Config::withPrefix('vimeo_add_video_to_folder'), false, $folderId, $videoId, $this->_baseUrl, $this->_defaultHeader);

                break;

            case 'add_video_to_channel':
                $apiResponse = Hooks::apply(Config::withPrefix('vimeo_add_video_to_channel'), false, $channelId, $videoId, $this->_baseUrl, $this->_defaultHeader);

                break;

            case 'like_video':
                $apiResponse = Hooks::apply(Config::withPrefix('vimeo_like_video'), false, $videoId, $this->_baseUrl, $this->_defaultHeader);

                break;

            case 'add_to_watch_later':
                $apiResponse = Hooks::apply(Config::withPrefix('vimeo_add_to_watch_later'), false, $videoId, $this->_baseUrl, $this->_defaultHeader);

                break;

            case 'upload_text_track':
                $apiResponse = Hooks::apply(Config::withPrefix('vimeo_upload_text_track'), false, $videoId, $finalData, $trackType, $this->_baseUrl, $this->_defaultHeader);

                break;

            default:
                $apiResponse = (object) ['success' => false, 'message' => __('Unknown Vimeo action', 'bit-integrations'), 'code' => 400];

                break;
        }

        // No Pro filter ran -> apply_filters returned the false default.
        $apiResponse = $apiResponse ? $apiResponse : (object) ['success' => false, 'message' => __('Bit Integrations Pro is required.', 'bit-integrations'), 'code' => 400];

        // Pro-required / error objects carry success === false; never log those as success
        // even if a prior request in the same worker left a stale 2xx response code.
        $proMissing = \is_object($apiResponse)
            && isset($apiResponse->success) && $apiResponse->success === false
            && isset($apiResponse->code) && (int) $apiResponse->code >= 400;

        $statusCode = (int) HttpHelper::$responseCode;
        $isSuccess = !$proMissing && ($apiResponse === true || isset($apiResponse->uri) || ($statusCode >= 200 && $statusCode < 300));

        LogHandler::save(
            $this->_integrationID,
            wp_json_encode(['type' => 'video', 'type_name' => $action]),
            $isSuccess ? 'success' : 'error',
            wp_json_encode($apiResponse)
        );

        return $apiResponse;
    }
}
