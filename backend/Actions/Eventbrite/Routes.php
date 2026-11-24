<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Eventbrite\EventbriteController;
use BitApps\Integrations\Core\Util\Route;

Route::post('eventbrite_get_organizations', [EventbriteController::class, 'getOrganizations']);
Route::post('eventbrite_get_venues', [EventbriteController::class, 'getVenues']);
Route::post('eventbrite_get_events', [EventbriteController::class, 'getEvents']);
Route::post('eventbrite_get_ticket_classes', [EventbriteController::class, 'getTicketClasses']);
Route::post('eventbrite_get_ticket_groups', [EventbriteController::class, 'getTicketGroups']);
Route::post('eventbrite_get_categories', [EventbriteController::class, 'getCategories']);
Route::post('eventbrite_get_subcategories', [EventbriteController::class, 'getSubcategories']);
Route::post('eventbrite_get_formats', [EventbriteController::class, 'getFormats']);
