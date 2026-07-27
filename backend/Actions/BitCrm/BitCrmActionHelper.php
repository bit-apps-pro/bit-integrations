<?php

namespace BitApps\Integrations\Actions\BitCrm;

use Throwable;

if (!defined('ABSPATH')) {
    exit;
}

final class BitCrmActionHelper
{
    public static function createLead($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\LeadService')) {
            return self::missing('BitApps\Crm\Services\LeadService');
        }

        $systemValues = self::systemValues($fieldData, ['tag_ids']);
        $error = self::validateRequired($systemValues, 'last_name');
        if ($error !== null) {
            return $error;
        }

        $payload = [
            'systemDefinedFieldsValues' => $systemValues,
            'tagIds'                    => self::toIntArray($fieldData['tag_ids'] ?? []),
        ];

        return self::result((new \BitApps\Crm\Services\LeadService())->store($payload), __('Lead created successfully.', 'bit-integrations'));
    }

    public static function updateLead($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\LeadService')) {
            return self::missing('BitApps\Crm\Services\LeadService');
        }

        if (empty($fieldData['lead_id'])) {
            return self::required('lead_id');
        }

        $payload = [
            'id'                        => (int) $fieldData['lead_id'],
            'systemDefinedFieldsValues' => self::systemValues($fieldData, ['lead_id', 'tag_ids']),
        ];

        return self::result((new \BitApps\Crm\Services\LeadService())->update($payload), __('Lead updated successfully.', 'bit-integrations'));
    }

    public static function deleteLead($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\LeadService')) {
            return self::missing('BitApps\Crm\Services\LeadService');
        }

        if (empty($fieldData['lead_id'])) {
            return self::required('lead_id');
        }

        return self::result((new \BitApps\Crm\Services\LeadService())->trash(['ids' => [(int) $fieldData['lead_id']]]), __('Lead deleted successfully.', 'bit-integrations'));
    }

    public static function addTagToLead($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\LeadService')) {
            return self::missing('BitApps\Crm\Services\LeadService');
        }

        if (empty($fieldData['lead_id'])) {
            return self::required('lead_id');
        }

        $tagIds = self::toIntArray($fieldData['tag_ids'] ?? []);
        $newTags = self::csvList($fieldData['new_tags'] ?? '');
        if (empty($tagIds) && empty($newTags)) {
            return ['success' => false, 'message' => __('At least one existing or new tag must be provided.', 'bit-integrations')];
        }

        $leadId = (int) $fieldData['lead_id'];
        $attached = (new \BitApps\Crm\Services\LeadService())->storeAndAttachTags($leadId, $tagIds, $newTags);

        if (!empty($attached)) {
            do_action('bit_crm/tags_attached_to_leads', $attached, [$leadId]);
        }

        return ['success' => true, 'message' => __('Tag attached to lead successfully.', 'bit-integrations')];
    }

    public static function removeTagFromLead($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\LeadService')) {
            return self::missing('BitApps\Crm\Services\LeadService');
        }

        if (empty($fieldData['lead_id'])) {
            return self::required('lead_id');
        }

        $detached = (new \BitApps\Crm\Services\LeadService())->detachTags((int) $fieldData['lead_id'], self::toIntArray($fieldData['tag_ids'] ?? []));
        if (!$detached) {
            return ['success' => false, 'message' => __('No matching tags were removed.', 'bit-integrations')];
        }

        return ['success' => true, 'message' => __('Tag removed from lead successfully.', 'bit-integrations')];
    }

    public static function createContact($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\ContactService')) {
            return self::missing('BitApps\Crm\Services\ContactService');
        }

        $systemValues = self::systemValues($fieldData, ['tag_ids']);
        $error = self::validateRequired($systemValues, 'last_name');
        if ($error !== null) {
            return $error;
        }

        $payload = [
            'systemDefinedFieldsValues' => $systemValues,
            'tagIds'                    => self::toIntArray($fieldData['tag_ids'] ?? []),
        ];

        return self::result((new \BitApps\Crm\Services\ContactService())->store($payload), __('Contact created successfully.', 'bit-integrations'));
    }

    public static function updateContact($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\ContactService')) {
            return self::missing('BitApps\Crm\Services\ContactService');
        }

        if (empty($fieldData['contact_id'])) {
            return self::required('contact_id');
        }

        $payload = [
            'id'                        => (int) $fieldData['contact_id'],
            'systemDefinedFieldsValues' => self::systemValues($fieldData, ['contact_id', 'tag_ids']),
        ];

        return self::result((new \BitApps\Crm\Services\ContactService())->update($payload), __('Contact updated successfully.', 'bit-integrations'));
    }

    public static function deleteContact($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\ContactService')) {
            return self::missing('BitApps\Crm\Services\ContactService');
        }

        if (empty($fieldData['contact_id'])) {
            return self::required('contact_id');
        }

        return self::result((new \BitApps\Crm\Services\ContactService())->trash(['ids' => [(int) $fieldData['contact_id']]]), __('Contact deleted successfully.', 'bit-integrations'));
    }

    public static function addTagToContact($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\ContactService')) {
            return self::missing('BitApps\Crm\Services\ContactService');
        }

        if (empty($fieldData['contact_id'])) {
            return self::required('contact_id');
        }

        $tagIds = self::toIntArray($fieldData['tag_ids'] ?? []);
        $newTags = self::csvList($fieldData['new_tags'] ?? '');
        if (empty($tagIds) && empty($newTags)) {
            return ['success' => false, 'message' => __('At least one existing or new tag must be provided.', 'bit-integrations')];
        }

        $contactId = (int) $fieldData['contact_id'];
        $attached = (new \BitApps\Crm\Services\ContactService())->storeAndAttachTags($contactId, $tagIds, $newTags);

        if (!empty($attached)) {
            do_action('bit_crm/tags_attached_to_contacts', $attached, [$contactId]);
        }

        return ['success' => true, 'message' => __('Tag attached to contact successfully.', 'bit-integrations')];
    }

    public static function removeTagFromContact($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\ContactService')) {
            return self::missing('BitApps\Crm\Services\ContactService');
        }

        if (empty($fieldData['contact_id'])) {
            return self::required('contact_id');
        }

        $detached = (new \BitApps\Crm\Services\ContactService())->detachTags((int) $fieldData['contact_id'], self::toIntArray($fieldData['tag_ids'] ?? []));
        if (!$detached) {
            return ['success' => false, 'message' => __('No matching tags were removed.', 'bit-integrations')];
        }

        return ['success' => true, 'message' => __('Tag removed from contact successfully.', 'bit-integrations')];
    }

    public static function createCompany($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\CompanyService')) {
            return self::missing('BitApps\Crm\Services\CompanyService');
        }

        $systemValues = self::systemValues($fieldData, ['tag_ids']);
        $error = self::validateRequired($systemValues, 'name');
        if ($error !== null) {
            return $error;
        }

        $payload = [
            'systemDefinedFieldsValues' => $systemValues,
            'tagIds'                    => self::toIntArray($fieldData['tag_ids'] ?? []),
        ];

        return self::result((new \BitApps\Crm\Services\CompanyService())->store($payload), __('Company created successfully.', 'bit-integrations'));
    }

    public static function updateCompany($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\CompanyService')) {
            return self::missing('BitApps\Crm\Services\CompanyService');
        }

        if (empty($fieldData['company_id'])) {
            return self::required('company_id');
        }

        $payload = [
            'id'                        => (int) $fieldData['company_id'],
            'systemDefinedFieldsValues' => self::systemValues($fieldData, ['company_id', 'tag_ids']),
        ];

        return self::result((new \BitApps\Crm\Services\CompanyService())->update($payload), __('Company updated successfully.', 'bit-integrations'));
    }

    public static function deleteCompany($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\CompanyService')) {
            return self::missing('BitApps\Crm\Services\CompanyService');
        }

        if (empty($fieldData['company_id'])) {
            return self::required('company_id');
        }

        return self::result((new \BitApps\Crm\Services\CompanyService())->trash(['ids' => [(int) $fieldData['company_id']]]), __('Company deleted successfully.', 'bit-integrations'));
    }

    public static function addTagToCompany($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\CompanyService')) {
            return self::missing('BitApps\Crm\Services\CompanyService');
        }

        if (empty($fieldData['company_id'])) {
            return self::required('company_id');
        }

        $tagIds = self::toIntArray($fieldData['tag_ids'] ?? []);
        $newTags = self::csvList($fieldData['new_tags'] ?? '');
        if (empty($tagIds) && empty($newTags)) {
            return ['success' => false, 'message' => __('At least one existing or new tag must be provided.', 'bit-integrations')];
        }

        $companyId = (int) $fieldData['company_id'];
        $attached = (new \BitApps\Crm\Services\CompanyService())->storeAndAttachTags($companyId, $tagIds, $newTags);

        if (!empty($attached)) {
            do_action('bit_crm/tags_attached_to_companies', $attached, [$companyId]);
        }

        return ['success' => true, 'message' => __('Tag attached to company successfully.', 'bit-integrations')];
    }

    public static function removeTagFromCompany($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\CompanyService')) {
            return self::missing('BitApps\Crm\Services\CompanyService');
        }

        if (empty($fieldData['company_id'])) {
            return self::required('company_id');
        }

        $detached = (new \BitApps\Crm\Services\CompanyService())->detachTags((int) $fieldData['company_id'], self::toIntArray($fieldData['tag_ids'] ?? []));
        if (!$detached) {
            return ['success' => false, 'message' => __('No matching tags were removed.', 'bit-integrations')];
        }

        return ['success' => true, 'message' => __('Tag removed from company successfully.', 'bit-integrations')];
    }

    public static function createDeal($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\DealService')) {
            return self::missing('BitApps\Crm\Services\DealService');
        }

        $systemValues = self::systemValues($fieldData, ['tag_ids']);
        $error = self::validateRequired($systemValues, 'name');
        if ($error !== null) {
            return $error;
        }

        $payload = [
            'systemDefinedFieldsValues' => $systemValues,
            'tagIds'                    => self::toIntArray($fieldData['tag_ids'] ?? []),
        ];

        return self::result((new \BitApps\Crm\Services\DealService())->store($payload), __('Deal created successfully.', 'bit-integrations'));
    }

    public static function updateDeal($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\DealService')) {
            return self::missing('BitApps\Crm\Services\DealService');
        }

        if (empty($fieldData['deal_id'])) {
            return self::required('deal_id');
        }

        $payload = [
            'id'                        => (int) $fieldData['deal_id'],
            'systemDefinedFieldsValues' => self::systemValues($fieldData, ['deal_id', 'tag_ids']),
        ];

        return self::result((new \BitApps\Crm\Services\DealService())->update($payload), __('Deal updated successfully.', 'bit-integrations'));
    }

    public static function deleteDeal($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\DealService')) {
            return self::missing('BitApps\Crm\Services\DealService');
        }

        if (empty($fieldData['deal_id'])) {
            return self::required('deal_id');
        }

        return self::result((new \BitApps\Crm\Services\DealService())->trash(['ids' => [(int) $fieldData['deal_id']]]), __('Deal deleted successfully.', 'bit-integrations'));
    }

    public static function addTagToDeal($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\DealService')) {
            return self::missing('BitApps\Crm\Services\DealService');
        }

        if (empty($fieldData['deal_id'])) {
            return self::required('deal_id');
        }

        $tagIds = self::toIntArray($fieldData['tag_ids'] ?? []);
        $newTags = self::csvList($fieldData['new_tags'] ?? '');
        if (empty($tagIds) && empty($newTags)) {
            return ['success' => false, 'message' => __('At least one existing or new tag must be provided.', 'bit-integrations')];
        }

        $dealId = (int) $fieldData['deal_id'];
        $attached = (new \BitApps\Crm\Services\DealService())->storeAndAttachTags($dealId, $tagIds, $newTags);

        if (!empty($attached)) {
            do_action('bit_crm/tags_attached_to_deals', $attached, [$dealId]);
        }

        return ['success' => true, 'message' => __('Tag attached to deal successfully.', 'bit-integrations')];
    }

    public static function removeTagFromDeal($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\DealService')) {
            return self::missing('BitApps\Crm\Services\DealService');
        }

        if (empty($fieldData['deal_id'])) {
            return self::required('deal_id');
        }

        $detached = (new \BitApps\Crm\Services\DealService())->detachTags((int) $fieldData['deal_id'], self::toIntArray($fieldData['tag_ids'] ?? []));
        if (!$detached) {
            return ['success' => false, 'message' => __('No matching tags were removed.', 'bit-integrations')];
        }

        return ['success' => true, 'message' => __('Tag removed from deal successfully.', 'bit-integrations')];
    }

    public static function createProduct($fieldData)
    {
        if (!class_exists('BitApps\CrmPro\Services\ProductService')) {
            return self::missing('BitApps\CrmPro\Services\ProductService');
        }

        $systemValues = self::systemValues($fieldData, ['tag_ids']);
        $error = self::validateRequired($systemValues, 'name');
        if ($error !== null) {
            return $error;
        }

        $payload = [
            'systemDefinedFieldsValues' => $systemValues,
            'tagIds'                    => self::toIntArray($fieldData['tag_ids'] ?? []),
        ];

        return self::result((new \BitApps\CrmPro\Services\ProductService())->store($payload), __('Product created successfully.', 'bit-integrations'));
    }

    public static function updateProduct($fieldData)
    {
        if (!class_exists('BitApps\CrmPro\Services\ProductService')) {
            return self::missing('BitApps\CrmPro\Services\ProductService');
        }

        if (empty($fieldData['product_id'])) {
            return self::required('product_id');
        }

        $payload = [
            'id'                        => (int) $fieldData['product_id'],
            'systemDefinedFieldsValues' => self::systemValues($fieldData, ['product_id', 'tag_ids']),
        ];

        return self::result((new \BitApps\CrmPro\Services\ProductService())->update($payload), __('Product updated successfully.', 'bit-integrations'));
    }

    public static function deleteProduct($fieldData)
    {
        if (!class_exists('BitApps\CrmPro\Services\ProductService')) {
            return self::missing('BitApps\CrmPro\Services\ProductService');
        }

        if (empty($fieldData['product_id'])) {
            return self::required('product_id');
        }

        return self::result((new \BitApps\CrmPro\Services\ProductService())->trash(['ids' => [(int) $fieldData['product_id']]]), __('Product deleted successfully.', 'bit-integrations'));
    }

    public static function addTagToProduct($fieldData)
    {
        if (!class_exists('BitApps\CrmPro\Services\ProductService')) {
            return self::missing('BitApps\CrmPro\Services\ProductService');
        }

        if (empty($fieldData['product_id'])) {
            return self::required('product_id');
        }

        $tagIds = self::toIntArray($fieldData['tag_ids'] ?? []);
        $newTags = self::csvList($fieldData['new_tags'] ?? '');
        if (empty($tagIds) && empty($newTags)) {
            return ['success' => false, 'message' => __('At least one existing or new tag must be provided.', 'bit-integrations')];
        }

        $productId = (int) $fieldData['product_id'];
        $attached = (new \BitApps\CrmPro\Services\ProductService())->storeAndAttachTags($productId, $tagIds, $newTags);

        if (!empty($attached)) {
            do_action('bit_crm/tags_attached_to_products', $attached, [$productId]);
        }

        return ['success' => true, 'message' => __('Tag attached to product successfully.', 'bit-integrations')];
    }

    public static function removeTagFromProduct($fieldData)
    {
        if (!class_exists('BitApps\CrmPro\Services\ProductService')) {
            return self::missing('BitApps\CrmPro\Services\ProductService');
        }

        if (empty($fieldData['product_id'])) {
            return self::required('product_id');
        }

        $detached = (new \BitApps\CrmPro\Services\ProductService())->detachTags((int) $fieldData['product_id'], self::toIntArray($fieldData['tag_ids'] ?? []));
        if (!$detached) {
            return ['success' => false, 'message' => __('No matching tags were removed.', 'bit-integrations')];
        }

        return ['success' => true, 'message' => __('Tag removed from product successfully.', 'bit-integrations')];
    }

    public static function updateDealStage($fieldData)
    {
        if (!class_exists('BitApps\Crm\Model\Deal')) {
            return self::missing('BitApps\Crm\Model\Deal');
        }

        if (empty($fieldData['deal_id']) || empty($fieldData['stage'])) {
            return ['success' => false, 'message' => __('Deal and stage are required.', 'bit-integrations')];
        }

        $deal = \BitApps\Crm\Model\Deal::findOne(['id' => (int) $fieldData['deal_id'], 'is_trash' => 0]);
        if (!$deal) {
            return ['success' => false, 'message' => __('Deal not found!', 'bit-integrations')];
        }

        if (!$deal->update(['stage' => $fieldData['stage'], 'updated_by' => get_current_user_id()])) {
            return ['success' => false, 'message' => __('Failed to update deal stage.', 'bit-integrations')];
        }

        do_action('bit_crm/deal_stage_updated', $deal, $fieldData['stage']);

        return self::success(__('Deal stage updated successfully.', 'bit-integrations'), $deal);
    }

    public static function convertLead($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\LeadConvertService')) {
            return self::missing('BitApps\Crm\Services\LeadConvertService');
        }

        if (empty($fieldData['lead_id']) || empty($fieldData['convert_to']) || empty($fieldData['move_related_data_to'])) {
            return ['success' => false, 'message' => __('Lead, convert-to and move-related-data-to are required.', 'bit-integrations')];
        }

        $leadId = (int) $fieldData['lead_id'];
        $convertTo = self::csvList($fieldData['convert_to']);
        $options = [
            'convertTo'         => $convertTo,
            'moveRelatedDataTo' => $fieldData['move_related_data_to'],
            'moveTagsTo'        => [$fieldData['move_related_data_to']],
        ];
        $ownerId = !empty($fieldData['owner_id']) ? (int) $fieldData['owner_id'] : null;

        \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::startTransaction();

        try {
            $mapping = \BitApps\Crm\Services\ConvertService::getConversionMapping();
            $service = new \BitApps\Crm\Services\LeadConvertService([$leadId], $ownerId, $options, $mapping);
            $service->convertToCompanies();
            $convertedContacts = $service->convertToContacts();
            $service->convertToDeals($convertedContacts);
            \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::commit();
        } catch (Throwable $th) {
            \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::rollback();

            return ['success' => false, 'message' => $th->getMessage()];
        }

        return ['success' => true, 'message' => __('Lead converted successfully.', 'bit-integrations')];
    }

    public static function createTag($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\TagService')) {
            return self::missing('BitApps\Crm\Services\TagService');
        }

        if (empty($fieldData['title']) || empty($fieldData['module'])) {
            return ['success' => false, 'message' => __('Title and module are required.', 'bit-integrations')];
        }

        $tag = \BitApps\Crm\Services\TagService::store(['title' => $fieldData['title'], 'module' => $fieldData['module']]);
        if ($tag === false) {
            return ['success' => false, 'message' => __('Failed to create tag. The module may be invalid or the tag already exists.', 'bit-integrations')];
        }

        return self::success(__('Tag created successfully.', 'bit-integrations'), $tag);
    }

    public static function createNote($fieldData)
    {
        if (!class_exists('BitApps\Crm\Services\NoteService')) {
            return self::missing('BitApps\Crm\Services\NoteService');
        }

        foreach (['entity_id', 'module', 'title'] as $req) {
            if (empty($fieldData[$req])) {
                return self::required($req);
            }
        }

        $payload = [
            'title'     => $fieldData['title'],
            'details'   => $fieldData['details'] ?? '',
            'entity_id' => (int) $fieldData['entity_id'],
            'module'    => $fieldData['module'],
            'is_shared' => !empty($fieldData['is_shared']),
        ];

        return self::result((new \BitApps\Crm\Services\NoteService())->store($payload), __('Note created successfully.', 'bit-integrations'));
    }

    public static function updateTag($fieldData)
    {
        if (!class_exists('BitApps\Crm\Model\Tag')) {
            return self::missing('BitApps\Crm\Model\Tag');
        }

        if (!class_exists('BitApps\Crm\Deps\BitApps\WPKit\Helpers\Slug')) {
            return self::missing('BitApps\Crm\Deps\BitApps\WPKit\Helpers\Slug');
        }

        foreach (['tag_id', 'title'] as $req) {
            if (empty($fieldData[$req])) {
                return self::required($req);
            }
        }

        $tag = \BitApps\Crm\Model\Tag::findOne(['id' => (int) $fieldData['tag_id']]);
        if (empty($tag)) {
            return ['success' => false, 'message' => __('Tag not found.', 'bit-integrations')];
        }

        // Bit CRM regenerates the slug from the title on every tag update.
        $updateData = [
            'title'      => $fieldData['title'],
            'slug'       => \BitApps\Crm\Deps\BitApps\WPKit\Helpers\Slug::generate($fieldData['title']),
            'updated_by' => get_current_user_id(),
        ];
        if (!empty($fieldData['module'])) {
            $updateData['module'] = $fieldData['module'];
        }

        if (!$tag->update($updateData)) {
            return ['success' => false, 'message' => __('Failed to update tag.', 'bit-integrations')];
        }

        do_action('bit_crm/tag_updated', $tag);

        return self::success(__('Tag updated successfully.', 'bit-integrations'), $tag);
    }

    public static function deleteTag($fieldData)
    {
        foreach (['BitApps\Crm\Model\Tag', 'BitApps\Crm\Model\TagEntity'] as $class) {
            if (!class_exists($class)) {
                return self::missing($class);
            }
        }

        if (empty($fieldData['tag_id'])) {
            return self::required('tag_id');
        }

        $tagIds = self::toIntArray($fieldData['tag_id']);
        if (empty($tagIds)) {
            return self::required('tag_id');
        }

        $tags = \BitApps\Crm\Model\Tag::whereIn('id', $tagIds);
        if (!$tags->count()) {
            return ['success' => false, 'message' => __('Tag not found.', 'bit-integrations')];
        }

        try {
            $tags->delete();
            // The tags are gone, so drop their entity relations too, as Bit CRM does.
            \BitApps\Crm\Model\TagEntity::whereIn('tag_id', $tagIds)->delete();
        } catch (Throwable $th) {
            return ['success' => false, 'message' => $th->getMessage()];
        }

        do_action('bit_crm/tag_deleted', $tagIds);

        return self::success(__('Tag deleted successfully.', 'bit-integrations'), ['ids' => $tagIds]);
    }

    public static function updateNote($fieldData)
    {
        if (!class_exists('BitApps\Crm\Model\Note')) {
            return self::missing('BitApps\Crm\Model\Note');
        }

        if (empty($fieldData['note_id'])) {
            return self::required('note_id');
        }

        $note = \BitApps\Crm\Model\Note::findOne(['id' => (int) $fieldData['note_id']]);
        if (empty($note)) {
            return ['success' => false, 'message' => __('Note not found.', 'bit-integrations')];
        }

        $isShared = !empty($fieldData['is_shared']);

        // Sharing needs the linked contact to hold a portal account with notes
        // enabled, so let Bit CRM run that check rather than duplicating it.
        if ($isShared && class_exists('BitApps\Crm\Services\NoteService')) {
            $validation = (new \BitApps\Crm\Services\NoteService())->validateSharedNote((int) $note->entity_id);

            if (($validation['success'] ?? false) === false) {
                return ['success' => false, 'message' => $validation['errors'][0] ?? __('This note cannot be shared.', 'bit-integrations')];
            }
        }

        $updateData = ['is_shared' => $isShared, 'updated_by' => get_current_user_id()];
        foreach (['title', 'details'] as $field) {
            if (isset($fieldData[$field]) && $fieldData[$field] !== '') {
                $updateData[$field] = $fieldData[$field];
            }
        }

        if (!$note->update($updateData)) {
            return ['success' => false, 'message' => __('Failed to update note.', 'bit-integrations')];
        }

        do_action('bit_crm/note_updated', $note);

        return self::success(__('Note updated successfully.', 'bit-integrations'), $note);
    }

    public static function deleteNote($fieldData)
    {
        if (!class_exists('BitApps\Crm\Model\Note')) {
            return self::missing('BitApps\Crm\Model\Note');
        }

        if (empty($fieldData['note_id'])) {
            return self::required('note_id');
        }

        $noteId = (int) $fieldData['note_id'];
        $note = \BitApps\Crm\Model\Note::findOne(['id' => $noteId]);
        if (empty($note)) {
            return ['success' => false, 'message' => __('Note not found.', 'bit-integrations')];
        }

        $deletedNote = self::normalizeData($note);

        if (!$note->delete()) {
            return ['success' => false, 'message' => __('Failed to delete note.', 'bit-integrations')];
        }

        do_action('bit_crm/note_deleted', $noteId);

        return self::success(__('Note deleted successfully.', 'bit-integrations'), $deletedNote);
    }

    public static function createTask($fieldData)
    {
        return self::storeActivity('task', $fieldData);
    }

    public static function createMeeting($fieldData)
    {
        return self::storeActivity('meeting', $fieldData);
    }

    public static function createCall($fieldData)
    {
        return self::storeActivity('call', $fieldData);
    }

    public static function updateTask($fieldData)
    {
        return self::modifyActivity('task', $fieldData);
    }

    public static function updateMeeting($fieldData)
    {
        return self::modifyActivity('meeting', $fieldData);
    }

    public static function updateCall($fieldData)
    {
        return self::modifyActivity('call', $fieldData);
    }

    public static function updateTaskStatus($fieldData)
    {
        return self::changeActivityStatus('task', $fieldData);
    }

    public static function updateMeetingStatus($fieldData)
    {
        return self::changeActivityStatus('meeting', $fieldData);
    }

    public static function updateCallStatus($fieldData)
    {
        return self::changeActivityStatus('call', $fieldData);
    }

    public static function deleteTask($fieldData)
    {
        return self::removeActivity('task', $fieldData);
    }

    public static function deleteMeeting($fieldData)
    {
        return self::removeActivity('meeting', $fieldData);
    }

    public static function deleteCall($fieldData)
    {
        return self::removeActivity('call', $fieldData);
    }

    public static function createInvoice($fieldData)
    {
        if (!class_exists('BitApps\Crm\Model\Invoice')) {
            return self::missing('BitApps\Crm\Model\Invoice');
        }

        foreach (['invoice_date', 'deal_id', 'term_key', 'due_date', 'tax_option', 'invoice_prefix'] as $req) {
            if (empty($fieldData[$req])) {
                return self::required($req);
            }
        }

        $invoiceData = [
            'invoice_date'   => $fieldData['invoice_date'],
            'entity_id'      => (int) $fieldData['deal_id'],
            'module'         => \BitApps\Crm\Model\Deal::MODULE_NAME,
            'term_key'       => $fieldData['term_key'],
            'due_date'       => $fieldData['due_date'],
            'tax_option'     => $fieldData['tax_option'],
            'currency'       => $fieldData['currency'],
            'invoice_prefix' => $fieldData['invoice_prefix'],
            'created_by'     => get_current_user_id(),
        ];

        \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::startTransaction();

        try {
            $storedInvoice = \BitApps\Crm\Model\Invoice::insert($invoiceData);
            if (!$storedInvoice) {
                \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::rollback();

                return ['success' => false, 'message' => __('Failed to create invoice.', 'bit-integrations')];
            }

            (new \BitApps\Crm\Services\LineItemService($storedInvoice->id, \BitApps\Crm\Model\Invoice::MODULE_NAME))->syncLineItems([], $fieldData['currency'], $fieldData['tax_option']);
            \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::commit();
        } catch (Throwable $th) {
            \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::rollback();

            return ['success' => false, 'message' => $th->getMessage()];
        }

        do_action('bit_crm/invoice_created', $storedInvoice);

        return self::success(__('Invoice created successfully.', 'bit-integrations'), $storedInvoice);
    }

    public static function updateInvoice($fieldData)
    {
        [$invoice, $error] = self::resolveInvoice($fieldData);
        if ($error !== null) {
            return $error;
        }

        // Bit CRM locks paid invoices; respect that instead of writing behind its back.
        if ($invoice->status === \BitApps\Crm\Model\Invoice::STATUS_PAID) {
            return ['success' => false, 'message' => __('Cannot update a paid invoice.', 'bit-integrations')];
        }

        $updateData = ['updated_by' => get_current_user_id()];

        foreach (['invoice_date', 'due_date', 'term_key', 'tax_option', 'currency', 'invoice_prefix'] as $field) {
            if (isset($fieldData[$field]) && $fieldData[$field] !== '') {
                $updateData[$field] = $fieldData[$field];
            }
        }

        if (!empty($fieldData['deal_id'])) {
            $updateData['entity_id'] = (int) $fieldData['deal_id'];
            $updateData['module'] = \BitApps\Crm\Model\Deal::MODULE_NAME;
        }

        if (!empty($fieldData['status'])) {
            if (!\BitApps\Crm\Model\Invoice::canTransitionStatus($invoice->status, $fieldData['status'])) {
                return ['success' => false, 'message' => __('Invalid invoice status transition.', 'bit-integrations')];
            }

            $updateData['status'] = $fieldData['status'];
            if ($fieldData['status'] === \BitApps\Crm\Model\Invoice::STATUS_PAID) {
                $updateData['paid_at'] = current_time('mysql');
            }
        }

        try {
            $invoice->update($updateData);
        } catch (Throwable $th) {
            return ['success' => false, 'message' => $th->getMessage()];
        }

        do_action('bit_crm/invoice_updated', $invoice);

        return self::success(__('Invoice updated successfully.', 'bit-integrations'), $invoice);
    }

    public static function updateInvoiceStatus($fieldData)
    {
        [$invoice, $error] = self::resolveInvoice($fieldData);
        if ($error !== null) {
            return $error;
        }

        if (empty($fieldData['status'])) {
            return self::required('status');
        }

        if ($invoice->status === \BitApps\Crm\Model\Invoice::STATUS_PAID) {
            return ['success' => false, 'message' => __('Cannot change the status of a paid invoice.', 'bit-integrations')];
        }

        if (!\BitApps\Crm\Model\Invoice::canTransitionStatus($invoice->status, $fieldData['status'])) {
            return ['success' => false, 'message' => __('Invalid invoice status transition.', 'bit-integrations')];
        }

        $updateData = ['status' => $fieldData['status'], 'updated_by' => get_current_user_id()];

        if ($fieldData['status'] === \BitApps\Crm\Model\Invoice::STATUS_PAID) {
            $updateData['paid_at'] = current_time('mysql');
        }

        if ($fieldData['status'] === \BitApps\Crm\Model\Invoice::STATUS_SENT) {
            $updateData['sent_at'] = current_time('mysql');
        }

        try {
            $invoice->update($updateData);
        } catch (Throwable $th) {
            return ['success' => false, 'message' => $th->getMessage()];
        }

        do_action('bit_crm/invoice_status_updated', $invoice);

        return self::success(__('Invoice status updated successfully.', 'bit-integrations'), $invoice);
    }

    public static function deleteInvoice($fieldData)
    {
        [$invoice, $error] = self::resolveInvoice($fieldData);
        if ($error !== null) {
            return $error;
        }

        if (!class_exists('BitApps\Crm\Model\Trash')) {
            return self::missing('BitApps\Crm\Model\Trash');
        }

        $invoiceId = (int) $fieldData['invoice_id'];
        $trashedInvoice = self::normalizeData($invoice);

        \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::startTransaction();

        try {
            // Bit CRM soft-deletes invoices: flag the row and mirror it into the trash bin.
            \BitApps\Crm\Model\Invoice::whereIn('id', [$invoiceId])->update(['is_trash' => true]);

            \BitApps\Crm\Model\Trash::insert([
                [
                    'entity_id'  => $invoiceId,
                    'module'     => \BitApps\Crm\Model\Invoice::MODULE_NAME,
                    'created_by' => get_current_user_id(),
                    'full_name'  => ($trashedInvoice['invoice_prefix'] ?? '') . '-' . $invoiceId,
                ],
            ]);

            \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::commit();
        } catch (Throwable $th) {
            \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::rollback();

            return ['success' => false, 'message' => $th->getMessage()];
        }

        do_action('bit_crm/invoices_trashed', [$invoiceId]);

        return self::success(__('Invoice trashed successfully.', 'bit-integrations'), $trashedInvoice);
    }

    public static function grantPortalAccess($fieldData)
    {
        [$contact, , $email, $error] = self::resolvePortalContact($fieldData);
        if ($error !== null) {
            return $error;
        }

        $portalService = new \BitApps\Crm\Services\ClientPortalService();

        if ($portalService->hasPortalAccessByEmail($email)) {
            return ['success' => false, 'message' => __('This contact already has client portal access.', 'bit-integrations')];
        }

        // Creates the WordPress user when the email is new, and queues Bit CRM's
        // access email with the generated password.
        $result = $portalService->upsertPortalUser($contact, self::portalCapabilities($fieldData));

        if (is_wp_error($result)) {
            return ['success' => false, 'message' => $result->get_error_message()];
        }

        $userId = (int) ($result['userId'] ?? 0);

        return self::success(
            __('Client portal access granted.', 'bit-integrations'),
            ['user_id' => $userId, 'email' => $email, 'capabilities' => $portalService->getUserCapabilities($userId)]
        );
    }

    public static function updatePortalAccess($fieldData)
    {
        [, $user, $email, $error] = self::resolvePortalContact($fieldData);
        if ($error !== null) {
            return $error;
        }

        $portalService = new \BitApps\Crm\Services\ClientPortalService();

        if (!$user || !$portalService->hasPortalAccessByUserId((int) $user->ID)) {
            return ['success' => false, 'message' => __('This contact does not have client portal access yet.', 'bit-integrations')];
        }

        if (!$portalService->syncUserCapabilities($user, self::portalCapabilities($fieldData))) {
            return ['success' => false, 'message' => __('Failed to update client portal capabilities.', 'bit-integrations')];
        }

        return self::success(
            __('Client portal capabilities updated.', 'bit-integrations'),
            ['user_id' => (int) $user->ID, 'email' => $email, 'capabilities' => $portalService->getUserCapabilities((int) $user->ID)]
        );
    }

    public static function updatePortalPassword($fieldData)
    {
        [, $user, $email, $error] = self::resolvePortalContact($fieldData);
        if ($error !== null) {
            return $error;
        }

        if (empty($fieldData['password'])) {
            return self::required('password');
        }

        $portalService = new \BitApps\Crm\Services\ClientPortalService();

        if (!$user || !$portalService->hasPortalAccessByUserId((int) $user->ID)) {
            return ['success' => false, 'message' => __('This contact does not have client portal access.', 'bit-integrations')];
        }

        $portalService->updatePassword((int) $user->ID, $fieldData['password']);
        $portalService->markPasswordChanged((int) $user->ID);

        return self::success(
            __('Client portal password updated.', 'bit-integrations'),
            ['user_id' => (int) $user->ID, 'email' => $email]
        );
    }

    public static function revokePortalAccess($fieldData)
    {
        [, $user, $email, $error] = self::resolvePortalContact($fieldData);
        if ($error !== null) {
            return $error;
        }

        $portalService = new \BitApps\Crm\Services\ClientPortalService();

        if (!$user || !$portalService->hasPortalAccessByUserId((int) $user->ID)) {
            return ['success' => false, 'message' => __('This contact does not have client portal access.', 'bit-integrations')];
        }

        // Strips the portal capabilities only; the WordPress account survives.
        if (!$portalService->revokePortalAccess((int) $user->ID)) {
            return ['success' => false, 'message' => __('Failed to revoke client portal access.', 'bit-integrations')];
        }

        return self::success(
            __('Client portal access revoked.', 'bit-integrations'),
            ['user_id' => (int) $user->ID, 'email' => $email]
        );
    }

    /**
     * Insert an activity of the given type and fire Bit CRM's created hook.
     *
     * @param string $type one of task|meeting|call
     * @param array  $fieldData
     */
    private static function storeActivity($type, $fieldData)
    {
        if (!class_exists('BitApps\Crm\Model\Activity')) {
            return self::missing('BitApps\Crm\Model\Activity');
        }

        $required = ['title', 'entity_id', 'module', 'assigned_to'];
        // Bit CRM itself only requires a priority on tasks.
        if ($type === 'task') {
            $required[] = 'priority';
        }

        foreach ($required as $req) {
            if (empty($fieldData[$req])) {
                return self::required($req);
            }
        }

        $payload = [
            'title'       => $fieldData['title'],
            'type'        => $type,
            'details'     => $fieldData['details'] ?? '',
            'entity_id'   => (int) $fieldData['entity_id'],
            'module'      => $fieldData['module'],
            'assigned_to' => (int) $fieldData['assigned_to'],
            'is_shared'   => !empty($fieldData['is_shared']),
            'created_by'  => get_current_user_id(),
        ];
        if (!empty($fieldData['priority'])) {
            $payload['priority'] = $fieldData['priority'];
        }
        // Only set due_date when supplied — the column is nullable and an empty
        // string is rejected by MySQL strict mode as an invalid datetime.
        if (!empty($fieldData['due_date'])) {
            $payload['due_date'] = $fieldData['due_date'];
        }

        $activity = \BitApps\Crm\Model\Activity::insert($payload);
        if (!$activity) {
            // translators: %s: activity type (task, meeting or call)
            return ['success' => false, 'message' => \sprintf(__('Failed to create %s.', 'bit-integrations'), $type)];
        }

        do_action('bit_crm/activity_created', $activity);

        // translators: %s: activity type (task, meeting or call)
        return self::success(\sprintf(__('%s created successfully.', 'bit-integrations'), ucfirst($type)), $activity);
    }

    /**
     * Apply the supplied fields to an existing activity. Only fields carrying a
     * value are written, so a flow can change one column without blanking the rest.
     *
     * @param string $type one of task|meeting|call
     * @param array  $fieldData
     */
    private static function modifyActivity($type, $fieldData)
    {
        [$activity, $error] = self::resolveActivity($type, $fieldData);
        if ($error !== null) {
            return $error;
        }

        $updateData = ['updated_by' => get_current_user_id()];

        foreach (['title', 'priority', 'due_date', 'details', 'module'] as $field) {
            if (isset($fieldData[$field]) && $fieldData[$field] !== '') {
                $updateData[$field] = $fieldData[$field];
            }
        }

        foreach (['entity_id', 'assigned_to'] as $field) {
            if (!empty($fieldData[$field])) {
                $updateData[$field] = (int) $fieldData[$field];
            }
        }

        if (isset($fieldData['is_shared'])) {
            $updateData['is_shared'] = !empty($fieldData['is_shared']);
        }

        if (!$activity->update($updateData)) {
            // translators: %s: activity type (task, meeting or call)
            return ['success' => false, 'message' => \sprintf(__('Failed to update %s.', 'bit-integrations'), $type)];
        }

        do_action('bit_crm/activity_updated', $activity);

        // translators: %s: activity type (task, meeting or call)
        return self::success(\sprintf(__('%s updated successfully.', 'bit-integrations'), ucfirst($type)), $activity);
    }

    /**
     * Mark an activity completed or pending.
     *
     * @param string $type one of task|meeting|call
     * @param array  $fieldData
     */
    private static function changeActivityStatus($type, $fieldData)
    {
        [$activity, $error] = self::resolveActivity($type, $fieldData);
        if ($error !== null) {
            return $error;
        }

        if (empty($fieldData['status'])) {
            return self::required('status');
        }

        $newStatus = $fieldData['status'] === 'completed' ? 'completed' : 'pending';
        $oldStatus = $activity->is_completed ? 'completed' : 'pending';

        if ($newStatus === $oldStatus) {
            // translators: %s: activity type (task, meeting or call)
            return self::success(\sprintf(__('%s status already up to date.', 'bit-integrations'), ucfirst($type)), $activity);
        }

        if (!$activity->update(['is_completed' => $newStatus === 'completed', 'updated_by' => get_current_user_id()])) {
            // translators: %s: activity type (task, meeting or call)
            return ['success' => false, 'message' => \sprintf(__('Failed to update %s status.', 'bit-integrations'), $type)];
        }

        do_action('bit_crm/activity_status_updated', $activity, $newStatus, $oldStatus);

        // translators: %s: activity type (task, meeting or call)
        return self::success(\sprintf(__('%s status updated successfully.', 'bit-integrations'), ucfirst($type)), $activity);
    }

    /**
     * Delete an activity and fire Bit CRM's deleted hook.
     *
     * @param string $type one of task|meeting|call
     * @param array  $fieldData
     */
    private static function removeActivity($type, $fieldData)
    {
        [$activity, $error] = self::resolveActivity($type, $fieldData);
        if ($error !== null) {
            return $error;
        }

        $activityId = (int) $fieldData['activity_id'];
        $deletedActivity = self::normalizeData($activity);

        if (!$activity->delete()) {
            // translators: %s: activity type (task, meeting or call)
            return ['success' => false, 'message' => \sprintf(__('Failed to delete %s.', 'bit-integrations'), $type)];
        }

        do_action('bit_crm/activity_deleted', $activityId);

        // translators: %s: activity type (task, meeting or call)
        return self::success(\sprintf(__('%s deleted successfully.', 'bit-integrations'), ucfirst($type)), $deletedActivity);
    }

    /**
     * Load the configured activity and confirm it is of the expected type, so a
     * Delete Task never touches a meeting that happens to share the id space.
     *
     * @param string $type one of task|meeting|call
     * @param array  $fieldData
     *
     * @return array{0: mixed, 1: null|array}
     */
    private static function resolveActivity($type, $fieldData)
    {
        if (!class_exists('BitApps\Crm\Model\Activity')) {
            return [null, self::missing('BitApps\Crm\Model\Activity')];
        }

        if (empty($fieldData['activity_id'])) {
            return [null, self::required('activity_id')];
        }

        $activity = \BitApps\Crm\Model\Activity::findOne(['id' => (int) $fieldData['activity_id']]);

        if (empty($activity) || $activity->type !== $type) {
            // translators: %s: activity type (task, meeting or call)
            return [null, ['success' => false, 'message' => \sprintf(__('No %s found with this id.', 'bit-integrations'), $type)]];
        }

        return [$activity, null];
    }

    /**
     * Load the configured invoice, skipping ones already in the trash.
     *
     * @param array $fieldData
     *
     * @return array{0: mixed, 1: null|array}
     */
    private static function resolveInvoice($fieldData)
    {
        if (!class_exists('BitApps\Crm\Model\Invoice')) {
            return [null, self::missing('BitApps\Crm\Model\Invoice')];
        }

        if (empty($fieldData['invoice_id'])) {
            return [null, self::required('invoice_id')];
        }

        $invoice = \BitApps\Crm\Model\Invoice::findOne(['id' => (int) $fieldData['invoice_id'], 'is_trash' => 0]);

        if (empty($invoice)) {
            return [null, ['success' => false, 'message' => __('Invoice not found.', 'bit-integrations')]];
        }

        return [$invoice, null];
    }

    /**
     * Load the contact and the WordPress user behind its email. The user is null
     * when no account exists yet, which is valid for granting access and an error
     * for everything else.
     *
     * @param array $fieldData
     *
     * @return array{0: mixed, 1: mixed, 2: string, 3: null|array}
     */
    private static function resolvePortalContact($fieldData)
    {
        foreach (['BitApps\Crm\Services\ClientPortalService', 'BitApps\Crm\Model\Contact'] as $class) {
            if (!class_exists($class)) {
                return [null, null, '', self::missing($class)];
            }
        }

        if (empty($fieldData['contact_id'])) {
            return [null, null, '', self::required('contact_id')];
        }

        $contact = \BitApps\Crm\Model\Contact::findOne(['id' => (int) $fieldData['contact_id'], 'is_trash' => 0]);

        if (empty($contact)) {
            return [null, null, '', ['success' => false, 'message' => __('Contact not found.', 'bit-integrations')]];
        }

        $email = (string) ($contact->email ?? '');

        if ($email === '' || !is_email($email)) {
            return [null, null, '', ['success' => false, 'message' => __('This contact has no valid email, so it cannot use the client portal.', 'bit-integrations')]];
        }

        $user = get_user_by('email', $email);

        return [$contact, $user ?: null, $email, null];
    }

    /**
     * Turn the selected capability list into the `[shortName => true]` map Bit CRM
     * expects. An empty selection makes Bit CRM apply its own portal defaults.
     *
     * @param array $fieldData
     *
     * @return array<string, bool>
     */
    private static function portalCapabilities($fieldData)
    {
        $capabilities = [];

        foreach (self::csvList($fieldData['capabilities'] ?? []) as $capability) {
            $capabilities[$capability] = true;
        }

        return $capabilities;
    }

    private static function missing($class)
    {
        // translators: %s: fully-qualified Bit CRM class name
        return ['success' => false, 'message' => \sprintf(__('Required Bit CRM component "%s" is not available. Please update Bit CRM.', 'bit-integrations'), $class)];
    }

    private static function required($field)
    {
        // translators: %s: required field name
        return ['success' => false, 'message' => \sprintf(__('The field "%s" is required.', 'bit-integrations'), $field)];
    }

    private static function csvList($value)
    {
        if (!\is_array($value)) {
            $value = explode(',', (string) $value);
        }

        return array_values(array_filter(array_map('trim', $value), static function ($item) {
            return $item !== '';
        }));
    }

    private static function toIntArray($value)
    {
        if (\is_string($value)) {
            $value = explode(',', $value);
        }

        return array_values(array_filter(array_map('intval', (array) $value), static function ($id) {
            return $id > 0;
        }));
    }

    private static function systemValues($fieldData, array $drop)
    {
        $values = array_diff_key((array) $fieldData, array_flip($drop));

        return array_filter($values, static function ($v) {
            return $v !== null && $v !== '' && $v !== [];
        });
    }

    private static function validateRequired($values, $field)
    {
        return empty($values[$field]) ? self::required($field) : null;
    }

    private static function result($result, $successMsg)
    {
        if ($result === false || (\is_array($result) && ($result['success'] ?? true) === false)) {
            $errors = \is_array($result) ? ($result['errors'] ?? null) : null;

            return ['success' => false, 'message' => \is_array($errors) ? implode(', ', $errors) : ($errors ?? __('Bit CRM operation failed.', 'bit-integrations'))];
        }

        $data = \is_array($result) && \array_key_exists('data', $result) ? $result['data'] : $result;

        return self::success($successMsg, $data);
    }

    /**
     * Success envelope. Includes the affected record as `data` when one is passed
     * (create/update actions), omits it otherwise.
     *
     * @param mixed $data
     * @param mixed $message
     */
    private static function success($message, $data = null)
    {
        $response = ['success' => true, 'message' => $message];
        if ($data !== null) {
            $response['data'] = self::normalizeData($data);
        }

        return $response;
    }

    /**
     * Cast a Bit CRM model (or array) into a plain array for the response payload.
     *
     * @param mixed $data
     *
     * @return mixed
     */
    private static function normalizeData($data)
    {
        if (\is_object($data) && method_exists($data, 'getAttributes')) {
            return $data->getAttributes();
        }

        if (\is_object($data) && method_exists($data, 'toArray')) {
            return $data->toArray();
        }

        return $data;
    }
}
