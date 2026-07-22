<?php

namespace BitApps\Integrations\Actions\BitCrm;

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

        $systemValues = self::systemValues($fieldData, ['lead_id', 'tag_ids', 'new_tags']);
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
            'systemDefinedFieldsValues' => self::systemValues($fieldData, ['lead_id', 'tag_ids', 'new_tags']),
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

        $tagIds  = self::toIntArray($fieldData['tag_ids'] ?? []);
        $newTags = array_values(array_filter(array_map('trim', explode(',', (string) ($fieldData['new_tags'] ?? '')))));
        if (empty($tagIds) && empty($newTags)) {
            return ['success' => false, 'message' => __('At least one existing or new tag must be provided.', 'bit-integrations')];
        }

        $entityId = (int) $fieldData['lead_id'];
        $attached = (new \BitApps\Crm\Services\LeadService())->storeAndAttachTags($entityId, $tagIds, $newTags);

        if (!empty($attached)) {
            \BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks::doAction('bit_crm/tags_attached_to_leads', $attached, [$entityId]);
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

        $systemValues = self::systemValues($fieldData, ['contact_id', 'tag_ids', 'new_tags']);
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
            'systemDefinedFieldsValues' => self::systemValues($fieldData, ['contact_id', 'tag_ids', 'new_tags']),
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

        $tagIds  = self::toIntArray($fieldData['tag_ids'] ?? []);
        $newTags = array_values(array_filter(array_map('trim', explode(',', (string) ($fieldData['new_tags'] ?? '')))));
        if (empty($tagIds) && empty($newTags)) {
            return ['success' => false, 'message' => __('At least one existing or new tag must be provided.', 'bit-integrations')];
        }

        $entityId = (int) $fieldData['contact_id'];
        $attached = (new \BitApps\Crm\Services\ContactService())->storeAndAttachTags($entityId, $tagIds, $newTags);

        if (!empty($attached)) {
            \BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks::doAction('bit_crm/tags_attached_to_contacts', $attached, [$entityId]);
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

        $systemValues = self::systemValues($fieldData, ['company_id', 'tag_ids', 'new_tags']);
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
            'systemDefinedFieldsValues' => self::systemValues($fieldData, ['company_id', 'tag_ids', 'new_tags']),
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

        $tagIds  = self::toIntArray($fieldData['tag_ids'] ?? []);
        $newTags = array_values(array_filter(array_map('trim', explode(',', (string) ($fieldData['new_tags'] ?? '')))));
        if (empty($tagIds) && empty($newTags)) {
            return ['success' => false, 'message' => __('At least one existing or new tag must be provided.', 'bit-integrations')];
        }

        $entityId = (int) $fieldData['company_id'];
        $attached = (new \BitApps\Crm\Services\CompanyService())->storeAndAttachTags($entityId, $tagIds, $newTags);

        if (!empty($attached)) {
            \BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks::doAction('bit_crm/tags_attached_to_companies', $attached, [$entityId]);
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

        $systemValues = self::systemValues($fieldData, ['deal_id', 'tag_ids', 'new_tags']);
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
            'systemDefinedFieldsValues' => self::systemValues($fieldData, ['deal_id', 'tag_ids', 'new_tags']),
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

        $tagIds  = self::toIntArray($fieldData['tag_ids'] ?? []);
        $newTags = array_values(array_filter(array_map('trim', explode(',', (string) ($fieldData['new_tags'] ?? '')))));
        if (empty($tagIds) && empty($newTags)) {
            return ['success' => false, 'message' => __('At least one existing or new tag must be provided.', 'bit-integrations')];
        }

        $entityId = (int) $fieldData['deal_id'];
        $attached = (new \BitApps\Crm\Services\DealService())->storeAndAttachTags($entityId, $tagIds, $newTags);

        if (!empty($attached)) {
            \BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks::doAction('bit_crm/tags_attached_to_deals', $attached, [$entityId]);
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

        $systemValues = self::systemValues($fieldData, ['product_id', 'tag_ids', 'new_tags']);
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
            'systemDefinedFieldsValues' => self::systemValues($fieldData, ['product_id', 'tag_ids', 'new_tags']),
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

        $tagIds  = self::toIntArray($fieldData['tag_ids'] ?? []);
        $newTags = array_values(array_filter(array_map('trim', explode(',', (string) ($fieldData['new_tags'] ?? '')))));
        if (empty($tagIds) && empty($newTags)) {
            return ['success' => false, 'message' => __('At least one existing or new tag must be provided.', 'bit-integrations')];
        }

        $entityId = (int) $fieldData['product_id'];
        $attached = (new \BitApps\CrmPro\Services\ProductService())->storeAndAttachTags($entityId, $tagIds, $newTags);

        if (!empty($attached)) {
            \BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks::doAction('bit_crm/tags_attached_to_products', $attached, [$entityId]);
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
        if (!class_exists('BitApps\\Crm\\Model\\Deal')) {
            return self::missing('BitApps\\Crm\\Model\\Deal');
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

        \BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks::doAction('bit_crm/deal_stage_updated', $deal, $fieldData['stage']);

        return ['success' => true, 'message' => __('Deal stage updated successfully.', 'bit-integrations')];
    }

    public static function convertLead($fieldData)
    {
        if (!class_exists('BitApps\\Crm\\Services\\LeadConvertService')) {
            return self::missing('BitApps\\Crm\\Services\\LeadConvertService');
        }

        if (empty($fieldData['lead_id']) || empty($fieldData['convert_to']) || empty($fieldData['move_related_data_to'])) {
            return ['success' => false, 'message' => __('Lead, convert-to and move-related-data-to are required.', 'bit-integrations')];
        }

        $leadId    = (int) $fieldData['lead_id'];
        $convertTo = array_values(array_filter(array_map('trim', explode(',', (string) $fieldData['convert_to']))));
        $options   = [
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
            $service->convertToContacts();
            $service->convertToDeals();
            \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::commit();
        } catch (\Throwable $th) {
            \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::rollback();

            return ['success' => false, 'message' => $th->getMessage()];
        }

        return ['success' => true, 'message' => __('Lead converted successfully.', 'bit-integrations')];
    }

    public static function createTag($fieldData)
    {
        if (!class_exists('BitApps\\Crm\\Services\\TagService')) {
            return self::missing('BitApps\\Crm\\Services\\TagService');
        }

        if (empty($fieldData['title']) || empty($fieldData['module'])) {
            return ['success' => false, 'message' => __('Title and module are required.', 'bit-integrations')];
        }

        $tag = \BitApps\Crm\Services\TagService::store(['title' => $fieldData['title'], 'module' => $fieldData['module']]);
        if ($tag === false) {
            return ['success' => false, 'message' => __('Failed to create tag. The module may be invalid or the tag already exists.', 'bit-integrations')];
        }

        return ['success' => true, 'message' => __('Tag created successfully.', 'bit-integrations')];
    }

    public static function createNote($fieldData)
    {
        if (!class_exists('BitApps\\Crm\\Services\\NoteService')) {
            return self::missing('BitApps\\Crm\\Services\\NoteService');
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

    public static function createActivity($fieldData)
    {
        if (!class_exists('BitApps\\Crm\\Model\\Activity')) {
            return self::missing('BitApps\\Crm\\Model\\Activity');
        }

        foreach (['title', 'type', 'entity_id', 'module', 'assigned_to'] as $req) {
            if (empty($fieldData[$req])) {
                return self::required($req);
            }
        }

        $payload = [
            'title'       => $fieldData['title'],
            'type'        => $fieldData['type'],
            'due_date'    => $fieldData['due_date'] ?? '',
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

        $activity = \BitApps\Crm\Model\Activity::insert($payload);
        if (!$activity) {
            return ['success' => false, 'message' => __('Failed to create activity.', 'bit-integrations')];
        }

        \BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks::doAction('bit_crm/activity_created', $activity);

        return ['success' => true, 'message' => __('Activity created successfully.', 'bit-integrations')];
    }

    public static function createInvoice($fieldData)
    {
        if (!class_exists('BitApps\\Crm\\Model\\Invoice')) {
            return self::missing('BitApps\\Crm\\Model\\Invoice');
        }

        foreach (['invoice_date', 'deal_id', 'term_key', 'due_date', 'tax_option', 'currency', 'invoice_prefix'] as $req) {
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
        } catch (\Throwable $th) {
            \BitApps\Crm\Deps\BitApps\WPDatabase\Connection::rollback();

            return ['success' => false, 'message' => $th->getMessage()];
        }

        \BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks::doAction('bit_crm/invoice_created', $storedInvoice);

        return ['success' => true, 'message' => __('Invoice created successfully.', 'bit-integrations')];
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

        return ['success' => true, 'message' => $successMsg];
    }
}
