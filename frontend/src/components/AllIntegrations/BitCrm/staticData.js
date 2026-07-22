import { __ } from '../../../Utils/i18nwrap'
import {
  activityTypeOptions,
  convertToOptions,
  dealLeadSourceOptions,
  dealTypeOptions,
  leadSourceOptions,
  leadStatusOptions,
  moduleOptions,
  priorityOptions,
  productStatusOptions,
  productTypeOptions,
  taxOptions,
  titleOptions
} from './options'

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
  {
    name: 'remove_tag_from_contact',
    label: __('Remove Tag From Contact', 'bit-integrations'),
    is_pro: false
  },
  { name: 'create_company', label: __('Create Company', 'bit-integrations'), is_pro: false },
  { name: 'update_company', label: __('Update Company', 'bit-integrations'), is_pro: false },
  { name: 'delete_company', label: __('Delete Company', 'bit-integrations'), is_pro: false },
  { name: 'add_tag_to_company', label: __('Add Tag To Company', 'bit-integrations'), is_pro: false },
  {
    name: 'remove_tag_from_company',
    label: __('Remove Tag From Company', 'bit-integrations'),
    is_pro: false
  },
  { name: 'create_deal', label: __('Create Deal', 'bit-integrations'), is_pro: false },
  { name: 'update_deal', label: __('Update Deal', 'bit-integrations'), is_pro: false },
  { name: 'delete_deal', label: __('Delete Deal', 'bit-integrations'), is_pro: false },
  { name: 'update_deal_stage', label: __('Update Deal Stage', 'bit-integrations'), is_pro: false },
  { name: 'add_tag_to_deal', label: __('Add Tag To Deal', 'bit-integrations'), is_pro: false },
  { name: 'remove_tag_from_deal', label: __('Remove Tag From Deal', 'bit-integrations'), is_pro: false },
  { name: 'create_product', label: __('Create Product', 'bit-integrations'), is_pro: false },
  { name: 'update_product', label: __('Update Product', 'bit-integrations'), is_pro: false },
  { name: 'delete_product', label: __('Delete Product', 'bit-integrations'), is_pro: false },
  { name: 'add_tag_to_product', label: __('Add Tag To Product', 'bit-integrations'), is_pro: false },
  {
    name: 'remove_tag_from_product',
    label: __('Remove Tag From Product', 'bit-integrations'),
    is_pro: false
  },
  { name: 'create_tag', label: __('Create Tag', 'bit-integrations'), is_pro: false },
  { name: 'create_note', label: __('Create Note', 'bit-integrations'), is_pro: false },
  { name: 'create_activity', label: __('Create Activity', 'bit-integrations'), is_pro: false },
  { name: 'create_invoice', label: __('Create Invoice', 'bit-integrations'), is_pro: false }
]

