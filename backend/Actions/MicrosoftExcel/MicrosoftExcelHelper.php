<?php

namespace BitApps\Integrations\Actions\MicrosoftExcel;

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Http\ApiResponse;

class MicrosoftExcelHelper
{
    private const BASE_URL = 'https://graph.microsoft.com/v1.0';

    private const MAX_PAGES = 10;

    private const FOLDER_LEVELS = 3;

    private const BATCH_SIZE = 20;

    private const MIN_COLUMNS = 26;

    private const MAX_COLUMNS = 702;

    public function getFolders($queryParams)
    {
        $client = self::requireClient($queryParams);
        $folders = [];
        $parents = [];

        foreach (self::fetchAll($client, '/me/drive/root/children?$select=id,name,folder&$top=200') as $item) {
            self::collectFolder($item, '', $folders, $parents);
        }

        for ($level = 1; $level < self::FOLDER_LEVELS && !empty($parents); ++$level) {
            $children = self::batchChildren($client, \array_slice($parents, 0, self::BATCH_SIZE, true));
            $parents = [];

            foreach ($children as $parentPath => $items) {
                foreach ($items as $item) {
                    self::collectFolder($item, $parentPath, $folders, $parents);
                }
            }
        }

        usort(
            $folders,
            static function ($first, $second) {
                return strnatcasecmp($first->name, $second->name);
            }
        );

        wp_send_json_success($folders, 200);
    }

    public function getWorkbooks($queryParams)
    {
        $client = self::requireClient($queryParams);
        $folderId = self::param($queryParams, 'folder_id');
        $path = $folderId === '' ? '/me/drive/root/children' : '/me/drive/items/' . rawurlencode($folderId) . '/children';
        $workbooks = [];

        foreach (self::fetchAll($client, $path . '?$select=id,name,file&$top=200') as $item) {
            if (ApiResponse::getValue($item, 'file') !== null && preg_match('/\.xls[xm]$/i', (string) ApiResponse::getValue($item, 'name'))) {
                $workbooks[] = self::namedItem($item);
            }
        }

        wp_send_json_success($workbooks, 200);
    }

    public function getWorksheets($queryParams)
    {
        $client = self::requireClient($queryParams);
        $response = $client->get(self::workbookPath($queryParams) . '/worksheets?$select=id,name');
        self::failOnError($response);

        $worksheets = [];

        foreach ((array) $response->getBodyValue('value') as $worksheet) {
            $worksheets[] = self::namedItem($worksheet);
        }

        wp_send_json_success($worksheets, 200);
    }

    public function getColumns($queryParams)
    {
        $client = self::requireClient($queryParams);
        $worksheetPath = self::worksheetPath($queryParams);
        $usedRange = $client->get($worksheetPath . '/usedRange(valuesOnly=true)?$select=address');
        self::failOnError($usedRange);

        [$headerRow, $lastColumn] = self::headerRowAndLastColumn((string) $usedRange->getBodyValue('address'));
        $columnCount = min(max($lastColumn, self::MIN_COLUMNS), self::MAX_COLUMNS);
        $headerAddress = 'A' . $headerRow . ':' . self::columnName($columnCount) . $headerRow;
        $headerRange = $client->get($worksheetPath . "/range(address='" . rawurlencode($headerAddress) . "')?\$select=values");
        $headerValues = $headerRange->success() ? $headerRange->getBodyValue('values') : null;
        $headers = \is_array($headerValues) && \is_array($headerValues[0] ?? null) ? $headerValues[0] : [];
        $columns = [];

        for ($index = 1; $index <= $columnCount; ++$index) {
            $header = $headers[$index - 1] ?? '';

            $columns[] = (object) [
                'id'   => self::columnName($index),
                'name' => \is_scalar($header) ? trim((string) $header) : '',
            ];
        }

        wp_send_json_success($columns, 200);
    }

    public static function client($connectionId): ?ApiClient
    {
        $connection = AuthorizationFactory::getConnectionHandler($connectionId);

        if ($connection === null) {
            return null;
        }

        $apiClient = new ApiClient($connection);
        $apiClient->setBaseURL(self::BASE_URL);
        $apiClient->setHeaders(['Accept' => 'application/json']);

        return $apiClient;
    }

    private static function requireClient($queryParams): ApiClient
    {
        $client = self::client($queryParams->connection_id ?? 0);

        if ($client === null) {
            wp_send_json_error(__('Select a Microsoft Excel connection first', 'bit-integrations'), 400);
        }

        return $client;
    }

