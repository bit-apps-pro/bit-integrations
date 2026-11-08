<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MicrosoftExcel\MicrosoftExcelHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('microsoft_excel_get_folders', [MicrosoftExcelHelper::class, 'getFolders']);
Route::post('microsoft_excel_get_workbooks', [MicrosoftExcelHelper::class, 'getWorkbooks']);
Route::post('microsoft_excel_get_worksheets', [MicrosoftExcelHelper::class, 'getWorksheets']);
Route::post('microsoft_excel_get_columns', [MicrosoftExcelHelper::class, 'getColumns']);