// ---- Field maps: ONLY the target's required identifier + free-text fields ----
export const bitCrmStaticData = {
  create_lead: [
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'company_name', label: __('Company Name', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'owner_email', label: __('Owner (email)', 'bit-integrations'), required: false }
  ],
  update_lead: [
    { key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'company_name', label: __('Company Name', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'owner_email', label: __('Owner (email)', 'bit-integrations'), required: false }
  ],
  delete_lead: [{ key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true }],
  add_tag_to_lead: [
    { key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_lead: [{ key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true }],
  convert_lead: [
    { key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true },
    { key: 'owner_email', label: __('Owner (email)', 'bit-integrations'), required: false }
  ],

  create_contact: [
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'owner_email', label: __('Owner (email)', 'bit-integrations'), required: false }
  ],
  update_contact: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'owner_email', label: __('Owner (email)', 'bit-integrations'), required: false }
  ],
  delete_contact: [{ key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true }],
  add_tag_to_contact: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_contact: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true }
  ],

  create_company: [
    { key: 'name', label: __('Company Name', 'bit-integrations'), required: true },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'owner_email', label: __('Owner (email)', 'bit-integrations'), required: false }
  ],
  update_company: [
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: true },
    { key: 'name', label: __('Company Name', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'owner_email', label: __('Owner (email)', 'bit-integrations'), required: false }
  ],
  delete_company: [{ key: 'company_id', label: __('Company Id', 'bit-integrations'), required: true }],
  add_tag_to_company: [
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: true },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_company: [
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: true }
  ],

  create_deal: [
    { key: 'name', label: __('Deal Name', 'bit-integrations'), required: true },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'owner_email', label: __('Owner (email)', 'bit-integrations'), required: false }
  ],
  update_deal: [
    { key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true },
    { key: 'name', label: __('Deal Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'owner_email', label: __('Owner (email)', 'bit-integrations'), required: false }
  ],
  delete_deal: [{ key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true }],
  update_deal_stage: [{ key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true }],
  add_tag_to_deal: [
    { key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_deal: [{ key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true }],

  create_product: [
    { key: 'name', label: __('Product Name', 'bit-integrations'), required: true },
    { key: 'code', label: __('Product Code', 'bit-integrations'), required: true },
    { key: 'price', label: __('Unit Price', 'bit-integrations'), required: false },
    { key: 'brand', label: __('Brand', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ],
  update_product: [
    { key: 'product_id', label: __('Product Id', 'bit-integrations'), required: true },
    { key: 'name', label: __('Product Name', 'bit-integrations'), required: false },
    { key: 'code', label: __('Product Code', 'bit-integrations'), required: false },
    { key: 'price', label: __('Unit Price', 'bit-integrations'), required: false },
    { key: 'brand', label: __('Brand', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ],
  delete_product: [{ key: 'product_id', label: __('Product Id', 'bit-integrations'), required: true }],
  add_tag_to_product: [
    { key: 'product_id', label: __('Product Id', 'bit-integrations'), required: true },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_product: [
    { key: 'product_id', label: __('Product Id', 'bit-integrations'), required: true }
  ],

  create_tag: [{ key: 'title', label: __('Title', 'bit-integrations'), required: true }],
  create_note: [
    { key: 'entity_id', label: __('Record Id', 'bit-integrations'), required: true },
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'details', label: __('Details', 'bit-integrations'), required: false }
  ],
  create_activity: [
    { key: 'entity_id', label: __('Record Id', 'bit-integrations'), required: true },
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'due_date', label: __('Due Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
    { key: 'details', label: __('Details', 'bit-integrations'), required: false },
    { key: 'assigned_to_email', label: __('Assigned To (email)', 'bit-integrations'), required: true }
  ],
  create_invoice: [
    { key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true },
    { key: 'invoice_date', label: __('Invoice Date (YYYY-MM-DD)', 'bit-integrations'), required: true },
    { key: 'due_date', label: __('Due Date (YYYY-MM-DD)', 'bit-integrations'), required: true },
    { key: 'invoice_prefix', label: __('Invoice Prefix', 'bit-integrations'), required: true }
  ]
}

// ---- Fetched dropdowns: reusable descriptors (key = conf storage key) ----
const currency = {
  key: 'selectedCurrency',
  label: __('Currency', 'bit-integrations'),
  route: 'refresh_bitcrm_currencies',
  listKey: 'allCurrencies'
}
const stage = {
  key: 'selectedStage',
  label: __('Deal Stage', 'bit-integrations'),
  route: 'refresh_bitcrm_deal_stages',
  listKey: 'allStages',
  required: true
}
const termKey = {
  key: 'selectedTermKey',
  label: __('Payment Term', 'bit-integrations'),
  route: 'refresh_bitcrm_invoice_terms',
  listKey: 'allTerms',
  required: true
}
const contact = {
  key: 'selectedContact',
  label: __('Contact', 'bit-integrations'),
  route: 'refresh_bitcrm_contacts',
  listKey: 'allContacts',
  required: true
}
const company = {
  key: 'selectedCompany',
  label: __('Company', 'bit-integrations'),
  route: 'refresh_bitcrm_companies',
  listKey: 'allCompanies'
}
const parentContact = {
  key: 'selectedParent',
  label: __('Parent Contact', 'bit-integrations'),
  route: 'refresh_bitcrm_contacts',
  listKey: 'allContacts'
}
const parentCompany = {
  key: 'selectedParent',
  label: __('Parent Company', 'bit-integrations'),
  route: 'refresh_bitcrm_companies',
  listKey: 'allCompanies'
}
const tags = route => ({
  key: 'selectedTags',
  label: __('Tags', 'bit-integrations'),
  route,
  listKey: 'allTags',
  multi: true
})
const leadTags = tags('refresh_bitcrm_lead_tags')
const contactTags = tags('refresh_bitcrm_contact_tags')
const companyTags = tags('refresh_bitcrm_company_tags')
const dealTags = tags('refresh_bitcrm_deal_tags')
const productTags = tags('refresh_bitcrm_product_tags')

export const actionDropdowns = {
  create_lead: [currency, leadTags],
  update_lead: [currency, leadTags],
  add_tag_to_lead: [leadTags],
  remove_tag_from_lead: [leadTags],
  convert_lead: [],

  create_contact: [company, parentContact, currency, contactTags],
  update_contact: [company, parentContact, currency, contactTags],
  add_tag_to_contact: [contactTags],
  remove_tag_from_contact: [contactTags],

  create_company: [parentCompany, currency, companyTags],
  update_company: [parentCompany, currency, companyTags],
  add_tag_to_company: [companyTags],
  remove_tag_from_company: [companyTags],

  create_deal: [stage, contact, company, currency, dealTags],
  update_deal: [stage, contact, company, currency, dealTags],
  update_deal_stage: [stage],
  add_tag_to_deal: [dealTags],
  remove_tag_from_deal: [dealTags],

  create_product: [productTags],
  update_product: [productTags],
  add_tag_to_product: [productTags],
  remove_tag_from_product: [productTags],

  create_activity: [],
  create_invoice: [termKey, currency]
}

// ---- Fixed enum selects: reusable descriptors (key = conf storage key) ----
const titleSel = { key: 'title', label: __('Title', 'bit-integrations'), options: titleOptions }
const leadSourceSel = {
  key: 'leadSource',
  label: __('Lead Source', 'bit-integrations'),
  options: leadSourceOptions
}
const leadStatusSel = {
  key: 'leadStatus',
  label: __('Lead Status', 'bit-integrations'),
  options: leadStatusOptions
}
const dealTypeSel = {
  key: 'dealType',
  label: __('Deal Type', 'bit-integrations'),
  options: dealTypeOptions
}
const dealLeadSourceSel = {
  key: 'dealLeadSource',
  label: __('Lead Source', 'bit-integrations'),
  options: dealLeadSourceOptions
}
const productTypeSel = {
  key: 'productType',
  label: __('Product Type', 'bit-integrations'),
  options: productTypeOptions
}
const productStatusSel = {
  key: 'productStatus',
  label: __('Status', 'bit-integrations'),
  options: productStatusOptions
}
const moduleSel = {
  key: 'module',
  label: __('Module', 'bit-integrations'),
  options: moduleOptions,
  required: true
}
const convertToSel = {
  key: 'convertTo',
  label: __('Convert To', 'bit-integrations'),
  options: convertToOptions,
  multi: true,
  required: true
}
const moveRelatedSel = {
  key: 'moveRelatedDataTo',
  label: __('Move Related Data To', 'bit-integrations'),
  options: convertToOptions,
  required: true
}
const activityTypeSel = {
  key: 'activityType',
  label: __('Type', 'bit-integrations'),
  options: activityTypeOptions,
  required: true
}
const prioritySel = {
  key: 'priority',
  label: __('Priority', 'bit-integrations'),
  options: priorityOptions
}
const taxSel = {
  key: 'taxOption',
  label: __('Tax Option', 'bit-integrations'),
  options: taxOptions,
  required: true
}

export const actionSelects = {
  create_lead: [titleSel, leadSourceSel, leadStatusSel],
  update_lead: [titleSel, leadSourceSel, leadStatusSel],
  create_contact: [titleSel, leadSourceSel],
  update_contact: [titleSel, leadSourceSel],
  create_deal: [dealTypeSel, dealLeadSourceSel],
  update_deal: [dealTypeSel, dealLeadSourceSel],
  create_product: [productTypeSel, productStatusSel],
  update_product: [productTypeSel, productStatusSel],
  convert_lead: [convertToSel, moveRelatedSel],
  create_tag: [moduleSel],
  create_note: [moduleSel],
  create_activity: [activityTypeSel, prioritySel, moduleSel],
  create_invoice: [taxSel]
}

// ---- Utilities: boolean options ----
const isSharedUtil = {
  key: 'is_shared',
  label: __('Shared', 'bit-integrations'),
  subTitle: __('Share this record on the client portal', 'bit-integrations')
}

export const actionUtilities = {
  create_note: [isSharedUtil],
  create_activity: [isSharedUtil]
}
