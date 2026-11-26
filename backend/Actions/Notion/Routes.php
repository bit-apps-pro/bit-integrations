<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Notion\NotionHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('notion_database_lists', [NotionHelper::class, 'getAllDatabaseLists']);
Route::post('notion_database_properties', [NotionHelper::class, 'getFieldsProperties']);
