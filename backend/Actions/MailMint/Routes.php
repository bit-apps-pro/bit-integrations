<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MailMint\MailMintController;
use BitApps\Integrations\Core\Util\Route;

Route::post('fetch_all_mail_mint_list', [MailMintController::class, 'getAllList']);
Route::post('fetch_all_mail_mint_tags', [MailMintController::class, 'getAllTags']);
Route::post('fetch_all_mail_mint_custom_fields', [MailMintController::class, 'allCustomFields']);
