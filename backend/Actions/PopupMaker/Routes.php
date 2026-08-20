<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\PopupMaker\PopupMakerController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_popup_maker_popups', [PopupMakerController::class, 'refreshPopups']);
Route::post('refresh_popup_maker_themes', [PopupMakerController::class, 'refreshThemes']);
