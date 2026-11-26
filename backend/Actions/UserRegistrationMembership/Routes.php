<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\UserRegistrationMembership\UserRegistrationMembershipHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_user_registration_forms', [UserRegistrationMembershipHelper::class, 'refreshForms']);
Route::post('refresh_user_registration_form_fields', [UserRegistrationMembershipHelper::class, 'refreshFormFields']);
