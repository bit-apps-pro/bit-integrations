<?php

/**
 * MondayCom Integration
 */

namespace BitApps\Integrations\Actions\MondayCom;

use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

class MondayComController
{
    private const API_URL = 'https://api.monday.com/v2';

    private const API_VERSION = '2023-10';

    public static function authentication($requestParams)
    {
        if (empty($requestParams->apiToken)) {
            wp_send_json_error(__('API Token is empty', 'bit-integrations'), 400);
        }

        $query = 'query { me { id name email } }';
        $response = self::request($requestParams->apiToken, $query);

        if (!self::hasErrors($response) && isset($response->data->me->id)) {
            wp_send_json_success(__('Authentication successful', 'bit-integrations'), 200);
        }

        wp_send_json_error(self::errorMessage($response, __('Authentication failed', 'bit-integrations')), 400);
    }

    public function getBoards($requestParams)
    {
        self::validateToken($requestParams);

        $query = <<<'GRAPHQL'
        query ($limit: Int) {
            boards (limit: $limit) {
                id
                name
            }
        }
        GRAPHQL;
        $response = self::request($requestParams->apiToken, $query, ['limit' => 100]);

        if (self::hasErrors($response) || !isset($response->data->boards)) {
            wp_send_json_error(self::errorMessage($response, __('Boards fetching failed', 'bit-integrations')), 400);
        }

        $boards = array_map(
            fn ($b) => (object) ['id' => $b->id, 'name' => $b->name],
            $response->data->boards
        );

        wp_send_json_success($boards, 200);
    }

    public function getGroups($requestParams)
    {
        self::validateToken($requestParams);
        if (empty($requestParams->boardId)) {
            wp_send_json_error(__('Board ID is empty', 'bit-integrations'), 400);
        }

        $query = <<<'GRAPHQL'
        query ($boardIds: [ID!]) {
            boards (ids: $boardIds) {
                groups {
                    id
                    title
                }
            }
        }
        GRAPHQL;
        $response = self::request($requestParams->apiToken, $query, ['boardIds' => [(string) $requestParams->boardId]]);

        if (self::hasErrors($response) || !isset($response->data->boards[0]->groups)) {
            wp_send_json_error(self::errorMessage($response, __('Groups fetching failed', 'bit-integrations')), 400);
        }

        $groups = array_map(
            fn ($g) => (object) ['id' => $g->id, 'name' => $g->title],
            $response->data->boards[0]->groups
        );

        wp_send_json_success($groups, 200);
    }

    public function getColumns($requestParams)
    {
        self::validateToken($requestParams);
        if (empty($requestParams->boardId)) {
            wp_send_json_error(__('Board ID is empty', 'bit-integrations'), 400);
        }

        $query = <<<'GRAPHQL'
        query ($boardIds: [ID!]) {
            boards (ids: $boardIds) {
                columns {
                    id
                    title
                    type
                }
            }
        }
        GRAPHQL;
        $response = self::request($requestParams->apiToken, $query, ['boardIds' => [(string) $requestParams->boardId]]);

        if (self::hasErrors($response) || !isset($response->data->boards[0]->columns)) {
            wp_send_json_error(self::errorMessage($response, __('Columns fetching failed', 'bit-integrations')), 400);
        }

        $columns = [];
        foreach (reset($response->data->boards)->columns as $column) {
            if ($column->type !== 'file') {
                $columns[] = (object) [
                    'key'      => $column->id,
                    'label'    => $column->title,
                    'type'     => $column->type,
                    'required' => false,
                ];
            }
        }

        wp_send_json_success($columns, 200);
    }

    public function getItems($requestParams)
    {
        self::validateToken($requestParams);
        if (empty($requestParams->boardId)) {
            wp_send_json_error(__('Board ID is empty', 'bit-integrations'), 400);
        }

        $query = <<<'GRAPHQL'
        query ($boardIds: [ID!], $limit: Int) {
            boards (ids: $boardIds) {
                items_page (limit: $limit) {
                    items {
                        id
                        name
                    }
                }
            }
        }
        GRAPHQL;
        $response = self::request(
            $requestParams->apiToken,
            $query,
            [
                'boardIds' => [(string) $requestParams->boardId],
                'limit'    => 100,
            ]
        );

        if (self::hasErrors($response) || !isset($response->data->boards[0]->items_page->items)) {
            wp_send_json_error(self::errorMessage($response, __('Items fetching failed', 'bit-integrations')), 400);
        }

        $items = array_map(
            fn ($i) => (object) ['id' => $i->id, 'name' => $i->name],
            $response->data->boards[0]->items_page->items
        );

        wp_send_json_success($items, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];
        $apiToken = $integrationDetails->apiToken ?? '';

        if (empty($apiToken)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('API Token is required for Monday.com api', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $apiToken);
        $response = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($response)) {
            return $response;
        }

        return $response;
    }

    private static function validateToken($requestParams)
    {
        if (empty($requestParams->apiToken)) {
            wp_send_json_error(__('API Token is empty', 'bit-integrations'), 400);
        }
    }

    private static function setHeaders($apiToken)
    {
        return [
            'Authorization' => $apiToken,
            'Content-Type'  => 'application/json',
            'API-Version'   => self::API_VERSION,
        ];
    }

    private static function request($apiToken, $query, $variables = [])
    {
        $body = ['query' => $query];

        if (!empty($variables)) {
            $body['variables'] = $variables;
        }

        return HttpHelper::post(self::API_URL, wp_json_encode($body), self::setHeaders($apiToken));
    }

    private static function hasErrors($response)
    {
        return is_wp_error($response) || !empty($response->errors) || !empty($response->error);
    }

    private static function errorMessage($response, $fallback)
    {
        if (is_wp_error($response)) {
            return $response->get_error_message();
        }

        if (!empty($response->errors[0]->message)) {
            return $response->errors[0]->message;
        }

        if (!empty($response->error)) {
            return \is_string($response->error) ? $response->error : wp_json_encode($response->error);
        }

        return $fallback;
    }
}
