import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_lead', label: __('Create Lead', 'bit-integrations'), is_pro: false },
  { name: 'update_lead', label: __('Update Lead', 'bit-integrations'), is_pro: false },
  { name: 'delete_lead', label: __('Delete Lead', 'bit-integrations'), is_pro: false },
  { name: 'add_tag_to_lead', label: __('Add Tag To Lead', 'bit-integrations'), is_pro: false },
  { name: 'remove_tag_from_lead', label: __('Remove Tag From Lead', 'bit-integrations'), is_pro: false },
  { name: 'convert_lead', label: __('Convert Lead', 'bit-integrations'), is_pro: false },
  { name: 'create_contact', label: __('Create Contact', 'bit-integrations'), is_pro: false },
  { name: 'update_contact', label: __('Update Contact', 'bit-integrations'), is_pro: false },
  { name: 'delete_contact', label: __('Delete Contact', 'bit-integrations'), is_pro: false },
  { name: 'add_tag_to_contact', label: __('Add Tag To Contact', 'bit-integrations'), is_pro: false },
  { name: 'remove_tag_from_contact', label: __('Remove Tag From Contact', 'bit-integrations'), is_pro: false },
  { name: 'create_company', label: __('Create Company', 'bit-integrations'), is_pro: false },
  { name: 'update_company', label: __('Update Company', 'bit-integrations'), is_pro: false },
  { name: 'delete_company', label: __('Delete Company', 'bit-integrations'), is_pro: false },
  { name: 'add_tag_to_company', label: __('Add Tag To Company', 'bit-integrations'), is_pro: false },
  { name: 'remove_tag_from_company', label: __('Remove Tag From Company', 'bit-integrations'), is_pro: false },
  { name: 'create_deal', label: __('Create Deal', 'bit-integrations'), is_pro: false },
  { name: 'update_deal', label: __('Update Deal', 'bit-integrations'), is_pro: false },
  { name: 'delete_deal', label: __('Delete Deal', 'bit-integrations'), is_pro: false },
  { name: 'add_tag_to_deal', label: __('Add Tag To Deal', 'bit-integrations'), is_pro: false },
  { name: 'remove_tag_from_deal', label: __('Remove Tag From Deal', 'bit-integrations'), is_pro: false },
  { name: 'update_deal_stage', label: __('Update Deal Stage', 'bit-integrations'), is_pro: false },
  { name: 'create_product', label: __('Create Product', 'bit-integrations'), is_pro: false },
  { name: 'update_product', label: __('Update Product', 'bit-integrations'), is_pro: false },
  { name: 'delete_product', label: __('Delete Product', 'bit-integrations'), is_pro: false },
  { name: 'add_tag_to_product', label: __('Add Tag To Product', 'bit-integrations'), is_pro: false },
  { name: 'remove_tag_from_product', label: __('Remove Tag From Product', 'bit-integrations'), is_pro: false },
  { name: 'create_tag', label: __('Create Tag', 'bit-integrations'), is_pro: false },
  { name: 'create_note', label: __('Create Note', 'bit-integrations'), is_pro: false },
  { name: 'create_activity', label: __('Create Activity', 'bit-integrations'), is_pro: false },
  { name: 'create_invoice', label: __('Create Invoice', 'bit-integrations'), is_pro: false }
]

