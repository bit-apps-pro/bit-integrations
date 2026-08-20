import { __ } from '../../../Utils/i18nwrap'
import {
  activityStatusOptions,
  convertToOptions,
  invoiceStatusOptions,
  moduleOptions,
  portalCapabilityOptions,
  priorityOptions,
  taxOptions
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
  { name: 'update_tag', label: __('Update Tag', 'bit-integrations'), is_pro: false },
  { name: 'delete_tag', label: __('Delete Tag', 'bit-integrations'), is_pro: false },
  { name: 'create_note', label: __('Create Note', 'bit-integrations'), is_pro: false },
  { name: 'update_note', label: __('Update Note', 'bit-integrations'), is_pro: false },
  { name: 'delete_note', label: __('Delete Note', 'bit-integrations'), is_pro: false },
  // Bit CRM keeps tasks, meetings and calls in one activities table and tells
  // them apart by type, so each gets its own action instead of a type dropdown.
  { name: 'create_task', label: __('Create Task', 'bit-integrations'), is_pro: false },
  { name: 'update_task', label: __('Update Task', 'bit-integrations'), is_pro: false },
  { name: 'update_task_status', label: __('Update Task Status', 'bit-integrations'), is_pro: false },
  { name: 'delete_task', label: __('Delete Task', 'bit-integrations'), is_pro: false },
  { name: 'create_meeting', label: __('Create Meeting', 'bit-integrations'), is_pro: false },
  { name: 'update_meeting', label: __('Update Meeting', 'bit-integrations'), is_pro: false },
  {
    name: 'update_meeting_status',
    label: __('Update Meeting Status', 'bit-integrations'),
    is_pro: false
  },
  { name: 'delete_meeting', label: __('Delete Meeting', 'bit-integrations'), is_pro: false },
  { name: 'create_call', label: __('Create Call', 'bit-integrations'), is_pro: false },
  { name: 'update_call', label: __('Update Call', 'bit-integrations'), is_pro: false },
  { name: 'update_call_status', label: __('Update Call Status', 'bit-integrations'), is_pro: false },
  { name: 'delete_call', label: __('Delete Call', 'bit-integrations'), is_pro: false },
  { name: 'create_invoice', label: __('Create Invoice', 'bit-integrations'), is_pro: false },
  { name: 'update_invoice', label: __('Update Invoice', 'bit-integrations'), is_pro: false },
  {
    name: 'update_invoice_status',
    label: __('Update Invoice Status', 'bit-integrations'),
    is_pro: false
  },
  { name: 'delete_invoice', label: __('Delete Invoice', 'bit-integrations'), is_pro: false },
  { name: 'grant_portal_access', label: __('Grant Portal Access', 'bit-integrations'), is_pro: false },
  {
    name: 'update_portal_access',
    label: __('Update Portal Capabilities', 'bit-integrations'),
    is_pro: false
  },
  {
    name: 'update_portal_password',
    label: __('Update Portal Password', 'bit-integrations'),
    is_pro: false
  },
  { name: 'revoke_portal_access', label: __('Revoke Portal Access', 'bit-integrations'), is_pro: false }
]

// Task, meeting and call are the same activities table with a different `type`,
// so their four actions share one shape. `activity_id` is the target identifier
// and stays in the field map; the label just names the type. The record the
// activity hangs off is picked from the list the module select feeds.
const activityLabels = {
  call: __('Call Id', 'bit-integrations'),
  meeting: __('Meeting Id', 'bit-integrations'),
  task: __('Task Id', 'bit-integrations')
}

