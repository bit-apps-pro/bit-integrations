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
            'documentation_url' => 'https://bit-integrations.com/wp-docs/trigger/bit-crm-integration-as-a-trigger/',
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

    public function getAllEvents()
    {
        if (!self::isPluginInstalled()) {
            // translators: %s: Plugin name
            wp_send_json_error(\sprintf(__('%s is not installed or activated', 'bit-integrations'), 'Bit CRM'));
        }

        wp_send_json_success(self::events());
    }

    public static function handleLeadCreated($lead)
    {
        if (empty($lead)) {
            return;
        }

        return self::flowExecute('bit_crm/lead_created', self::normalize($lead));
    }

    public static function handleLeadUpdated($lead)
    {
        if (empty($lead)) {
            return;
        }

        return self::flowExecute('bit_crm/lead_updated', self::normalize($lead));
    }

    public static function handleLeadsTrashed($ids)
    {
        if (empty($ids)) {
            return;
        }

        return self::flowExecute('bit_crm/leads_trashed', ['ids' => implode(',', (array) $ids)]);
    }

    public static function handleLeadConverted($ids)
    {
        if (empty($ids)) {
            return;
        }

        return self::flowExecute('bit_crm/leads_converted_to_contact', ['ids' => implode(',', (array) $ids)]);
    }

    public static function handleLeadTagAttached($tag, $leadId = null)
    {
        if (empty($leadId)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_attached_to_lead', array_merge(self::normalize($tag), ['entity_id' => $leadId]));
    }

    public static function handleLeadTagDetached($tagId, $leadId = null)
    {
        if (empty($leadId)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_detached_from_lead', array_merge(self::normalize($tagId), ['entity_id' => $leadId]));
    }

    public static function handleLeadTagsAttached($tagIds, $leadIds = null)
    {
        if (empty($leadIds)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_attached_to_leads', [
            'tag_ids'    => implode(',', (array) $tagIds),
            'entity_ids' => implode(',', (array) $leadIds),
        ]);
    }

    public static function handleLeadTagsDetached($tagIds, $leadIds = null)
    {
        if (empty($leadIds)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_detached_from_leads', [
            'tag_ids'    => implode(',', (array) $tagIds),
            'entity_ids' => implode(',', (array) $leadIds),
        ]);
    }

    public static function handleContactCreated($contact)
    {
        if (empty($contact)) {
            return;
        }

        return self::flowExecute('bit_crm/contact_created', self::normalize($contact));
    }

    public static function handleContactUpdated($contact)
    {
        if (empty($contact)) {
            return;
        }

        return self::flowExecute('bit_crm/contact_updated', self::normalize($contact));
    }

    public static function handleContactsTrashed($ids)
    {
        if (empty($ids)) {
            return;
        }

        return self::flowExecute('bit_crm/contacts_trashed', ['ids' => implode(',', (array) $ids)]);
    }

    public static function handleContactTagAttached($tag, $contactId = null)
    {
        if (empty($contactId)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_attached_to_contact', array_merge(self::normalize($tag), ['entity_id' => $contactId]));
    }

    public static function handleContactTagDetached($tagId, $contactId = null)
    {
        if (empty($contactId)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_detached_from_contact', array_merge(self::normalize($tagId), ['entity_id' => $contactId]));
    }

    public static function handleContactTagsAttached($tagIds, $contactIds = null)
    {
        if (empty($contactIds)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_attached_to_contacts', [
            'tag_ids'    => implode(',', (array) $tagIds),
            'entity_ids' => implode(',', (array) $contactIds),
        ]);
    }

    public static function handleContactTagsDetached($tagIds, $contactIds = null)
    {
        if (empty($contactIds)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_detached_from_contacts', [
            'tag_ids'    => implode(',', (array) $tagIds),
            'entity_ids' => implode(',', (array) $contactIds),
        ]);
    }

    public static function handleCompanyCreated($company)
    {
        if (empty($company)) {
            return;
        }

        return self::flowExecute('bit_crm/company_created', self::normalize($company));
    }

    public static function handleCompanyUpdated($company)
    {
        if (empty($company)) {
            return;
        }

        return self::flowExecute('bit_crm/company_updated', self::normalize($company));
    }

    public static function handleCompaniesTrashed($ids)
    {
        if (empty($ids)) {
            return;
        }

        return self::flowExecute('bit_crm/companies_trashed', ['ids' => implode(',', (array) $ids)]);
    }

    public static function handleCompanyTagAttached($tag, $companyId = null)
    {
        if (empty($companyId)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_attached_to_company', array_merge(self::normalize($tag), ['entity_id' => $companyId]));
    }

    public static function handleCompanyTagDetached($tagId, $companyId = null)
    {
        if (empty($companyId)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_detached_from_company', array_merge(self::normalize($tagId), ['entity_id' => $companyId]));
    }

    public static function handleCompanyTagsAttached($tagIds, $companyIds = null)
    {
        if (empty($companyIds)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_attached_to_companies', [
            'tag_ids'    => implode(',', (array) $tagIds),
            'entity_ids' => implode(',', (array) $companyIds),
        ]);
    }

    public static function handleCompanyTagsDetached($tagIds, $companyIds = null)
    {
        if (empty($companyIds)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_detached_from_companies', [
            'tag_ids'    => implode(',', (array) $tagIds),
            'entity_ids' => implode(',', (array) $companyIds),
        ]);
    }

    public static function handleDealCreated($deal)
    {
        if (empty($deal)) {
            return;
        }

        return self::flowExecute('bit_crm/deal_created', self::normalize($deal));
    }

    public static function handleDealUpdated($deal)
    {
        if (empty($deal)) {
            return;
        }

        return self::flowExecute('bit_crm/deal_updated', self::normalize($deal));
    }

    public static function handleDealsTrashed($ids)
    {
        if (empty($ids)) {
            return;
        }

        return self::flowExecute('bit_crm/deals_trashed', ['ids' => implode(',', (array) $ids)]);
    }

    public static function handleDealStageUpdated($deal, $stage = null)
    {
        if (empty($deal)) {
            return;
        }

        return self::flowExecute('bit_crm/deal_stage_updated', array_merge(self::normalize($deal), ['stage' => $stage]));
    }

    public static function handleDealTagAttached($tag, $dealId = null)
    {
        if (empty($dealId)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_attached_to_deal', array_merge(self::normalize($tag), ['entity_id' => $dealId]));
    }

    public static function handleDealTagDetached($tagId, $dealId = null)
    {
        if (empty($dealId)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_detached_from_deal', array_merge(self::normalize($tagId), ['entity_id' => $dealId]));
    }

    public static function handleDealTagsAttached($tagIds, $dealIds = null)
    {
        if (empty($dealIds)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_attached_to_deals', [
            'tag_ids'    => implode(',', (array) $tagIds),
            'entity_ids' => implode(',', (array) $dealIds),
        ]);
    }

    public static function handleDealTagsDetached($tagIds, $dealIds = null)
    {
        if (empty($dealIds)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_detached_from_deals', [
            'tag_ids'    => implode(',', (array) $tagIds),
            'entity_ids' => implode(',', (array) $dealIds),
        ]);
    }

    public static function handleProductCreated($product)
    {
        if (empty($product)) {
            return;
        }

        return self::flowExecute('bit_crm/product_created', self::normalize($product));
    }

    public static function handleProductUpdated($product)
    {
        if (empty($product)) {
            return;
        }

        return self::flowExecute('bit_crm/product_updated', self::normalize($product));
    }

    public static function handleProductsTrashed($ids)
    {
        if (empty($ids)) {
            return;
        }

        return self::flowExecute('bit_crm/products_trashed', ['ids' => implode(',', (array) $ids)]);
    }

    public static function handleProductTagAttached($tag, $productId = null)
    {
        if (empty($productId)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_attached_to_product', array_merge(self::normalize($tag), ['entity_id' => $productId]));
    }

    public static function handleProductTagDetached($tagId, $productId = null)
    {
        if (empty($productId)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_detached_from_product', array_merge(self::normalize($tagId), ['entity_id' => $productId]));
    }

    public static function handleProductTagsAttached($tagIds, $productIds = null)
    {
        if (empty($productIds)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_attached_to_products', [
            'tag_ids'    => implode(',', (array) $tagIds),
            'entity_ids' => implode(',', (array) $productIds),
        ]);
    }

    public static function handleProductTagsDetached($tagIds, $productIds = null)
    {
        if (empty($productIds)) {
            return;
        }

        return self::flowExecute('bit_crm/tags_detached_from_products', [
            'tag_ids'    => implode(',', (array) $tagIds),
            'entity_ids' => implode(',', (array) $productIds),
        ]);
    }

    public static function handleTagCreated($tag)
    {
        if (empty($tag)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_created', self::normalize($tag));
    }

    public static function handleTagUpdated($tag)
    {
        if (empty($tag)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_updated', self::normalize($tag));
    }

    public static function handleTagDeleted($id)
    {
        if (empty($id)) {
            return;
        }

        return self::flowExecute('bit_crm/tag_deleted', ['id' => $id]);
    }

    public static function handleNoteCreated($note)
    {
        if (empty($note)) {
            return;
        }

        return self::flowExecute('bit_crm/note_created', self::normalize($note));
    }

    public static function handleNoteUpdated($note)
    {
        if (empty($note)) {
            return;
        }

        return self::flowExecute('bit_crm/note_updated', self::normalize($note));
    }

    public static function handleNoteDeleted($id)
    {
        if (empty($id)) {
            return;
        }

        return self::flowExecute('bit_crm/note_deleted', ['id' => $id]);
    }

    public static function handleActivityCreated($activity)
    {
        if (empty($activity)) {
            return;
        }

        return self::activityEvent('created', $activity);
    }

    public static function handleActivityUpdated($activity)
    {
        if (empty($activity)) {
            return;
        }

        return self::activityEvent('updated', $activity);
    }

    public static function handleActivityStatusUpdated($activity, $newStatus = null, $oldStatus = null)
    {
        if (empty($activity)) {
            return;
        }

        return self::activityEvent('status_updated', $activity, ['new_status' => $newStatus, 'old_status' => $oldStatus]);
    }

    public static function handleActivityDeleted($activity)
    {
        if (empty($activity)) {
            return;
        }

        return self::activityEvent('deleted', $activity);
    }

    public static function handleAttachmentCreated($attachment)
    {
        if (empty($attachment)) {
            return;
        }

        return self::flowExecute('bit_crm/attachment_created', self::normalize($attachment));
    }

    public static function handleAttachmentDeleted($id)
    {
        if (empty($id)) {
            return;
        }

        return self::flowExecute('bit_crm/attachment_deleted', ['id' => $id]);
    }

    public static function handleLinkCreated($link)
    {
        if (empty($link)) {
            return;
        }

        return self::flowExecute('bit_crm/link_created', self::normalize($link));
    }

    public static function handleLinkUpdated($link)
    {
        if (empty($link)) {
            return;
        }

        return self::flowExecute('bit_crm/link_updated', self::normalize($link));
    }

    public static function handleLinkDeleted($id)
    {
        if (empty($id)) {
            return;
        }

        return self::flowExecute('bit_crm/link_deleted', ['id' => $id]);
    }

    public static function handlePortalAccessGranted($contact, $email = '')
    {
        return self::portalEvent('bit_crm/client_portal_access_granted', $contact, $email);
    }

    public static function handlePortalAccessRevoked($contact, $email = '')
    {
        return self::portalEvent('bit_crm/client_portal_access_revoked', $contact, $email);
    }

    public static function handleInvoiceCreated($invoice)
    {
        if (empty($invoice)) {
            return;
        }

        return self::flowExecute('bit_crm/invoice_created', self::normalize($invoice));
    }

    public static function handleInvoiceUpdated($invoice)
    {
        if (empty($invoice)) {
            return;
        }

        return self::flowExecute('bit_crm/invoice_updated', self::normalize($invoice));
    }

    public static function handleInvoiceStatusUpdated($invoice)
    {
        if (empty($invoice)) {
            return;
        }

        return self::flowExecute('bit_crm/invoice_status_updated', self::normalize($invoice));
    }

    public static function handleInvoicesTrashed($ids)
    {
        if (empty($ids)) {
            return;
        }

        return self::flowExecute('bit_crm/invoices_trashed', ['ids' => implode(',', (array) $ids)]);
    }

    /**
     * Bit CRM fires one hook for tasks, meetings and calls alike, because they
     * share the activities table and differ only by `type`. Dispatch the
     * type-specific event that hook belongs to.
     *
     * The typed ids (`bit_crm/task_created`, …) are flow keys, not WordPress
     * hooks — no such hook exists.
     *
     * @param string $event    one of created|updated|status_updated
     * @param mixed  $activity
     * @param array  $extra
     */
    private static function activityEvent($event, $activity, $extra = [])
    {
        $data = array_merge(self::normalize($activity), $extra);

        $type = $data['type'] ?? '';
        if (!\in_array($type, ['task', 'meeting', 'call'], true)) {
            return;
        }

        return self::flowExecute("bit_crm/{$type}_{$event}", $data);
    }

    /**
     * Dispatch a client portal event as the contact's fields plus the portal
     * email. Revoking can start from a WordPress user that has no CRM contact,
     * so the contact may be null and the email is the only certainty.
     *
     * @param string $triggered_entity_id
     * @param mixed  $contact
     * @param mixed  $email
     */
    private static function portalEvent($triggered_entity_id, $contact, $email)
    {
        $data = empty($contact) ? [] : self::normalize($contact);
        $data['email'] = (string) $email;

        return self::flowExecute($triggered_entity_id, $data);
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

    private static function events()
    {
        return [
            ['form_name' => __('Lead Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/lead_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Lead Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/lead_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Lead Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/leads_trashed', 'skipPrimaryKey' => true],
            ['form_name' => __('Lead Converted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/leads_converted_to_contact', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Attached To Lead', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_lead', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Detached From Lead', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_lead', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Attached To Leads (Bulk)', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_leads', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Detached From Leads (Bulk)', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_leads', 'skipPrimaryKey' => true],
            ['form_name' => __('Contact Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/contact_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Contact Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/contact_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Contact Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/contacts_trashed', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Attached To Contact', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_contact', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Detached From Contact', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_contact', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Attached To Contacts (Bulk)', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_contacts', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Detached From Contacts (Bulk)', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_contacts', 'skipPrimaryKey' => true],
            ['form_name' => __('Company Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/company_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Company Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/company_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Company Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/companies_trashed', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Attached To Company', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_company', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Detached From Company', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_company', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Attached To Companies (Bulk)', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_companies', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Detached From Companies (Bulk)', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_companies', 'skipPrimaryKey' => true],
            ['form_name' => __('Deal Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/deal_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Deal Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/deal_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Deal Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/deals_trashed', 'skipPrimaryKey' => true],
            ['form_name' => __('Deal Stage Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/deal_stage_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Attached To Deal', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_deal', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Detached From Deal', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_deal', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Attached To Deals (Bulk)', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_deals', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Detached From Deals (Bulk)', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_deals', 'skipPrimaryKey' => true],
            ['form_name' => __('Product Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/product_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Product Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/product_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Product Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/products_trashed', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Attached To Product', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_attached_to_product', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Detached From Product', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_detached_from_product', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Attached To Products (Bulk)', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_attached_to_products', 'skipPrimaryKey' => true],
            ['form_name' => __('Tags Detached From Products (Bulk)', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tags_detached_from_products', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Tag Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/tag_deleted', 'skipPrimaryKey' => true],
            ['form_name' => __('Note Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/note_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Note Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/note_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Note Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/note_deleted', 'skipPrimaryKey' => true],
            // Bit CRM fires one hook per activity event; these are dispatched from it,
            // filtered by the activity type.
            ['form_name' => __('Task Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/task_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Task Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/task_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Task Status Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/task_status_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Task Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/task_deleted', 'skipPrimaryKey' => true],
            ['form_name' => __('Meeting Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/meeting_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Meeting Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/meeting_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Meeting Status Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/meeting_status_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Meeting Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/meeting_deleted', 'skipPrimaryKey' => true],
            ['form_name' => __('Call Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/call_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Call Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/call_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Call Status Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/call_status_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Call Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/call_deleted', 'skipPrimaryKey' => true],
            ['form_name' => __('Attachment Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/attachment_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Attachment Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/attachment_deleted', 'skipPrimaryKey' => true],
            ['form_name' => __('Link Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/link_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Link Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/link_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Link Deleted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/link_deleted', 'skipPrimaryKey' => true],
            ['form_name' => __('Invoice Created', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/invoice_created', 'skipPrimaryKey' => true],
            ['form_name' => __('Invoice Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/invoice_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Invoice Status Updated', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/invoice_status_updated', 'skipPrimaryKey' => true],
            ['form_name' => __('Invoice Trashed', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/invoices_trashed', 'skipPrimaryKey' => true],
            // Bit CRM Pro owns the client portal, so these stay silent without it.
            ['form_name' => __('Client Portal Access Granted', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/client_portal_access_granted', 'skipPrimaryKey' => true],
            ['form_name' => __('Client Portal Access Revoked', 'bit-integrations'), 'triggered_entity_id' => 'bit_crm/client_portal_access_revoked', 'skipPrimaryKey' => true]
        ];
    }
}
