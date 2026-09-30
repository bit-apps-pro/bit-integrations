<?php

/**
 * Notion Record Api
 */

namespace BitApps\Integrations\Actions\Notion;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $baseUrl = 'https://api.notion.com/v1/';

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function generateReqDataFromFieldMap($data, $field_map)
    {
        $dataFinal = [];

        foreach ($field_map as $key => $value) {
            $triggerValue = $value->formFields ?? null;
            $actionValue = $value->notionFormFields ?? null;

            if (empty($actionValue)) {
                continue;
            }

            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue ?? '', $data);
            } elseif (!\is_null($value->customValue ?? null)) {
                $dataFinal[$actionValue] = $value->customValue;
            } elseif (!\is_null($data[$triggerValue] ?? null)) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function response($status, $code, $type, $typeName, $apiResponse)
    {
        $res = ['success' => $code === 200 ? true : false, 'message' => $apiResponse, 'code' => $code];
        LogHandler::save($this->_integrationID, wp_json_encode(['type' => $type, 'type_name' => $typeName]), $status, wp_json_encode($res));

        return $res;
    }

    public function createItemInDatabase($databaseId, $tokenType, $accessToken, $data)
    {
        $apiEndpoints = "{$this->baseUrl}pages";
        $headers = [
            'Authorization'  => ucfirst($tokenType) . ' ' . $accessToken,
            'Content-Type'   => 'application/json',
            'Notion-Version' => '2022-06-28'
        ];
        $parent = [
            'type'        => 'database_id',
            'database_id' => $databaseId
        ];

        $body = [
            'parent'     => $parent,
            'properties' => $data
        ];

        return HttpHelper::post($apiEndpoints, wp_json_encode($body), $headers);
    }

    public function valueFormat($type, $value)
    {
        switch ($type) {
            case 'number':
                return is_numeric($value) ? $value + 0 : null;
            case 'date':
                return ['start' => Helper::formatToISO8601($value)];
            case 'checkbox':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'select':
                if (\is_array($value)) {
                    return ['name' => reset($value)];
                }

                return ['name' => $value];
            case 'multi_select':
                $data = [];
                foreach ((array) $value as $option) {
                    $data[] = ['name' => $option];
                }

                return $data;
            case 'status':
                return ['name' => $value];
            case 'files':
                $files = [];

                if (\is_array($value)) {
                    foreach ($value as $file) {
                        $files[] = self::setFile($file);
                    }
                } else {
                    $files[] = self::setFile($value);
                }

                return $files;
            default:
                return $value;
        }
    }

    public function execute(
        $databaseId,
        $accessToken,
        $tokenType,
        $notionFields,
        $fieldValues,
        $field_map
    ) {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $field_map);
        $result = [];

        foreach ($finalData as $formKey => $formValue) {
            foreach ($notionFields as $key => $value) {
                if ($value->label === $formKey) {
                    if ($value->key == 'rich_text' || $value->key == 'title') {
                        $result[$formKey] = [$value->key => [['text' => ['content' => $formValue]]]];
                    } else {
                        $result[$formKey] = [
                            $value->key => $this->valueFormat($value->key, $formValue)
                        ];
                    }
                }
            }
        }

        $apiResponse = $this->createItemInDatabase($databaseId, $tokenType, $accessToken, $result);
        if (is_wp_error($apiResponse) || (isset($apiResponse->object) && $apiResponse->object === 'error')) {
            $apiResponse = $this->response('error', 400, 'database', 'create item', $apiResponse);
        } else {
            $apiResponse = $this->response('success', 200, 'database', 'create item', $apiResponse);
        }

        return $apiResponse;
    }

    private static function setFile($file)
    {
        $dir = wp_upload_dir();

        return [
            'name'     => 'media',
            'type'     => 'external',
            'external' => [
                'url' => trim(str_replace($dir['basedir'], $dir['baseurl'], $file))
            ]
        ];
    }
}
