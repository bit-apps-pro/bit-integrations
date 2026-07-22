<?php

namespace BitApps\Integrations\Triggers\BitCrm;

use BitApps\Integrations\Config;

final class BitCrmController
{
    public static function info()
    {
        return [
            'name'              => 'Bit CRM',
            'title'             => __('Bit CRM: Leads, Contacts, Deals & Invoices', 'bit-integrations'),
            'type'              => 'custom_form_submission',
            'is_active'         => static::isPluginInstalled(),
            'documentation_url' => 'https://bit-integrations.com/wp-docs/trigger/bit-crm-integrations-as-a-trigger/',
            'tutorial_url'      => '#',
            'tasks'             => [
                'action' => 'bit-crm/get',
                'method' => 'get',
            ],
            'fetch' => [
                'action' => 'trigger/test',
                'method' => 'post',
            ],
            'fetch_remove' => [
                'action' => 'trigger/test/remove',
                'method' => 'post',
            ],
            'isPro' => false,
        ];
    }

    public function getAllTasks()
    {
        if (!static::isPluginInstalled()) {
            wp_send_json_error(\sprintf(__('%s is not installed or activated', 'bit-integrations'), 'Bit CRM'));
        }

        wp_send_json_success([
            ['form_name' => __('Lead Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/lead_created', 'skipPrimaryKey' => true, 'note' => __('Runs when a lead is created.', 'bit-integrations')],
            ['form_name' => __('Lead Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/lead_updated', 'skipPrimaryKey' => true, 'note' => __('Runs when a lead is updated.', 'bit-integrations')],
            ['form_name' => __('Lead Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/leads_trashed', 'skipPrimaryKey' => true, 'note' => __('Runs when one or more leads are trashed.', 'bit-integrations')],
            ['form_name' => __('Lead Converted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/leads_converted_to_contact', 'skipPrimaryKey' => true, 'note' => __('Runs when a lead is converted.', 'bit-integrations')],
            ['form_name' => __('Tag Attached To Lead', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_lead', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is attached to a lead.', 'bit-integrations')],
            ['form_name' => __('Tag Detached From Lead', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_lead', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is detached from a lead.', 'bit-integrations')],
            ['form_name' => __('Tags Attached To Leads', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_leads', 'skipPrimaryKey' => true, 'note' => __('Runs when tags are attached to leads (bulk).', 'bit-integrations')],
            ['form_name' => __('Tags Detached From Leads', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_leads', 'skipPrimaryKey' => true, 'note' => __('Runs when tags are detached from leads (bulk).', 'bit-integrations')],
            ['form_name' => __('Contact Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/contact_created', 'skipPrimaryKey' => true, 'note' => __('Runs when a contact is created.', 'bit-integrations')],
            ['form_name' => __('Contact Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/contact_updated', 'skipPrimaryKey' => true, 'note' => __('Runs when a contact is updated.', 'bit-integrations')],
            ['form_name' => __('Contact Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/contacts_trashed', 'skipPrimaryKey' => true, 'note' => __('Runs when one or more contacts are trashed.', 'bit-integrations')],
            ['form_name' => __('Tag Attached To Contact', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_contact', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is attached to a contact.', 'bit-integrations')],
            ['form_name' => __('Tag Detached From Contact', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_contact', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is detached from a contact.', 'bit-integrations')],
            ['form_name' => __('Tags Attached To Contacts', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_contacts', 'skipPrimaryKey' => true, 'note' => __('Runs when tags are attached to contacts (bulk).', 'bit-integrations')],
            ['form_name' => __('Tags Detached From Contacts', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_contacts', 'skipPrimaryKey' => true, 'note' => __('Runs when tags are detached from contacts (bulk).', 'bit-integrations')],
            ['form_name' => __('Company Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/company_created', 'skipPrimaryKey' => true, 'note' => __('Runs when a company is created.', 'bit-integrations')],
            ['form_name' => __('Company Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/company_updated', 'skipPrimaryKey' => true, 'note' => __('Runs when a company is updated.', 'bit-integrations')],
            ['form_name' => __('Company Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/companies_trashed', 'skipPrimaryKey' => true, 'note' => __('Runs when one or more companies are trashed.', 'bit-integrations')],
            ['form_name' => __('Tag Attached To Company', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_company', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is attached to a company.', 'bit-integrations')],
            ['form_name' => __('Tag Detached From Company', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_company', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is detached from a company.', 'bit-integrations')],
            ['form_name' => __('Tags Attached To Companies', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_companies', 'skipPrimaryKey' => true, 'note' => __('Runs when tags are attached to companies (bulk).', 'bit-integrations')],
            ['form_name' => __('Tags Detached From Companies', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_companies', 'skipPrimaryKey' => true, 'note' => __('Runs when tags are detached from companies (bulk).', 'bit-integrations')],
            ['form_name' => __('Deal Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/deal_created', 'skipPrimaryKey' => true, 'note' => __('Runs when a deal is created.', 'bit-integrations')],
            ['form_name' => __('Deal Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/deal_updated', 'skipPrimaryKey' => true, 'note' => __('Runs when a deal is updated.', 'bit-integrations')],
            ['form_name' => __('Deal Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/deals_trashed', 'skipPrimaryKey' => true, 'note' => __('Runs when one or more deals are trashed.', 'bit-integrations')],
            ['form_name' => __('Deal Stage Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/deal_stage_updated', 'skipPrimaryKey' => true, 'note' => __('Runs when a deal\'s stage changes.', 'bit-integrations')],
            ['form_name' => __('Tag Attached To Deal', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_deal', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is attached to a deal.', 'bit-integrations')],
            ['form_name' => __('Tag Detached From Deal', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_deal', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is detached from a deal.', 'bit-integrations')],
            ['form_name' => __('Tags Attached To Deals', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_deals', 'skipPrimaryKey' => true, 'note' => __('Runs when tags are attached to deals (bulk).', 'bit-integrations')],
            ['form_name' => __('Tags Detached From Deals', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_deals', 'skipPrimaryKey' => true, 'note' => __('Runs when tags are detached from deals (bulk).', 'bit-integrations')],
            ['form_name' => __('Product Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/product_created', 'skipPrimaryKey' => true, 'note' => __('Runs when a product is created.', 'bit-integrations')],
            ['form_name' => __('Product Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/product_updated', 'skipPrimaryKey' => true, 'note' => __('Runs when a product is updated.', 'bit-integrations')],
            ['form_name' => __('Product Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/products_trashed', 'skipPrimaryKey' => true, 'note' => __('Runs when one or more products are trashed.', 'bit-integrations')],
            ['form_name' => __('Tag Attached To Product', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_product', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is attached to a product.', 'bit-integrations')],
            ['form_name' => __('Tag Detached From Product', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_product', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is detached from a product.', 'bit-integrations')],
            ['form_name' => __('Tags Attached To Products', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_products', 'skipPrimaryKey' => true, 'note' => __('Runs when tags are attached to products (bulk).', 'bit-integrations')],
            ['form_name' => __('Tags Detached From Products', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_products', 'skipPrimaryKey' => true, 'note' => __('Runs when tags are detached from products (bulk).', 'bit-integrations')],
            ['form_name' => __('Tag Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_created', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is created.', 'bit-integrations')],
            ['form_name' => __('Tag Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_updated', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is updated.', 'bit-integrations')],
            ['form_name' => __('Tag Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_deleted', 'skipPrimaryKey' => true, 'note' => __('Runs when a tag is deleted.', 'bit-integrations')],
            ['form_name' => __('Note Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/note_created', 'skipPrimaryKey' => true, 'note' => __('Runs when a note is created.', 'bit-integrations')],
            ['form_name' => __('Note Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/note_updated', 'skipPrimaryKey' => true, 'note' => __('Runs when a note is updated.', 'bit-integrations')],
            ['form_name' => __('Note Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/note_deleted', 'skipPrimaryKey' => true, 'note' => __('Runs when a note is deleted.', 'bit-integrations')],
            ['form_name' => __('Activity Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/activity_created', 'skipPrimaryKey' => true, 'note' => __('Runs when an activity is created.', 'bit-integrations')],
            ['form_name' => __('Activity Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/activity_updated', 'skipPrimaryKey' => true, 'note' => __('Runs when an activity is updated.', 'bit-integrations')],
            ['form_name' => __('Activity Status Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/activity_status_updated', 'skipPrimaryKey' => true, 'note' => __('Runs when an activity\'s status changes.', 'bit-integrations')],
            ['form_name' => __('Activity Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/activity_deleted', 'skipPrimaryKey' => true, 'note' => __('Runs when an activity is deleted.', 'bit-integrations')],
            ['form_name' => __('Invoice Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/invoice_created', 'skipPrimaryKey' => true, 'note' => __('Runs when an invoice is created.', 'bit-integrations')],
            ['form_name' => __('Invoice Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/invoice_updated', 'skipPrimaryKey' => true, 'note' => __('Runs when an invoice is updated.', 'bit-integrations')],
            ['form_name' => __('Invoice Status Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/invoice_status_updated', 'skipPrimaryKey' => true, 'note' => __('Runs when an invoice\'s status changes.', 'bit-integrations')],
            ['form_name' => __('Invoice Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/invoices_trashed', 'skipPrimaryKey' => true, 'note' => __('Runs when one or more invoices are trashed.', 'bit-integrations')]
        ]);
    }

    public static function handleLeadCreated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/lead_created', $formData);
    }
    public static function handleLeadUpdated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/lead_updated', $formData);
    }
    public static function handleLeadsTrashed($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg1)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(['ids' => implode(',', (array) $arg1)]);

        return static::flowExecute('bit_crm/leads_trashed', $formData);
    }
    public static function handleLeadConverted($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg1)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(['ids' => implode(',', (array) $arg1)]);

        return static::flowExecute('bit_crm/leads_converted_to_contact', $formData);
    }
    public static function handleLeadTagAttached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(array_merge(static::normalize($arg1), ['entity_id' => $arg2]));

        return static::flowExecute('bit_crm/tag_attached_to_lead', $formData);
    }
    public static function handleLeadTagDetached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(array_merge(static::normalize($arg1), ['entity_id' => $arg2]));

        return static::flowExecute('bit_crm/tag_detached_from_lead', $formData);
    }
    public static function handleLeadTagsAttached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields([
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);

        return static::flowExecute('bit_crm/tags_attached_to_leads', $formData);
    }
    public static function handleLeadTagsDetached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields([
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);

        return static::flowExecute('bit_crm/tags_detached_from_leads', $formData);
    }
    public static function handleContactCreated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/contact_created', $formData);
    }
    public static function handleContactUpdated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/contact_updated', $formData);
    }
    public static function handleContactsTrashed($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg1)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(['ids' => implode(',', (array) $arg1)]);

        return static::flowExecute('bit_crm/contacts_trashed', $formData);
    }
    public static function handleContactTagAttached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(array_merge(static::normalize($arg1), ['entity_id' => $arg2]));

        return static::flowExecute('bit_crm/tag_attached_to_contact', $formData);
    }
    public static function handleContactTagDetached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(array_merge(static::normalize($arg1), ['entity_id' => $arg2]));

        return static::flowExecute('bit_crm/tag_detached_from_contact', $formData);
    }
    public static function handleContactTagsAttached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields([
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);

        return static::flowExecute('bit_crm/tags_attached_to_contacts', $formData);
    }
    public static function handleContactTagsDetached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields([
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);

        return static::flowExecute('bit_crm/tags_detached_from_contacts', $formData);
    }
    public static function handleCompanyCreated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/company_created', $formData);
    }
    public static function handleCompanyUpdated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/company_updated', $formData);
    }
    public static function handleCompaniesTrashed($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg1)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(['ids' => implode(',', (array) $arg1)]);

        return static::flowExecute('bit_crm/companies_trashed', $formData);
    }
    public static function handleCompanyTagAttached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(array_merge(static::normalize($arg1), ['entity_id' => $arg2]));

        return static::flowExecute('bit_crm/tag_attached_to_company', $formData);
    }
    public static function handleCompanyTagDetached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(array_merge(static::normalize($arg1), ['entity_id' => $arg2]));

        return static::flowExecute('bit_crm/tag_detached_from_company', $formData);
    }
    public static function handleCompanyTagsAttached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields([
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);

        return static::flowExecute('bit_crm/tags_attached_to_companies', $formData);
    }
    public static function handleCompanyTagsDetached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields([
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);

        return static::flowExecute('bit_crm/tags_detached_from_companies', $formData);
    }
    public static function handleDealCreated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/deal_created', $formData);
    }
    public static function handleDealUpdated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/deal_updated', $formData);
    }
    public static function handleDealsTrashed($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg1)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(['ids' => implode(',', (array) $arg1)]);

        return static::flowExecute('bit_crm/deals_trashed', $formData);
    }
    public static function handleDealStageUpdated($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg1)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(array_merge(static::normalize($arg1), ['stage' => $arg2]));

        return static::flowExecute('bit_crm/deal_stage_updated', $formData);
    }
    public static function handleDealTagAttached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(array_merge(static::normalize($arg1), ['entity_id' => $arg2]));

        return static::flowExecute('bit_crm/tag_attached_to_deal', $formData);
    }
    public static function handleDealTagDetached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(array_merge(static::normalize($arg1), ['entity_id' => $arg2]));

        return static::flowExecute('bit_crm/tag_detached_from_deal', $formData);
    }
    public static function handleDealTagsAttached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields([
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);

        return static::flowExecute('bit_crm/tags_attached_to_deals', $formData);
    }
    public static function handleDealTagsDetached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields([
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);

        return static::flowExecute('bit_crm/tags_detached_from_deals', $formData);
    }
    public static function handleProductCreated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/product_created', $formData);
    }
    public static function handleProductUpdated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/product_updated', $formData);
    }
    public static function handleProductsTrashed($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg1)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(['ids' => implode(',', (array) $arg1)]);

        return static::flowExecute('bit_crm/products_trashed', $formData);
    }
    public static function handleProductTagAttached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(array_merge(static::normalize($arg1), ['entity_id' => $arg2]));

        return static::flowExecute('bit_crm/tag_attached_to_product', $formData);
    }
    public static function handleProductTagDetached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(array_merge(static::normalize($arg1), ['entity_id' => $arg2]));

        return static::flowExecute('bit_crm/tag_detached_from_product', $formData);
    }
    public static function handleProductTagsAttached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields([
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);

        return static::flowExecute('bit_crm/tags_attached_to_products', $formData);
    }
    public static function handleProductTagsDetached($arg1, $arg2 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg2)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields([
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);

        return static::flowExecute('bit_crm/tags_detached_from_products', $formData);
    }
    public static function handleTagCreated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/tag_created', $formData);
    }
    public static function handleTagUpdated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/tag_updated', $formData);
    }
    public static function handleTagDeleted($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg1)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(['id' => $arg1]);

        return static::flowExecute('bit_crm/tag_deleted', $formData);
    }
    public static function handleNoteCreated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/note_created', $formData);
    }
    public static function handleNoteUpdated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/note_updated', $formData);
    }
    public static function handleNoteDeleted($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg1)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(['id' => $arg1]);

        return static::flowExecute('bit_crm/note_deleted', $formData);
    }
    public static function handleActivityCreated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/activity_created', $formData);
    }
    public static function handleActivityUpdated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/activity_updated', $formData);
    }
    public static function handleActivityStatusUpdated($arg1, $arg2 = null, $arg3 = null)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg1)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(array_merge(static::normalize($arg1), ['new_status' => $arg2, 'old_status' => $arg3]));

        return static::flowExecute('bit_crm/activity_status_updated', $formData);
    }
    public static function handleActivityDeleted($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg1)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(['id' => $arg1]);

        return static::flowExecute('bit_crm/activity_deleted', $formData);
    }
    public static function handleInvoiceCreated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/invoice_created', $formData);
    }
    public static function handleInvoiceUpdated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/invoice_updated', $formData);
    }
    public static function handleInvoiceStatusUpdated($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty(${arg1})) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(static::normalize($arg1));

        return static::flowExecute('bit_crm/invoice_status_updated', $formData);
    }
    public static function handleInvoicesTrashed($arg1)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');

        if (empty($arg1)) {
            return;
        }

        $formData = $helperClass::prepareFetchFormatFields(['ids' => implode(',', (array) $arg1)]);

        return static::flowExecute('bit_crm/invoices_trashed', $formData);
    }

    private static function flowExecute($triggered_entity_id, $formData)
    {
        $helperClass = bit_integrations_get_class('Core\\Util\\Helper');
        $flowClass   = bit_integrations_get_class('Flow\\Flow');

        if (empty($formData) || !\is_array($formData)) {
            return;
        }

        $helperClass::setTestData(Config::withPrefix("{$triggered_entity_id}_test"), array_values($formData));

        $flows = $flowClass::exists('BitCrm', $triggered_entity_id);
        if (empty($flows)) {
            return;
        }

        $flowClass::execute('BitCrm', $triggered_entity_id, array_column($formData, 'value', 'name'), $flows);

        return ['type' => 'success'];
    }

    private static function normalize($entity)
    {
        if (\is_object($entity) && method_exists($entity, 'getAttributes')) {
            return $entity->getAttributes();
        }

        if (\is_object($entity) && method_exists($entity, 'toArray')) {
            return $entity->toArray();
        }

        return (array) $entity;
    }

    private static function isPluginInstalled()
    {
        return class_exists('BitApps\\Crm\\Config');
    }
}
