<?php

/**
 * Vimeo Record Api
 */

namespace BitApps\Integrations\Actions\Vimeo;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Vimeo write actions.
 * Free builds the authenticated request shape and delegates every action to Pro.
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
        $this->_integrationID      = $integId;
        $this->_baseUrl            = VimeoController::BASE_URL;
        $this->_defaultHeader      = VimeoController::authHeader($token);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue  = $value->vimeoFormField;

            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (isset($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($integrationDetails, $fieldValues, $fieldMap, $action)
    {
        $finalData  = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $videoId    = $integrationDetails->videoId ?? '';
        $showcaseId = $integrationDetails->showcaseId ?? '';
        $folderId   = $integrationDetails->folderId ?? '';
        $channelId  = $integrationDetails->channelId ?? '';
        $privacy    = $integrationDetails->privacy ?? '';
        $trackType  = $integrationDetails->trackType ?? '';

        $requiredIds = [
            'edit_video'            => ['Video' => $videoId],
            'delete_video'          => ['Video' => $videoId],
            'add_comment'           => ['Video' => $videoId],
            'add_video_to_showcase' => ['Showcase' => $showcaseId, 'Video' => $videoId],
            'add_video_to_folder'   => ['Folder' => $folderId, 'Video' => $videoId],
            'add_video_to_channel'  => ['Channel' => $channelId, 'Video' => $videoId],
            'like_video'            => ['Video' => $videoId],
            'add_to_watch_later'    => ['Video' => $videoId],
            'upload_text_track'     => ['Video' => $videoId],
        ];

        if (isset($requiredIds[$action])) {
            foreach ($requiredIds[$action] as $label => $value) {
                if (empty($value)) {
                    // translators: %s: the missing required field label
                    return (object) ['success' => false, 'message' => wp_sprintf(__('%s is required for this Vimeo action', 'bit-integrations'), $label), 'code' => 400];
                }
            }
        }

        switch ($action) {
            case 'upload_video':
                $body = ['upload' => ['approach' => 'pull', 'link' => $finalData['link'] ?? '']];
                if (isset($finalData['name']) && $finalData['name'] !== '') {
                    $body['name'] = $finalData['name'];
                }
                if (isset($finalData['description']) && $finalData['description'] !== '') {
                    $body['description'] = $finalData['description'];
                }
                if (!empty($privacy)) {
                    $body['privacy'] = ['view' => $privacy];
                }
                $apiResponse = $this->dispatch('vimeo_upload_video', [$body]);

                break;

            case 'edit_video':
                $body = [];
                if (isset($finalData['name']) && $finalData['name'] !== '') {
                    $body['name'] = $finalData['name'];
                }
                if (isset($finalData['description']) && $finalData['description'] !== '') {
                    $body['description'] = $finalData['description'];
                }
                if (!empty($privacy)) {
                    $body['privacy'] = ['view' => $privacy];
                }
                $apiResponse = $this->dispatch('vimeo_edit_video', [$videoId, $body]);

                break;

            case 'delete_video':
                $apiResponse = $this->dispatch('vimeo_delete_video', [$videoId]);

                break;

            case 'add_comment':
                $apiResponse = $this->dispatch('vimeo_add_comment', [$videoId, ['text' => $finalData['text'] ?? '']]);

                break;

            case 'create_showcase':
                $body = ['name' => $finalData['name'] ?? ''];
                if (isset($finalData['description']) && $finalData['description'] !== '') {
                    $body['description'] = $finalData['description'];
                }
                $apiResponse = $this->dispatch('vimeo_create_showcase', [$body]);

                break;

            case 'add_video_to_showcase':
                $apiResponse = $this->dispatch('vimeo_add_video_to_showcase', [$showcaseId, $videoId]);

                break;

            case 'create_folder':
                $apiResponse = $this->dispatch('vimeo_create_folder', [['name' => $finalData['name'] ?? '']]);

                break;

            case 'add_video_to_folder':
                $apiResponse = $this->dispatch('vimeo_add_video_to_folder', [$folderId, $videoId]);

                break;

            case 'add_video_to_channel':
                $apiResponse = $this->dispatch('vimeo_add_video_to_channel', [$channelId, $videoId]);

                break;

            case 'like_video':
                $apiResponse = $this->dispatch('vimeo_like_video', [$videoId]);

                break;

            case 'add_to_watch_later':
                $apiResponse = $this->dispatch('vimeo_add_to_watch_later', [$videoId]);

                break;

            case 'upload_text_track':
                $body = ['type' => $trackType ?: 'captions', 'language' => $finalData['language'] ?? ''];
                if (isset($finalData['name']) && $finalData['name'] !== '') {
                    $body['name'] = $finalData['name'];
                }
                $apiResponse = $this->dispatch('vimeo_upload_text_track', [$videoId, $body]);

                break;

            default:
                $apiResponse = (object) ['success' => false, 'message' => __('Unknown Vimeo action', 'bit-integrations'), 'code' => 400];

                break;
        }

        // The "Bit Integrations Pro is required" fallback (and id-validation error) carry
        // success === false; never treat those as success regardless of a stale response code.
        $proMissing = \is_object($apiResponse)
            && isset($apiResponse->success) && $apiResponse->success === false
            && isset($apiResponse->code) && (int) $apiResponse->code >= 400;

        $statusCode = (int) \BitApps\Integrations\Core\Util\HttpHelper::$responseCode;

        $isSuccess = !$proMissing
            && ($apiResponse === true || isset($apiResponse->uri) || ($statusCode >= 200 && $statusCode < 300));

        if ($isSuccess) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'video', 'type_name' => $action]), 'success', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'video', 'type_name' => $action]), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    /**
     * Delegate the action to Pro. Free never calls the Vimeo API itself.
     *
     * @param string $hook Action slug (without prefix)
     * @param array  $args Positional args after the default, before baseUrl + headers
     *
     * @return mixed
     */
    private function dispatch($hook, array $args)
    {
        $params   = array_merge([Config::withPrefix($hook), false], $args, [$this->_baseUrl, $this->_defaultHeader]);
        $response = Hooks::apply(...$params);

        return $response ? $response : (object) ['success' => false, 'message' => __('Bit Integrations Pro is required.', 'bit-integrations'), 'code' => 400];
    }
}
