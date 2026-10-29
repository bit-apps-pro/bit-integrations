<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\PopupMaker\PopupMakerHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_popup_maker_popups', [PopupMakerHelper::class, 'refreshPopups']);
Route::post('refresh_popup_maker_themes', [PopupMakerHelper::class, 'refreshThemes']);
