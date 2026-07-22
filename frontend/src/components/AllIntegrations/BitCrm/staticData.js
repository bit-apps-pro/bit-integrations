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

const R = (key, label) => ({ key, label: __(label, 'bit-integrations'), required: true })
const O = (key, label) => ({ key, label: __(label, 'bit-integrations'), required: false })

// ---- Field maps: ONLY the target's required identifier + free-text fields ----
export const bitCrmStaticData = {
  create_lead: [
    R('last_name', 'Last Name'),
    O('first_name', 'First Name'),
    O('email', 'Email'),
    O('phone', 'Phone'),
    O('company_name', 'Company Name'),
    O('website', 'Website'),
    O('description', 'Description')
  ],
  update_lead: [
    R('lead_id', 'Lead Id'),
    O('first_name', 'First Name'),
    O('last_name', 'Last Name'),
    O('email', 'Email'),
    O('phone', 'Phone'),
    O('company_name', 'Company Name'),
    O('website', 'Website'),
    O('description', 'Description')
  ],
  delete_lead: [R('lead_id', 'Lead Id')],
  add_tag_to_lead: [R('lead_id', 'Lead Id'), O('new_tags', 'New Tags (comma separated)')],
  remove_tag_from_lead: [R('lead_id', 'Lead Id')],
  convert_lead: [R('lead_id', 'Lead Id')],

  create_contact: [
    R('last_name', 'Last Name'),
    O('first_name', 'First Name'),
    O('email', 'Email'),
    O('phone', 'Phone'),
    O('description', 'Description')
  ],
  update_contact: [
    R('contact_id', 'Contact Id'),
    O('first_name', 'First Name'),
    O('last_name', 'Last Name'),
    O('email', 'Email'),
    O('phone', 'Phone'),
    O('description', 'Description')
  ],
  delete_contact: [R('contact_id', 'Contact Id')],
  add_tag_to_contact: [R('contact_id', 'Contact Id'), O('new_tags', 'New Tags (comma separated)')],
  remove_tag_from_contact: [R('contact_id', 'Contact Id')],

  create_company: [
    R('name', 'Company Name'),
    O('phone', 'Phone'),
    O('website', 'Website'),
    O('description', 'Description')
  ],
  update_company: [
    R('company_id', 'Company Id'),
    O('name', 'Company Name'),
    O('phone', 'Phone'),
    O('website', 'Website'),
    O('description', 'Description')
  ],
  delete_company: [R('company_id', 'Company Id')],
  add_tag_to_company: [R('company_id', 'Company Id'), O('new_tags', 'New Tags (comma separated)')],
  remove_tag_from_company: [R('company_id', 'Company Id')],

  create_deal: [R('name', 'Deal Name'), O('email', 'Email')],
  update_deal: [R('deal_id', 'Deal Id'), O('name', 'Deal Name'), O('email', 'Email')],
  delete_deal: [R('deal_id', 'Deal Id')],
  update_deal_stage: [R('deal_id', 'Deal Id')],
  add_tag_to_deal: [R('deal_id', 'Deal Id'), O('new_tags', 'New Tags (comma separated)')],
  remove_tag_from_deal: [R('deal_id', 'Deal Id')],

  create_product: [
    R('name', 'Product Name'),
    R('code', 'Product Code'),
    O('price', 'Unit Price'),
    O('brand', 'Brand'),
    O('description', 'Description')
  ],
  update_product: [
    R('product_id', 'Product Id'),
    O('name', 'Product Name'),
    O('code', 'Product Code'),
    O('price', 'Unit Price'),
    O('brand', 'Brand'),
    O('description', 'Description')
  ],
  delete_product: [R('product_id', 'Product Id')],
  add_tag_to_product: [R('product_id', 'Product Id'), O('new_tags', 'New Tags (comma separated)')],
  remove_tag_from_product: [R('product_id', 'Product Id')],

  create_tag: [R('title', 'Title')],
  create_note: [R('entity_id', 'Record Id'), R('title', 'Title'), O('details', 'Details')],
  create_activity: [
    R('entity_id', 'Record Id'),
    R('title', 'Title'),
    O('due_date', 'Due Date (YYYY-MM-DD)'),
    O('details', 'Details')
  ],
  create_invoice: [
    R('deal_id', 'Deal Id'),
    R('invoice_date', 'Invoice Date (YYYY-MM-DD)'),
    R('due_date', 'Due Date (YYYY-MM-DD)'),
    R('invoice_prefix', 'Invoice Prefix')
  ]
}

// ---- Fetched dropdowns: reusable descriptors (key = conf storage key) ----
const owner = {
  key: 'selectedOwner',
  label: __('Owner', 'bit-integrations'),
  route: 'refresh_bitcrm_users',
  listKey: 'allUsers'
}
const ownerNew = {
  key: 'selectedOwner',
  label: __('Assign New Records To', 'bit-integrations'),
  route: 'refresh_bitcrm_users',
  listKey: 'allUsers'
}
const assignedTo = {
  key: 'selectedAssignedTo',
  label: __('Assigned To', 'bit-integrations'),
  route: 'refresh_bitcrm_users',
  listKey: 'allUsers',
  required: true
}
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
  create_lead: [owner, currency, leadTags],
  update_lead: [owner, currency, leadTags],
  add_tag_to_lead: [leadTags],
  remove_tag_from_lead: [leadTags],
  convert_lead: [ownerNew],

  create_contact: [company, parentContact, owner, currency, contactTags],
  update_contact: [company, parentContact, owner, currency, contactTags],
  add_tag_to_contact: [contactTags],
  remove_tag_from_contact: [contactTags],

  create_company: [parentCompany, owner, currency, companyTags],
  update_company: [parentCompany, owner, currency, companyTags],
  add_tag_to_company: [companyTags],
  remove_tag_from_company: [companyTags],

  create_deal: [stage, contact, company, owner, currency, dealTags],
  update_deal: [stage, contact, company, owner, currency, dealTags],
  update_deal_stage: [stage],
  add_tag_to_deal: [dealTags],
  remove_tag_from_deal: [dealTags],

  create_product: [productTags],
  update_product: [productTags],
  add_tag_to_product: [productTags],
  remove_tag_from_product: [productTags],

  create_activity: [assignedTo],
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
