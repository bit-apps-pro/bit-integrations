<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BitCrm\BitCrmActionHelper;
use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Hooks;

Hooks::filter(Config::withPrefix('bitcrm_create_lead'), [BitCrmActionHelper::class, 'createLead'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_update_lead'), [BitCrmActionHelper::class, 'updateLead'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_delete_lead'), [BitCrmActionHelper::class, 'deleteLead'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_add_tag_to_lead'), [BitCrmActionHelper::class, 'addTagToLead'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_remove_tag_from_lead'), [BitCrmActionHelper::class, 'removeTagFromLead'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_create_contact'), [BitCrmActionHelper::class, 'createContact'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_update_contact'), [BitCrmActionHelper::class, 'updateContact'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_delete_contact'), [BitCrmActionHelper::class, 'deleteContact'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_add_tag_to_contact'), [BitCrmActionHelper::class, 'addTagToContact'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_remove_tag_from_contact'), [BitCrmActionHelper::class, 'removeTagFromContact'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_create_company'), [BitCrmActionHelper::class, 'createCompany'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_update_company'), [BitCrmActionHelper::class, 'updateCompany'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_delete_company'), [BitCrmActionHelper::class, 'deleteCompany'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_add_tag_to_company'), [BitCrmActionHelper::class, 'addTagToCompany'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_remove_tag_from_company'), [BitCrmActionHelper::class, 'removeTagFromCompany'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_create_deal'), [BitCrmActionHelper::class, 'createDeal'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_update_deal'), [BitCrmActionHelper::class, 'updateDeal'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_delete_deal'), [BitCrmActionHelper::class, 'deleteDeal'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_add_tag_to_deal'), [BitCrmActionHelper::class, 'addTagToDeal'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_remove_tag_from_deal'), [BitCrmActionHelper::class, 'removeTagFromDeal'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_create_product'), [BitCrmActionHelper::class, 'createProduct'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_update_product'), [BitCrmActionHelper::class, 'updateProduct'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_delete_product'), [BitCrmActionHelper::class, 'deleteProduct'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_add_tag_to_product'), [BitCrmActionHelper::class, 'addTagToProduct'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_remove_tag_from_product'), [BitCrmActionHelper::class, 'removeTagFromProduct'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_update_deal_stage'), [BitCrmActionHelper::class, 'updateDealStage'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_convert_lead'), [BitCrmActionHelper::class, 'convertLead'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_create_tag'), [BitCrmActionHelper::class, 'createTag'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_create_note'), [BitCrmActionHelper::class, 'createNote'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_create_activity'), [BitCrmActionHelper::class, 'createActivity'], 10, 2);
Hooks::filter(Config::withPrefix('bitcrm_create_invoice'), [BitCrmActionHelper::class, 'createInvoice'], 10, 2);
