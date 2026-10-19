<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoSheet\ZohoSheetHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('zohoSheet_fetch_all_work_books', [ZohoSheetHelper::class, 'getAllWorkbooks']);
Route::post('zohoSheet_fetch_all_work_sheets', [ZohoSheetHelper::class, 'getAllWorksheets']);
Route::post('zohoSheet_fetch_all_work_sheet_header', [ZohoSheetHelper::class, 'getWorksheetHeader']);
