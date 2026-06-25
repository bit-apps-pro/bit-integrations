<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FreshBooks\FreshBooksController;
use BitApps\Integrations\Core\Util\Route;

Route::post('fresh_books_authorization', [FreshBooksController::class, 'authorization']);
