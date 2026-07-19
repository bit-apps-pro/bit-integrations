<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ClickWhale\ClickWhaleController;
use BitApps\Integrations\Core\Util\Route;

// No refresh_* route: every ClickWhale input is either free text, the id of the link
// being acted on, or a fixed option set, so there is no fetchable list to back.
Route::post('clickwhale_authorize', [ClickWhaleController::class, 'clickWhaleAuthorize']);