function activityFieldMaps(type) {
  const idField = { key: 'activity_id', label: activityLabels[type], required: true }

  return {
    [`create_${type}`]: [
      { key: 'title', label: __('Title', 'bit-integrations'), required: true },
      { key: 'due_date', label: __('Due Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
      { key: 'details', label: __('Details', 'bit-integrations'), required: false }
    ],
    [`update_${type}`]: [
      idField,
      { key: 'title', label: __('Title', 'bit-integrations'), required: false },
      { key: 'due_date', label: __('Due Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
      { key: 'details', label: __('Details', 'bit-integrations'), required: false }
    ],
    [`update_${type}_status`]: [idField],
    [`delete_${type}`]: [idField]
  }
}

// ---- Field maps: ONLY the target's required identifier + free-text fields ----
// An action in actionFieldModules carries nothing here but the record id, which
// is this integration's own input rather than a Bit CRM field.
export const bitCrmStaticData = {
  update_lead: [{ key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true }],
  delete_lead: [{ key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true }],
  add_tag_to_lead: [
    { key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_lead: [{ key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true }],
  convert_lead: [{ key: 'lead_id', label: __('Lead Id', 'bit-integrations'), required: true }],

  update_contact: [{ key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true }],
  delete_contact: [{ key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true }],
  add_tag_to_contact: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_contact: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true }
  ],

  update_company: [{ key: 'company_id', label: __('Company Id', 'bit-integrations'), required: true }],
  delete_company: [{ key: 'company_id', label: __('Company Id', 'bit-integrations'), required: true }],
  add_tag_to_company: [
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: true },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_company: [
    { key: 'company_id', label: __('Company Id', 'bit-integrations'), required: true }
  ],

  update_deal: [{ key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true }],
  delete_deal: [{ key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true }],
  update_deal_stage: [{ key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true }],
  add_tag_to_deal: [
    { key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_deal: [{ key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true }],

  update_product: [{ key: 'product_id', label: __('Product Id', 'bit-integrations'), required: true }],
  delete_product: [{ key: 'product_id', label: __('Product Id', 'bit-integrations'), required: true }],
  add_tag_to_product: [
    { key: 'product_id', label: __('Product Id', 'bit-integrations'), required: true },
    { key: 'new_tags', label: __('New Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  remove_tag_from_product: [
    { key: 'product_id', label: __('Product Id', 'bit-integrations'), required: true }
  ],

  create_tag: [{ key: 'title', label: __('Title', 'bit-integrations'), required: true }],
  update_tag: [
    { key: 'tag_id', label: __('Tag Id', 'bit-integrations'), required: true },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false }
  ],
  delete_tag: [{ key: 'tag_id', label: __('Tag Id', 'bit-integrations'), required: true }],

  create_note: [
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'details', label: __('Details', 'bit-integrations'), required: false }
  ],
  update_note: [
    { key: 'note_id', label: __('Note Id', 'bit-integrations'), required: true },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'details', label: __('Details', 'bit-integrations'), required: false }
  ],
  delete_note: [{ key: 'note_id', label: __('Note Id', 'bit-integrations'), required: true }],

  ...activityFieldMaps('task'),
  ...activityFieldMaps('meeting'),
  ...activityFieldMaps('call'),

  create_invoice: [
    { key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: true },
    { key: 'invoice_date', label: __('Invoice Date (YYYY-MM-DD)', 'bit-integrations'), required: true },
    { key: 'due_date', label: __('Due Date (YYYY-MM-DD)', 'bit-integrations'), required: true },
    { key: 'invoice_prefix', label: __('Invoice Prefix', 'bit-integrations'), required: true }
  ],
  update_invoice: [
    { key: 'invoice_id', label: __('Invoice Id', 'bit-integrations'), required: true },
    { key: 'deal_id', label: __('Deal Id', 'bit-integrations'), required: false },
    { key: 'invoice_date', label: __('Invoice Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
    { key: 'due_date', label: __('Due Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
    { key: 'invoice_prefix', label: __('Invoice Prefix', 'bit-integrations'), required: false }
  ],
  update_invoice_status: [
    { key: 'invoice_id', label: __('Invoice Id', 'bit-integrations'), required: true }
  ],
  delete_invoice: [{ key: 'invoice_id', label: __('Invoice Id', 'bit-integrations'), required: true }],

  // Portal access is keyed to the contact email, so the contact is the target
  // identifier for every portal action.
  grant_portal_access: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true }
  ],
  update_portal_access: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true }
  ],
  update_portal_password: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true },
    { key: 'password', label: __('New Password', 'bit-integrations'), required: true }
  ],
  revoke_portal_access: [
    { key: 'contact_id', label: __('Contact Id', 'bit-integrations'), required: true }
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
const assignee = {
  key: 'selectedAssignee',
  label: __('Assigned To', 'bit-integrations'),
  route: 'refresh_bitcrm_users',
  listKey: 'allUsers',
  required: true
}
const record = {
  key: 'selectedEntity',
  label: __('Record', 'bit-integrations'),
  route: 'refresh_bitcrm_entities',
  listKey: 'allEntities',
  dependsOn: 'module',
  required: true
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

// Joins the field map only for a stage that closes the deal, where Bit CRM
// requires it.
export const closingDateField = {
  key: 'closed_at',
  label: __('Closing Date (YYYY-MM-DD HH:MM:SS)', 'bit-integrations'),
  required: true
}

export const CLOSING_STAGE_CATEGORIES = ['closed_won', 'closed_lost']

// Rows the field map only sometimes carries, so a stale one can be dropped when
// the configuration that asked for it changes.
export const conditionalFieldKeys = [closingDateField.key]

// Bit CRM names a lookup's module, not where to read its records from. Keyed by
// `related_module`; a field pointing anywhere else is skipped.
export const lookupSources = {
  user: { route: 'refresh_bitcrm_users', listKey: 'allUsers' },
  contact: { route: 'refresh_bitcrm_contacts', listKey: 'allContacts' },
  company: { route: 'refresh_bitcrm_companies', listKey: 'allCompanies' }
}

export const actionDropdowns = {
  create_lead: [leadTags],
  add_tag_to_lead: [leadTags],
  remove_tag_from_lead: [leadTags],

  create_contact: [contactTags],
  add_tag_to_contact: [contactTags],
  remove_tag_from_contact: [contactTags],

  create_company: [companyTags],
  add_tag_to_company: [companyTags],
  remove_tag_from_company: [companyTags],

  create_deal: [dealTags],
  update_deal_stage: [stage],
  add_tag_to_deal: [dealTags],
  remove_tag_from_deal: [dealTags],

  create_product: [productTags],
  update_product: [productTags],
  add_tag_to_product: [productTags],
  remove_tag_from_product: [productTags],

  create_note: [record],

  create_task: [record, assignee],
  update_task: [
    { ...record, required: false },
    { ...assignee, required: false }
  ],
  create_meeting: [record, assignee],
  update_meeting: [
    { ...record, required: false },
    { ...assignee, required: false }
  ],
  create_call: [record, assignee],
  update_call: [
    { ...record, required: false },
    { ...assignee, required: false }
  ],

  create_invoice: [termKey, { ...currency, required: true }],
  // Everything is optional on update — an unset select leaves the column alone.
  update_invoice: [{ ...termKey, required: false }, currency]
}

// ---- Fixed enum selects: reusable descriptors (key = conf storage key) ----
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
  required: true,
  lockedValues: ['contact', 'company'],
  defaultValue: 'contact,company'
}
const moveRelatedSel = {
  key: 'moveRelatedDataTo',
  label: __('Move Related Data To', 'bit-integrations'),
  options: convertToOptions,
  required: true
}
const moduleOptionalSel = {
  key: 'module',
  label: __('Module', 'bit-integrations'),
  options: moduleOptions
}
// Bit CRM only asks for a priority on tasks, never on meetings or calls.
const prioritySel = {
  key: 'priority',
  label: __('Priority', 'bit-integrations'),
  options: priorityOptions
}
const priorityRequiredSel = { ...prioritySel, required: true }
const activityStatusSel = {
  key: 'activityStatus',
  label: __('Status', 'bit-integrations'),
  options: activityStatusOptions,
  required: true
}
const taxSel = {
  key: 'taxOption',
  label: __('Tax Option', 'bit-integrations'),
  options: taxOptions,
  required: true
}
const invoiceStatusSel = {
  key: 'invoiceStatus',
  label: __('Status', 'bit-integrations'),
  options: invoiceStatusOptions,
  required: true
}
const portalCapabilitiesSel = {
  key: 'capabilities',
  label: __('Capabilities', 'bit-integrations'),
  options: portalCapabilityOptions,
  multi: true
}

export const actionSelects = {
  convert_lead: [convertToSel, moveRelatedSel],
  create_tag: [moduleSel],
  update_tag: [moduleOptionalSel],
  create_note: [moduleSel],

  create_task: [priorityRequiredSel, moduleSel],
  update_task: [prioritySel, moduleOptionalSel],
  update_task_status: [activityStatusSel],
  create_meeting: [moduleSel],
  update_meeting: [moduleOptionalSel],
  update_meeting_status: [activityStatusSel],
  create_call: [moduleSel],
  update_call: [moduleOptionalSel],
  update_call_status: [activityStatusSel],

  create_invoice: [taxSel],
  update_invoice: [
    {
      ...taxSel,
      helperText: __(
        'Existing line items keep the tax mode they were created with.',
        'bit-integrations'
      ),
      required: false
    },
    { ...invoiceStatusSel, required: false }
  ],
  update_invoice_status: [invoiceStatusSel],

  grant_portal_access: [portalCapabilitiesSel],
  update_portal_access: [portalCapabilitiesSel]
}

// An action listed here builds its selects, record pickers and field map from
// what Bit CRM reports for the module instead of from this file.
export const actionFieldModules = {
  create_lead: 'lead',
  update_lead: 'lead',
  create_contact: 'contact',
  update_contact: 'contact',
  create_company: 'company',
  update_company: 'company',
  create_deal: 'deal',
  update_deal: 'deal',
  create_product: 'product',
  update_product: 'product'
}

// Every conf key a select or dropdown can write, so switching action can clear
// the ones the new action does not use. Several keys share a Bit CRM field
// (status, type, lead source), and a leftover value would otherwise win.
export const allConfigurableKeys = [
  ...new Set(
    [...Object.values(actionSelects), ...Object.values(actionDropdowns)].flat().map(item => item.key)
  )
]

// ---- Utilities: boolean options ----
const isSharedUtil = {
  key: 'is_shared',
  label: __('Shared', 'bit-integrations'),
  subTitle: __('Share this record on the client portal', 'bit-integrations')
}

export const actionUtilities = {
  create_note: [isSharedUtil],
  update_note: [isSharedUtil],
  create_task: [isSharedUtil],
  update_task: [isSharedUtil],
  create_meeting: [isSharedUtil],
  update_meeting: [isSharedUtil],
  create_call: [isSharedUtil],
  update_call: [isSharedUtil]
}
