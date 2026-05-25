<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\GoogleSheet\GoogleSheetController;
use BitApps\Integrations\Core\Util\Route;

Route::post('gsheet_refresh_spreadsheets', [GoogleSheetController::class, 'refreshSpreadsheetsAjaxHelper']);
Route::post('gsheet_refresh_worksheets', [GoogleSheetController::class, 'refreshWorksheetsAjaxHelper']);
Route::post('gsheet_refresh_worksheet_headers', [GoogleSheetController::class, 'refreshWorksheetHeadersAjaxHelper']);
