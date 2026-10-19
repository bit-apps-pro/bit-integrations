<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MailMint\MailMintHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('fetch_all_mail_mint_list', [MailMintHelper::class, 'getAllList']);
Route::post('fetch_all_mail_mint_tags', [MailMintHelper::class, 'getAllTags']);
Route::post('fetch_all_mail_mint_custom_fields', [MailMintHelper::class, 'allCustomFields']);
