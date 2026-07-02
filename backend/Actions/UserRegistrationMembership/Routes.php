<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\UserRegistrationMembership\UserRegistrationMembershipController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_user_registration_forms', [UserRegistrationMembershipController::class, 'refreshForms']);
Route::post('refresh_user_registration_form_fields', [UserRegistrationMembershipController::class, 'refreshFormFields']);
