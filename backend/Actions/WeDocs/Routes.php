<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WeDocs\WeDocsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('wedocs_get_documentations', [WeDocsController::class, 'getDocumentations']);
Route::post('wedocs_get_sections', [WeDocsController::class, 'getSections']);
