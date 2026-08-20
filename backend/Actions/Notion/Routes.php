<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Notion\NotionController;
use BitApps\Integrations\Core\Util\Route;

Route::post('notion_database_lists', [NotionController::class, 'getAllDatabaseLists']);
Route::post('notion_database_properties', [NotionController::class, 'getFieldsProperties']);
