<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Trello\TrelloHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('trello_fetch_all_board', [TrelloHelper::class, 'fetchAllBoards']);
Route::post('trello_fetch_all_list_Individual_board', [TrelloHelper::class, 'fetchAllLists']);
Route::post('trello_fetch_all_custom_fields', [TrelloHelper::class, 'fetchAllCustomFields']);
