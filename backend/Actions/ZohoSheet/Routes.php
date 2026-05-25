<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoSheet\ZohoSheetController;
use BitApps\Integrations\Core\Util\Route;

Route::post('zohoSheet_fetch_all_work_books', [ZohoSheetController::class, 'getAllWorkbooks']);
Route::post('zohoSheet_fetch_all_work_sheets', [ZohoSheetController::class, 'getAllWorksheets']);
Route::post('zohoSheet_fetch_all_work_sheet_header', [ZohoSheetController::class, 'getWorksheetHeader']);