    private static function workbookPath($queryParams): string
    {
        $workbookId = self::param($queryParams, 'workbook_id');

        if ($workbookId === '') {
            wp_send_json_error(__('Select a workbook first', 'bit-integrations'), 400);
        }

        return '/me/drive/items/' . rawurlencode($workbookId) . '/workbook';
    }

    private static function worksheetPath($queryParams): string
    {
        $workbookPath = self::workbookPath($queryParams);
        $worksheetId = self::param($queryParams, 'worksheet_id');

        if ($worksheetId === '') {
            wp_send_json_error(__('Select a worksheet first', 'bit-integrations'), 400);
        }

        return $workbookPath . '/worksheets/' . rawurlencode($worksheetId);
    }

    private static function fetchAll(ApiClient $client, string $path): array
    {
        $items = [];
        $url = $path;

        for ($page = 0; $page < self::MAX_PAGES && $url !== ''; ++$page) {
            $response = $client->get($url);
            self::failOnError($response);

            $items = array_merge($items, (array) $response->getBodyValue('value'));
            $url = (string) ($response->getBodyValue('@odata.nextLink') ?? '');
        }

        return $items;
    }

    private static function collectFolder($item, string $parentPath, array &$folders, array &$parents): void
    {
        $folder = ApiResponse::getValue($item, 'folder');

        if ($folder === null) {
            return;
        }

        $id = (string) ApiResponse::getValue($item, 'id');
        $name = (string) ApiResponse::getValue($item, 'name');
        $path = $parentPath === '' ? $name : $parentPath . ' / ' . $name;
        $folders[] = (object) ['id' => $id, 'name' => $path];

        if ((int) ApiResponse::getValue($folder, 'childCount') > 0) {
            $parents[$id] = $path;
        }
    }

    private static function batchChildren(ApiClient $client, array $parents): array
    {
        $requests = [];
        $paths = [];

        foreach ($parents as $id => $path) {
            $requestId = (string) \count($requests);
            $paths[$requestId] = $path;
            $requests[] = [
                'id'     => $requestId,
                'method' => 'GET',
                'url'    => '/me/drive/items/' . rawurlencode((string) $id) . '/children?$select=id,name,folder&$top=200',
            ];
        }

        $response = $client->post('/$batch', wp_json_encode(['requests' => $requests]), ['Content-Type' => 'application/json']);
        self::failOnError($response);

        $children = [];

        foreach ((array) $response->getBodyValue('responses') as $part) {
            $requestId = (string) ApiResponse::getValue($part, 'id');

            if ((int) ApiResponse::getValue($part, 'status') === 200 && isset($paths[$requestId])) {
                $children[$paths[$requestId]] = (array) ApiResponse::getValue(ApiResponse::getValue($part, 'body'), 'value');
            }
        }

        return $children;
    }

    private static function failOnError(ApiResponse $response): void
    {
        if ($response->success()) {
            return;
        }

        $message = ApiResponse::getValue($response->getBodyValue('error'), 'message');

        wp_send_json_error(
            \is_string($message) && $message !== ''
                ? $message
                : ($response->getError() ?: __('Could not reach Microsoft Excel', 'bit-integrations')),
            400
        );
    }

    private static function headerRowAndLastColumn(string $address): array
    {
        $sheetSeparator = strrpos($address, '!');
        $cells = explode(':', $sheetSeparator === false ? $address : substr($address, $sheetSeparator + 1));
        $start = self::parseCell($cells[0]);
        $end = self::parseCell(end($cells));

        return [$start[1] ?? 1, $end[0] ?? 1];
    }

    private static function parseCell(string $cell): ?array
    {
        if (!preg_match('/^\$?([A-Z]{1,3})\$?(\d+)$/i', trim($cell), $match)) {
            return null;
        }

        return [self::columnIndex($match[1]), (int) $match[2]];
    }

    private static function columnIndex(string $letters): int
    {
        $index = 0;

        foreach (str_split(strtoupper($letters)) as $letter) {
            $index = $index * 26 + \ord($letter) - 64;
        }

        return $index;
    }

    private static function columnName(int $index): string
    {
        $name = '';

        while ($index > 0) {
            $name = \chr(65 + ($index - 1) % 26) . $name;
            $index = intdiv($index - 1, 26);
        }

        return $name;
    }

    private static function namedItem($item): object
    {
        return (object) [
            'id'   => (string) ApiResponse::getValue($item, 'id'),
            'name' => (string) ApiResponse::getValue($item, 'name'),
        ];
    }

    private static function param($queryParams, string $key): string
    {
        $value = $queryParams->{$key} ?? '';

        return \is_scalar($value) ? trim((string) $value) : '';
    }
}
