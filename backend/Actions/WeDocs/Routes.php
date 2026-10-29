<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WeDocs\WeDocsHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('wedocs_get_documentations', [WeDocsHelper::class, 'getDocumentations']);
Route::post('wedocs_get_sections', [WeDocsHelper::class, 'getSections']);
