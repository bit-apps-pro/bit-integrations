<?php

namespace BitApps\Integrations\Core\Util;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\OAuth2\OneClickApp;
use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Http\ApiResponse;

final class GoogleDriveHelper
{
    public const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

    public const SPREADSHEET_MIME_TYPE = 'application/vnd.google-apps.spreadsheet';

    private const BASE_URL = 'https://www.googleapis.com/drive/v3';

    private const SHARED_DRIVES = 'shared-drives';

    private const SHARED_WITH_ME = 'shared-with-me';

    private const MY_DRIVE = 'my-drive';

    private const FILES_PAGE_SIZE = 1000;

    private const DRIVES_PAGE_SIZE = 100;

    private const MAX_PAGES = 20;

    public static function client($connectionId, string $appSlug): ?ApiClient
    {
        $connection = AuthorizationFactory::getConnectionHandler($connectionId);

        if ($connection === null || self::normalizeSlug(ApiResponse::getValue($connection->getConnection(), 'app_slug')) !== $appSlug) {
            return null;
        }

        $client = new ApiClient($connection);
        $client->setBaseURL(self::BASE_URL);
        $client->setHeaders(['Accept' => 'application/json']);

        return $client;
    }

    public static function pickerConfig(array $authDetails): array
    {
        $clientId = (string) ($authDetails['client_id'] ?? '');
        $oneClickApp = (string) ($authDetails['one_click_app'] ?? '');
        $apiKey = $oneClickApp === '' ? '' : OneClickApp::setting($oneClickApp, 'filePickerApiKey');

        return [
            'access_token' => (string) ($authDetails['access_token'] ?? ''),
            'api_key'      => (string) Hooks::apply(Config::withPrefix('google_file_picker_api_key'), $apiKey, $oneClickApp),
            'app_id'       => preg_match('/^(\d+)-/', $clientId, $matches) ? $matches[1] : '',
        ];
    }

    public static function listItems(ApiClient $client, string $parentId, string $location, array $mimeTypes, ?string $accessibleMimeType = null): array
    {
        if ($parentId === '' && $location === self::SHARED_DRIVES) {
            [$error, $drives] = self::fetchAll($client, '/drives', ['fields' => 'nextPageToken,drives(id,name)'], 'drives', self::DRIVES_PAGE_SIZE);

            return [$error, array_map(
                fn ($drive) => ['id' => $drive->id, 'name' => $drive->name, 'type' => 'folder'],
                $drives
            )];
        }

        $scope = $parentId === '' && $location === self::SHARED_WITH_ME
            ? 'sharedWithMe = true'
            : "'" . self::sanitizeId($parentId) . "' in parents";

        [$error, $files] = self::listFiles($client, "{$scope} and " . self::mimeTypeFilter($mimeTypes), 'folder,name');

        if ($error !== null) {
            return [$error, []];
        }

        if ($accessibleMimeType !== null && $location === self::MY_DRIVE && \in_array($parentId, ['', 'root'], true)) {
            $files = self::withAccessibleFiles($client, $files, $accessibleMimeType);
        }

        return [null, array_map(
            fn ($file) => [
                'id'   => $file->id,
                'name' => $file->name,
                'type' => $file->mimeType === self::FOLDER_MIME_TYPE ? 'folder' : 'file',
            ],
            $files
        )];
    }

    public static function createFolder(ApiClient $client, string $parentId, string $name): array
    {
        $response = $client->post(
            '/files?supportsAllDrives=true&fields=id,name',
            wp_json_encode(['name' => $name, 'mimeType' => self::FOLDER_MIME_TYPE, 'parents' => [self::sanitizeId($parentId)]]),
            ['Content-Type' => 'application/json']
        );

        if (!$response->success() || empty($response->getBodyValue('id'))) {
            return [self::errorMessage($response), null];
        }

        return [null, ['id' => $response->getBodyValue('id'), 'name' => $response->getBodyValue('name') ?? $name]];
    }

    private static function withAccessibleFiles(ApiClient $client, array $files, string $mimeType): array
    {
        [$error, $accessibleFiles] = self::listFiles($client, self::mimeTypeFilter([$mimeType]), 'name');

        if ($error !== null) {
            return $files;
        }

        $listedIds = array_column(array_map(fn ($file) => (array) $file, $files), 'id');

        foreach ($accessibleFiles as $file) {
            if (!\in_array($file->id, $listedIds, true)) {
                $files[] = $file;
            }
        }

        return $files;
    }

    private static function listFiles(ApiClient $client, string $query, string $orderBy): array
    {
        return self::fetchAll($client, '/files', [
            'q'                         => "{$query} and trashed = false",
            'fields'                    => 'nextPageToken,files(id,name,mimeType)',
            'orderBy'                   => $orderBy,
            'corpora'                   => 'allDrives',
            'supportsAllDrives'         => 'true',
            'includeItemsFromAllDrives' => 'true',
        ], 'files', self::FILES_PAGE_SIZE);
    }

    private static function fetchAll(ApiClient $client, string $path, array $params, string $listKey, int $pageSize): array
    {
        $items = [];
        $pageToken = '';

        for ($page = 0; $page < self::MAX_PAGES; ++$page) {
            $response = $client->get($path . '?' . http_build_query(array_filter(
                $params + ['pageSize' => $pageSize, 'pageToken' => $pageToken],
                fn ($value) => $value !== ''
            )));

            if (!$response->success()) {
                return [self::errorMessage($response), []];
            }

            $items = array_merge($items, (array) ($response->getBodyValue($listKey) ?? []));
            $pageToken = (string) ($response->getBodyValue('nextPageToken') ?? '');

            if ($pageToken === '') {
                break;
            }
        }

        return [null, $items];
    }

    private static function mimeTypeFilter(array $mimeTypes): string
    {
        return '(' . implode(' or ', array_map(fn ($mimeType) => "mimeType = '{$mimeType}'", $mimeTypes)) . ')';
    }

    private static function sanitizeId(string $id): string
    {
        return preg_match('/^[A-Za-z0-9_-]{1,200}$/', $id) ? $id : 'root';
    }

    private static function normalizeSlug($slug): string
    {
        return strtolower((string) preg_replace('/[^a-z0-9]/i', '', (string) $slug));
    }

    private static function errorMessage(ApiResponse $response): string
    {
        $message = ApiResponse::getValue($response->getBodyValue('error'), 'message');

        return \is_string($message) && $message !== ''
            ? $message
            : ($response->getError() ?: __('Could not reach Google Drive', 'bit-integrations'));
    }
}