export const bitCrmStaticData = {
  create_lead: [
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'company_name', label: __('Company Name', 'bit-integrations'), required: false },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'lead_source', label: __('Lead Source', 'bit-integrations'), required: false },
    { key: 'lead_status', label: __('Lead Status', 'bit-integrations'), required: false },
    { key: 'owner_id', label: __('Owner Id', 'bit-integrations'), required: false },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false }
  ],
  update_lead: [
    { key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'company_name', label: __('Company Name', 'bit-integrations'), required: false },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'lead_source', label: __('Lead Source', 'bit-integrations'), required: false },
    { key: 'lead_status', label: __('Lead Status', 'bit-integrations'), required: false },
    { key: 'owner_id', label: __('Owner Id', 'bit-integrations'), required: false },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false }
  ],
  delete_lead: [
    { key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true }
  ],
  add_tag_to_lead: [
    { key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_lead: [
    { key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: true }
  ],
  convert_lead: [
    { key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true },
    { key: 'convert_to', label: __('Convert To (contact,company,deal)', 'bit-integrations'), required: true },
    { key: 'move_related_data_to', label: __('Move Related Data To', 'bit-integrations'), required: true },
    { key: 'owner_id', label: __('Default Owner Id', 'bit-integrations'), required: false }
  ],
  create_contact: [
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'lead_source', label: __('Lead Source', 'bit-integrations'), required: false },
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: false },
    { key: 'owner_id', label: __('Owner Id', 'bit-integrations'), required: false },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false }
  ],
  update_contact: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'lead_source', label: __('Lead Source', 'bit-integrations'), required: false },
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: false },
    { key: 'owner_id', label: __('Owner Id', 'bit-integrations'), required: false },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false }
  ],
  delete_contact: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true }
  ],
  add_tag_to_contact: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_contact: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: true }
  ],
  create_company: [
    { key: 'name', label: __('Company Name', 'bit-integrations'), required: true },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'parent_id', label: __('Parent Company Id', 'bit-integrations'), required: false },
    { key: 'owner_id', label: __('Owner Id', 'bit-integrations'), required: false },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false }
  ],
  update_company: [
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: true },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'parent_id', label: __('Parent Company Id', 'bit-integrations'), required: false },
    { key: 'owner_id', label: __('Owner Id', 'bit-integrations'), required: false },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false }
  ],
  delete_company: [
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: true }
  ],
  add_tag_to_company: [
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: true },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_company: [
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: true },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: true }
  ],
  create_deal: [
    { key: 'name', label: __('Deal Name', 'bit-integrations'), required: true },
    { key: 'stage', label: __('Stage', 'bit-integrations'), required: true },
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: false },
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: false },
    { key: 'stage', label: __('Stage', 'bit-integrations'), required: false },
    { key: 'type', label: __('Type', 'bit-integrations'), required: false },
    { key: 'lead_source', label: __('Lead Source', 'bit-integrations'), required: false },
    { key: 'owner_id', label: __('Owner Id', 'bit-integrations'), required: false },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false }
  ],
  update_deal: [
    { key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: false },
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: false },
    { key: 'stage', label: __('Stage', 'bit-integrations'), required: false },
    { key: 'type', label: __('Type', 'bit-integrations'), required: false },
    { key: 'lead_source', label: __('Lead Source', 'bit-integrations'), required: false },
    { key: 'owner_id', label: __('Owner Id', 'bit-integrations'), required: false },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false }
  ],
  delete_deal: [
    { key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true }
  ],
  add_tag_to_deal: [
    { key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_deal: [
    { key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: true }
  ],
  update_deal_stage: [
    { key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true },
    { key: 'stage', label: __('Stage', 'bit-integrations'), required: true }
  ],
  create_product: [
    { key: 'name', label: __('Product Name', 'bit-integrations'), required: true },
    { key: 'code', label: __('Product Code', 'bit-integrations'), required: true },
    { key: 'code', label: __('Product Code', 'bit-integrations'), required: false },
    { key: 'price', label: __('Unit Price', 'bit-integrations'), required: false },
    { key: 'type', label: __('Type', 'bit-integrations'), required: false },
    { key: 'brand', label: __('Brand', 'bit-integrations'), required: false },
    { key: 'status', label: __('Status', 'bit-integrations'), required: false },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false }
  ],
  update_product: [
    { key: 'product_id', label: __('Product Id', 'bit-integrations'), required: true },
    { key: 'code', label: __('Product Code', 'bit-integrations'), required: false },
    { key: 'price', label: __('Unit Price', 'bit-integrations'), required: false },
    { key: 'type', label: __('Type', 'bit-integrations'), required: false },
    { key: 'brand', label: __('Brand', 'bit-integrations'), required: false },
    { key: 'status', label: __('Status', 'bit-integrations'), required: false },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false }
  ],
  delete_product: [
    { key: 'product_id', label: __('Product Id', 'bit-integrations'), required: true }
  ],
  add_tag_to_product: [
    { key: 'product_id', label: __('Product Id', 'bit-integrations'), required: true },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: false },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_product: [
    { key: 'product_id', label: __('Product Id', 'bit-integrations'), required: true },
    { key: 'tag_ids', label: __('Tag Ids (comma separated)', 'bit-integrations'), required: true }
  ],
  create_tag: [
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'module', label: __('Module (lead,contact,company,deal)', 'bit-integrations'), required: true }
  ],
  create_note: [
    { key: 'entity_id', label: __('Record Id', 'bit-integrations'), required: true },
    { key: 'module', label: __('Module', 'bit-integrations'), required: true },
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'details', label: __('Details', 'bit-integrations'), required: false },
    { key: 'is_shared', label: __('Is Shared (1/0)', 'bit-integrations'), required: false }
  ],
  create_activity: [
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'type', label: __('Type (task,meeting,call,note)', 'bit-integrations'), required: true },
    { key: 'entity_id', label: __('Record Id', 'bit-integrations'), required: true },
    { key: 'module', label: __('Module', 'bit-integrations'), required: true },
    { key: 'assigned_to', label: __('Assigned To (user id)', 'bit-integrations'), required: true },
    { key: 'priority', label: __('Priority (low,medium,high)', 'bit-integrations'), required: false },
    { key: 'due_date', label: __('Due Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
    { key: 'details', label: __('Details', 'bit-integrations'), required: false }
  ],
  create_invoice: [
    { key: 'invoice_date', label: __('Invoice Date (YYYY-MM-DD)', 'bit-integrations'), required: true },
    { key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true },
    { key: 'term_key', label: __('Payment Term Key', 'bit-integrations'), required: true },
    { key: 'due_date', label: __('Due Date (YYYY-MM-DD)', 'bit-integrations'), required: true },
    { key: 'tax_option', label: __('Tax Option (exclusive,inclusive)', 'bit-integrations'), required: true },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: true },
    { key: 'invoice_prefix', label: __('Invoice Prefix', 'bit-integrations'), required: true }
  ]
}
