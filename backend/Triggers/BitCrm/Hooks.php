<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Triggers\BitCrm\BitCrmController;

Hooks::add('bit_crm/lead_created', [BitCrmController::class, 'handleLeadCreated'], 20, 1);
Hooks::add('bit_crm/lead_updated', [BitCrmController::class, 'handleLeadUpdated'], 20, 1);
Hooks::add('bit_crm/leads_trashed', [BitCrmController::class, 'handleLeadsTrashed'], 20, 1);
Hooks::add('bit_crm/leads_converted_to_contact', [BitCrmController::class, 'handleLeadConverted'], 20, 1);
Hooks::add('bit_crm/tag_attached_to_lead', [BitCrmController::class, 'handleLeadTagAttached'], 20, 2);
Hooks::add('bit_crm/tag_detached_from_lead', [BitCrmController::class, 'handleLeadTagDetached'], 20, 2);
Hooks::add('bit_crm/tags_attached_to_leads', [BitCrmController::class, 'handleLeadTagsAttached'], 20, 2);
Hooks::add('bit_crm/tags_detached_from_leads', [BitCrmController::class, 'handleLeadTagsDetached'], 20, 2);
Hooks::add('bit_crm/contact_created', [BitCrmController::class, 'handleContactCreated'], 20, 1);
Hooks::add('bit_crm/contact_updated', [BitCrmController::class, 'handleContactUpdated'], 20, 1);
Hooks::add('bit_crm/contacts_trashed', [BitCrmController::class, 'handleContactsTrashed'], 20, 1);
Hooks::add('bit_crm/tag_attached_to_contact', [BitCrmController::class, 'handleContactTagAttached'], 20, 2);
Hooks::add('bit_crm/tag_detached_from_contact', [BitCrmController::class, 'handleContactTagDetached'], 20, 2);
Hooks::add('bit_crm/tags_attached_to_contacts', [BitCrmController::class, 'handleContactTagsAttached'], 20, 2);
Hooks::add('bit_crm/tags_detached_from_contacts', [BitCrmController::class, 'handleContactTagsDetached'], 20, 2);
Hooks::add('bit_crm/company_created', [BitCrmController::class, 'handleCompanyCreated'], 20, 1);
Hooks::add('bit_crm/company_updated', [BitCrmController::class, 'handleCompanyUpdated'], 20, 1);
Hooks::add('bit_crm/companies_trashed', [BitCrmController::class, 'handleCompaniesTrashed'], 20, 1);
Hooks::add('bit_crm/tag_attached_to_company', [BitCrmController::class, 'handleCompanyTagAttached'], 20, 2);
Hooks::add('bit_crm/tag_detached_from_company', [BitCrmController::class, 'handleCompanyTagDetached'], 20, 2);
Hooks::add('bit_crm/tags_attached_to_companies', [BitCrmController::class, 'handleCompanyTagsAttached'], 20, 2);
Hooks::add('bit_crm/tags_detached_from_companies', [BitCrmController::class, 'handleCompanyTagsDetached'], 20, 2);
Hooks::add('bit_crm/deal_created', [BitCrmController::class, 'handleDealCreated'], 20, 1);
Hooks::add('bit_crm/deal_updated', [BitCrmController::class, 'handleDealUpdated'], 20, 1);
Hooks::add('bit_crm/deals_trashed', [BitCrmController::class, 'handleDealsTrashed'], 20, 1);
Hooks::add('bit_crm/deal_stage_updated', [BitCrmController::class, 'handleDealStageUpdated'], 20, 2);
Hooks::add('bit_crm/tag_attached_to_deal', [BitCrmController::class, 'handleDealTagAttached'], 20, 2);
Hooks::add('bit_crm/tag_detached_from_deal', [BitCrmController::class, 'handleDealTagDetached'], 20, 2);
Hooks::add('bit_crm/tags_attached_to_deals', [BitCrmController::class, 'handleDealTagsAttached'], 20, 2);
Hooks::add('bit_crm/tags_detached_from_deals', [BitCrmController::class, 'handleDealTagsDetached'], 20, 2);
Hooks::add('bit_crm/product_created', [BitCrmController::class, 'handleProductCreated'], 20, 1);
Hooks::add('bit_crm/product_updated', [BitCrmController::class, 'handleProductUpdated'], 20, 1);
Hooks::add('bit_crm/products_trashed', [BitCrmController::class, 'handleProductsTrashed'], 20, 1);
Hooks::add('bit_crm/tag_attached_to_product', [BitCrmController::class, 'handleProductTagAttached'], 20, 2);
Hooks::add('bit_crm/tag_detached_from_product', [BitCrmController::class, 'handleProductTagDetached'], 20, 2);
Hooks::add('bit_crm/tags_attached_to_products', [BitCrmController::class, 'handleProductTagsAttached'], 20, 2);
Hooks::add('bit_crm/tags_detached_from_products', [BitCrmController::class, 'handleProductTagsDetached'], 20, 2);
Hooks::add('bit_crm/tag_created', [BitCrmController::class, 'handleTagCreated'], 20, 1);
Hooks::add('bit_crm/tag_updated', [BitCrmController::class, 'handleTagUpdated'], 20, 1);
Hooks::add('bit_crm/tag_deleted', [BitCrmController::class, 'handleTagDeleted'], 20, 1);
Hooks::add('bit_crm/note_created', [BitCrmController::class, 'handleNoteCreated'], 20, 1);
Hooks::add('bit_crm/note_updated', [BitCrmController::class, 'handleNoteUpdated'], 20, 1);
Hooks::add('bit_crm/note_deleted', [BitCrmController::class, 'handleNoteDeleted'], 20, 1);
Hooks::add('bit_crm/activity_created', [BitCrmController::class, 'handleActivityCreated'], 20, 1);
Hooks::add('bit_crm/activity_updated', [BitCrmController::class, 'handleActivityUpdated'], 20, 1);
Hooks::add('bit_crm/activity_status_updated', [BitCrmController::class, 'handleActivityStatusUpdated'], 20, 3);
Hooks::add('bit_crm/activity_deleted', [BitCrmController::class, 'handleActivityDeleted'], 20, 1);
Hooks::add('bit_crm/attachment_created', [BitCrmController::class, 'handleAttachmentCreated'], 20, 1);
Hooks::add('bit_crm/attachment_deleted', [BitCrmController::class, 'handleAttachmentDeleted'], 20, 1);
Hooks::add('bit_crm/link_created', [BitCrmController::class, 'handleLinkCreated'], 20, 1);
Hooks::add('bit_crm/link_updated', [BitCrmController::class, 'handleLinkUpdated'], 20, 1);
Hooks::add('bit_crm/link_deleted', [BitCrmController::class, 'handleLinkDeleted'], 20, 1);
Hooks::add('bit_crm/client_portal_access_granted', [BitCrmController::class, 'handlePortalAccessGranted'], 20, 2);
Hooks::add('bit_crm/client_portal_access_revoked', [BitCrmController::class, 'handlePortalAccessRevoked'], 20, 2);
Hooks::add('bit_crm/invoice_created', [BitCrmController::class, 'handleInvoiceCreated'], 20, 1);
Hooks::add('bit_crm/invoice_updated', [BitCrmController::class, 'handleInvoiceUpdated'], 20, 1);
Hooks::add('bit_crm/invoice_status_updated', [BitCrmController::class, 'handleInvoiceStatusUpdated'], 20, 1);
Hooks::add('bit_crm/invoices_trashed', [BitCrmController::class, 'handleInvoicesTrashed'], 20, 1);
