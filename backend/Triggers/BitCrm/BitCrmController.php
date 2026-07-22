<?php

namespace BitApps\Integrations\Triggers\BitCrm;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Flow\Flow;

final class BitCrmController
{
    public static function info()
    {
        return [
            'name'              => 'Bit CRM',
            'title'             => __('Bit CRM: Leads, Contacts, Deals & Invoices', 'bit-integrations'),
            'type'              => 'custom_form_submission',
            'is_active'         => self::isPluginInstalled(),
            'documentation_url' => '#',
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
        if (!self::isPluginInstalled()) {
            wp_send_json_error(\sprintf(__('%s is not installed or activated', 'bit-integrations'), 'Bit CRM'));
        }

        wp_send_json_success(self::tasks());
    }

    public static function handleLeadCreated($arg1)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/lead_created', self::normalize($arg1));
    }

    public static function handleLeadUpdated($arg1)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/lead_updated', self::normalize($arg1));
    }

    public static function handleLeadsTrashed($arg1)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/leads_trashed', ['ids' => implode(',', (array) $arg1)]);
    }

    public static function handleLeadConverted($arg1)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/leads_converted_to_contact', ['ids' => implode(',', (array) $arg1)]);
    }

    public static function handleLeadTagAttached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_attached_to_lead', array_merge(self::normalize($arg1), ['entity_id' => $arg2]));
    }

    public static function handleLeadTagDetached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_detached_from_lead', array_merge(self::normalize($arg1), ['entity_id' => $arg2]));
    }

    public static function handleLeadTagsAttached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_attached_to_leads', [
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);
    }

    public static function handleLeadTagsDetached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_detached_from_leads', [
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);
    }

    public static function handleContactCreated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/contact_created', self::normalize($arg1));
    }

    public static function handleContactUpdated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/contact_updated', self::normalize($arg1));
    }

    public static function handleContactsTrashed($arg1)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/contacts_trashed', ['ids' => implode(',', (array) $arg1)]);
    }

    public static function handleContactTagAttached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_attached_to_contact', array_merge(self::normalize($arg1), ['entity_id' => $arg2]));
    }

    public static function handleContactTagDetached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_detached_from_contact', array_merge(self::normalize($arg1), ['entity_id' => $arg2]));
    }

    public static function handleContactTagsAttached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_attached_to_contacts', [
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);
    }

    public static function handleContactTagsDetached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_detached_from_contacts', [
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);
    }

    public static function handleCompanyCreated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/company_created', self::normalize($arg1));
    }

    public static function handleCompanyUpdated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/company_updated', self::normalize($arg1));
    }

    public static function handleCompaniesTrashed($arg1)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/companies_trashed', ['ids' => implode(',', (array) $arg1)]);
    }

    public static function handleCompanyTagAttached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_attached_to_company', array_merge(self::normalize($arg1), ['entity_id' => $arg2]));
    }

    public static function handleCompanyTagDetached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_detached_from_company', array_merge(self::normalize($arg1), ['entity_id' => $arg2]));
    }

    public static function handleCompanyTagsAttached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_attached_to_companies', [
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);
    }

    public static function handleCompanyTagsDetached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_detached_from_companies', [
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);
    }

    public static function handleDealCreated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/deal_created', self::normalize($arg1));
    }

    public static function handleDealUpdated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/deal_updated', self::normalize($arg1));
    }

    public static function handleDealsTrashed($arg1)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/deals_trashed', ['ids' => implode(',', (array) $arg1)]);
    }

    public static function handleDealStageUpdated($arg1, $arg2 = null)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/deal_stage_updated', array_merge(self::normalize($arg1), ['stage' => $arg2]));
    }

    public static function handleDealTagAttached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_attached_to_deal', array_merge(self::normalize($arg1), ['entity_id' => $arg2]));
    }

    public static function handleDealTagDetached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_detached_from_deal', array_merge(self::normalize($arg1), ['entity_id' => $arg2]));
    }

    public static function handleDealTagsAttached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_attached_to_deals', [
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);
    }

    public static function handleDealTagsDetached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_detached_from_deals', [
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);
    }

    public static function handleProductCreated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/product_created', self::normalize($arg1));
    }

    public static function handleProductUpdated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/product_updated', self::normalize($arg1));
    }

    public static function handleProductsTrashed($arg1)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/products_trashed', ['ids' => implode(',', (array) $arg1)]);
    }

    public static function handleProductTagAttached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_attached_to_product', array_merge(self::normalize($arg1), ['entity_id' => $arg2]));
    }

    public static function handleProductTagDetached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_detached_from_product', array_merge(self::normalize($arg1), ['entity_id' => $arg2]));
    }

    public static function handleProductTagsAttached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_attached_to_products', [
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);
    }

    public static function handleProductTagsDetached($arg1, $arg2 = null)
    {
        if (empty($arg2)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_detached_from_products', [
            'tag_ids'    => implode(',', (array) $arg1),
            'entity_ids' => implode(',', (array) $arg2),
        ]);
    }

    public static function handleTagCreated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/tag_created', self::normalize($arg1));
    }

    public static function handleTagUpdated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/tag_updated', self::normalize($arg1));
    }

    public static function handleTagDeleted($arg1)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_deleted', ['id' => $arg1]);
    }

    public static function handleNoteCreated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/note_created', self::normalize($arg1));
    }

    public static function handleNoteUpdated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/note_updated', self::normalize($arg1));
    }

    public static function handleNoteDeleted($arg1)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/note_deleted', ['id' => $arg1]);
    }

    public static function handleActivityCreated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/activity_created', self::normalize($arg1));
    }

    public static function handleActivityUpdated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/activity_updated', self::normalize($arg1));
    }

    public static function handleActivityStatusUpdated($arg1, $arg2 = null, $arg3 = null)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/activity_status_updated', array_merge(self::normalize($arg1), ['new_status' => $arg2, 'old_status' => $arg3]));
    }

    public static function handleActivityDeleted($arg1)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/activity_deleted', ['id' => $arg1]);
    }

    public static function handleInvoiceCreated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/invoice_created', self::normalize($arg1));
    }

    public static function handleInvoiceUpdated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/invoice_updated', self::normalize($arg1));
    }

    public static function handleInvoiceStatusUpdated($arg1)
    {
        if (empty(${arg1})) {
            return;
        }

        return self::flowExecute('bit_crm/invoice_status_updated', self::normalize($arg1));
    }

    public static function handleInvoicesTrashed($arg1)
    {
        if (empty($arg1)) {
            return;
        }

        return self::flowExecute('bit_crm/invoices_trashed', ['ids' => implode(',', (array) $arg1)]);
    }

    private static function flowExecute($triggered_entity_id, $data)
    {
        $formData = Helper::prepareFetchFormatFields($data);

        if (empty($formData) || !\is_array($formData)) {
            return;
        }

        Helper::setTestData(Config::withPrefix("{$triggered_entity_id}_test"), array_values($formData));

        $flows = Flow::exists('BitCrm', $triggered_entity_id);
        if (empty($flows)) {
            return;
        }

        Flow::execute('BitCrm', $triggered_entity_id, array_column($formData, 'value', 'name'), $flows);

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

    private static function tasks()
    {
        return [
            ['form_name' => __('Lead Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/lead_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Lead Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/lead_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Lead Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/leads_trashed', 'skipPrimaryKey' => true],
            ['form_name' => __('Lead Converted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/leads_converted_to_contact', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Attached To Lead', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_lead', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Detached From Lead', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_lead', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Attached To Leads', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_leads', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Detached From Leads', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_leads', 'skipPrimaryKey' => true],
            ['form_name' => __('Contact Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/contact_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Contact Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/contact_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Contact Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/contacts_trashed', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Attached To Contact', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_contact', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Detached From Contact', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_contact', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Attached To Contacts', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_contacts', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Detached From Contacts', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_contacts', 'skipPrimaryKey' => true],
            ['form_name' => __('Company Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/company_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Company Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/company_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Company Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/companies_trashed', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Attached To Company', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_company', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Detached From Company', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_company', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Attached To Companies', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_companies', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Detached From Companies', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_companies', 'skipPrimaryKey' => true],
            ['form_name' => __('Deal Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/deal_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Deal Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/deal_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Deal Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/deals_trashed', 'skipPrimaryKey' => true],
            ['form_name' => __('Deal Stage Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/deal_stage_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Attached To Deal', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_deal', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Detached From Deal', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_deal', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Attached To Deals', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_deals', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Detached From Deals', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_deals', 'skipPrimaryKey' => true],
            ['form_name' => __('Product Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/product_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Product Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/product_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Product Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/products_trashed', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Attached To Product', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_product', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Detached From Product', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_product', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Attached To Products', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_products', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Detached From Products', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_products', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_deleted', 'skipPrimaryKey' => true],
            ['form_name' => __('Note Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/note_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Note Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/note_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Note Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/note_deleted', 'skipPrimaryKey' => true],
            ['form_name' => __('Activity Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/activity_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Activity Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/activity_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Activity Status Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/activity_status_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Activity Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/activity_deleted', 'skipPrimaryKey' => true],
            ['form_name' => __('Invoice Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/invoice_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Invoice Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/invoice_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Invoice Status Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/invoice_status_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Invoice Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/invoices_trashed', 'skipPrimaryKey' => true]
        ];
    }
}
