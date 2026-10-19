<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\GoogleSheet\GoogleSheetHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('gsheet_refresh_spreadsheets', [GoogleSheetHelper::class, 'refreshSpreadsheetsAjaxHelper']);
Route::post('gsheet_refresh_worksheets', [GoogleSheetHelper::class, 'refreshWorksheetsAjaxHelper']);
Route::post('gsheet_refresh_worksheet_headers', [GoogleSheetHelper::class, 'refreshWorksheetHeadersAjaxHelper']);
