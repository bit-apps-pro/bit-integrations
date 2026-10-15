import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_invoice', label: __('Create Invoice', 'bit-integrations'), is_pro: true },
  { name: 'update_invoice', label: __('Update Invoice', 'bit-integrations'), is_pro: true },
  { name: 'delete_invoice', label: __('Delete Invoice', 'bit-integrations'), is_pro: true },
  { name: 'create_client', label: __('Create Client', 'bit-integrations'), is_pro: true },
  { name: 'update_client', label: __('Update Client', 'bit-integrations'), is_pro: true },
  { name: 'delete_client', label: __('Delete Client', 'bit-integrations'), is_pro: true },
  { name: 'create_expense', label: __('Create Expense', 'bit-integrations'), is_pro: true },
  { name: 'update_expense', label: __('Update Expense', 'bit-integrations'), is_pro: true },
  { name: 'delete_expense', label: __('Delete Expense', 'bit-integrations'), is_pro: true },
  { name: 'create_payment', label: __('Create Payment', 'bit-integrations'), is_pro: true },
  { name: 'update_payment', label: __('Update Payment', 'bit-integrations'), is_pro: true },
  { name: 'delete_payment', label: __('Delete Payment', 'bit-integrations'), is_pro: true },
  { name: 'create_estimate', label: __('Create Estimate', 'bit-integrations'), is_pro: true },
  { name: 'update_estimate', label: __('Update Estimate', 'bit-integrations'), is_pro: true },
  { name: 'delete_estimate', label: __('Delete Estimate', 'bit-integrations'), is_pro: true },
  { name: 'create_item', label: __('Create Item', 'bit-integrations'), is_pro: true },
  { name: 'update_item', label: __('Update Item', 'bit-integrations'), is_pro: true },
  { name: 'delete_item', label: __('Delete Item', 'bit-integrations'), is_pro: true },
  { name: 'create_tax', label: __('Create Tax', 'bit-integrations'), is_pro: true },
  { name: 'update_tax', label: __('Update Tax', 'bit-integrations'), is_pro: true },
  { name: 'delete_tax', label: __('Delete Tax', 'bit-integrations'), is_pro: true },
  { name: 'create_credit_note', label: __('Create Credit Note', 'bit-integrations'), is_pro: true },
  { name: 'update_credit_note', label: __('Update Credit Note', 'bit-integrations'), is_pro: true },
  { name: 'delete_credit_note', label: __('Delete Credit Note', 'bit-integrations'), is_pro: true },
  { name: 'create_bill', label: __('Create Bill', 'bit-integrations'), is_pro: true },
  { name: 'update_bill', label: __('Update Bill', 'bit-integrations'), is_pro: true },
  { name: 'delete_bill', label: __('Delete Bill', 'bit-integrations'), is_pro: true },
  {
    name: 'create_recurring_profile',
    label: __('Create Recurring Profile', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_recurring_profile',
    label: __('Update Recurring Profile', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_recurring_profile',
    label: __('Delete Recurring Profile', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_project', label: __('Create Project', 'bit-integrations'), is_pro: true },
  { name: 'update_project', label: __('Update Project', 'bit-integrations'), is_pro: true },
  { name: 'delete_project', label: __('Delete Project', 'bit-integrations'), is_pro: true },
  { name: 'create_time_entry', label: __('Create Time Entry', 'bit-integrations'), is_pro: true },
  { name: 'update_time_entry', label: __('Update Time Entry', 'bit-integrations'), is_pro: true },
  { name: 'delete_time_entry', label: __('Delete Time Entry', 'bit-integrations'), is_pro: true },
  { name: 'create_service', label: __('Create Service', 'bit-integrations'), is_pro: true }
]

const creditTypeOptions = [
  { label: __('Goodwill', 'bit-integrations'), value: 'goodwill' },
  { label: __('Prepayment', 'bit-integrations'), value: 'prepayment' }
]

const projectTypeOptions = [
  { label: __('Fixed Price', 'bit-integrations'), value: 'fixed_price' },
  { label: __('Hourly Rate', 'bit-integrations'), value: 'hourly_rate' }
]

const billingMethodOptions = [
  { label: __('Project Rate', 'bit-integrations'), value: 'project_rate' },
  { label: __('Service Rate', 'bit-integrations'), value: 'service_rate' },
  { label: __('Team Member Rate', 'bit-integrations'), value: 'team_member_rate' },
  { label: __('Business Rate', 'bit-integrations'), value: 'business_rate' }
]

const field = (key, label, required = false) => ({ key, label, required })

const createDateField = required =>
  field('create_date', __('Create Date (YYYY-MM-DD)', 'bit-integrations'), required)
const currencyField = (required = false) =>
  field('currency_code', __('Currency Code (USD, EUR)', 'bit-integrations'), required)
const languageField = field('language', __('Language (en, fr)', 'bit-integrations'))
const discountField = field('discount_value', __('Discount Value (%)', 'bit-integrations'))
const dueOffsetField = field('due_offset_days', __('Due Offset (days)', 'bit-integrations'))
const poNumberField = field('po_number', __('PO Number', 'bit-integrations'))
const notesField = field('notes', __('Notes', 'bit-integrations'))
const termsField = field('terms', __('Terms', 'bit-integrations'))
const noteField = field('note', __('Note', 'bit-integrations'))
const amountField = required => field('amount', __('Amount', 'bit-integrations'), required)
const dueDateField = field('due_date', __('Due Date (YYYY-MM-DD)', 'bit-integrations'))

const lineNameField = field('line_name', __('Line Item Name', 'bit-integrations'))
const lineDescriptionField = field('line_description', __('Line Item Description', 'bit-integrations'))
const lineQuantityField = field('line_quantity', __('Line Item Quantity', 'bit-integrations'))
const lineUnitCostField = field('line_unit_cost', __('Line Item Unit Cost', 'bit-integrations'))
const lineTaxFields = [
  field('line_tax_name', __('Line Item Tax Name', 'bit-integrations')),
  field('line_tax_amount', __('Line Item Tax Amount (%)', 'bit-integrations'))
]
const lineFields = [
  lineNameField,
  lineDescriptionField,
  lineQuantityField,
  lineUnitCostField,
  ...lineTaxFields
]

const invoiceFields = isCreate => [
  createDateField(isCreate),
  field('invoice_number', __('Invoice Number', 'bit-integrations')),
  currencyField(),
  dueOffsetField,
  discountField,
  poNumberField,
  notesField,
  termsField,
  ...lineFields
]

const clientFields = [
  field('fname', __('First Name', 'bit-integrations')),
  field('lname', __('Last Name', 'bit-integrations')),
  field('email', __('Email', 'bit-integrations')),
  field('organization', __('Organization', 'bit-integrations')),
  field('bus_phone', __('Business Phone', 'bit-integrations')),
  field('mob_phone', __('Mobile Phone', 'bit-integrations')),
  field('home_phone', __('Home Phone', 'bit-integrations')),
  field('fax', __('Fax', 'bit-integrations')),
  currencyField(),
  languageField,
  field('p_street', __('Billing Street', 'bit-integrations')),
  field('p_street2', __('Billing Street 2', 'bit-integrations')),
  field('p_city', __('Billing City', 'bit-integrations')),
  field('p_province', __('Billing Province or State', 'bit-integrations')),
  field('p_code', __('Billing Postal Code', 'bit-integrations')),
  field('p_country', __('Billing Country', 'bit-integrations')),
  field('s_street', __('Shipping Street', 'bit-integrations')),
  field('s_street2', __('Shipping Street 2', 'bit-integrations')),
  field('s_city', __('Shipping City', 'bit-integrations')),
  field('s_province', __('Shipping Province or State', 'bit-integrations')),
  field('s_code', __('Shipping Postal Code', 'bit-integrations')),
  field('s_country', __('Shipping Country', 'bit-integrations')),
  field('vat_name', __('VAT Name', 'bit-integrations')),
  field('vat_number', __('VAT Number', 'bit-integrations')),
  noteField
]

const expenseFields = isCreate => [
  amountField(isCreate),
  field('date', __('Date (YYYY-MM-DD)', 'bit-integrations'), isCreate),
  field('vendor', __('Vendor', 'bit-integrations')),
  notesField,
  field('markup_percent', __('Markup (%)', 'bit-integrations')),
  currencyField(),
  field('tax_name1', __('Tax Name 1', 'bit-integrations')),
  field('tax_percent1', __('Tax Percent 1', 'bit-integrations')),
  field('tax_amount1', __('Tax Amount 1', 'bit-integrations')),
  field('tax_name2', __('Tax Name 2', 'bit-integrations')),
  field('tax_percent2', __('Tax Percent 2', 'bit-integrations')),
  field('tax_amount2', __('Tax Amount 2', 'bit-integrations'))
]

const paymentFields = isCreate => [
  amountField(isCreate),
  field('date', __('Payment Date (YYYY-MM-DD)', 'bit-integrations'), isCreate),
  field('type', __('Payment Type (Check, Credit, Cash)', 'bit-integrations'), isCreate),
  noteField,
  ...(isCreate ? [field('order_id', __('Order ID', 'bit-integrations'))] : []),
  currencyField()
]

const estimateFields = isCreate => [
  createDateField(isCreate),
  field('estimate_number', __('Estimate Number', 'bit-integrations')),
  currencyField(),
  languageField,
  discountField,
  poNumberField,
  notesField,
  termsField,
  ...lineFields
]

const itemFields = isCreate => [
  field('name', __('Name', 'bit-integrations'), isCreate),
  field('description', __('Description', 'bit-integrations')),
  field('sku', __('SKU', 'bit-integrations')),
  field('qty', __('Quantity', 'bit-integrations')),
  field('inventory', __('Inventory', 'bit-integrations')),
  field('unit_cost', __('Unit Cost', 'bit-integrations')),
  currencyField()
]

const taxFields = isCreate => [
  field('name', __('Name', 'bit-integrations'), isCreate),
  field('amount', __('Amount (%)', 'bit-integrations')),
  field('number', __('Tax Number', 'bit-integrations'))
]

const creditNoteFields = isCreate => [
  createDateField(isCreate),
  field('credit_number', __('Credit Note Number', 'bit-integrations')),
  currencyField(isCreate),
  languageField,
  notesField,
  termsField,
  lineNameField,
  lineDescriptionField,
  lineUnitCostField,
  ...lineTaxFields
]

const billFields = [
  field('issue_date', __('Issue Date (YYYY-MM-DD)', 'bit-integrations')),
  dueDateField,
  dueOffsetField,
  field('bill_number', __('Bill Number', 'bit-integrations')),
  currencyField(),
  languageField,
  lineDescriptionField,
  lineQuantityField,
  lineUnitCostField,
  field('line_tax_name1', __('Line Item Tax Name 1', 'bit-integrations')),
  field('line_tax_percent1', __('Line Item Tax Percent 1', 'bit-integrations')),
  field('line_tax_name2', __('Line Item Tax Name 2', 'bit-integrations')),
  field('line_tax_percent2', __('Line Item Tax Percent 2', 'bit-integrations'))
]

const recurringProfileFields = isCreate => [
  createDateField(isCreate),
  field('frequency', __('Frequency (7d, 2w, m, 1y)', 'bit-integrations'), isCreate),
  field('number_recurring', __('Number of Invoices (0 for no limit)', 'bit-integrations'), isCreate),
  dueOffsetField,
  currencyField(),
  discountField,
  poNumberField,
  notesField,
  termsField,
  ...lineFields
]

const projectFields = isCreate => [
  field('title', __('Title', 'bit-integrations'), isCreate),
  field('description', __('Description', 'bit-integrations')),
  dueDateField,
  field('fixed_price', __('Fixed Price', 'bit-integrations')),
  field('rate', __('Hourly Rate', 'bit-integrations')),
  field('budget', __('Budget', 'bit-integrations'))
]

const timeEntryFields = isCreate => [
  field('duration', __('Duration (seconds)', 'bit-integrations'), isCreate),
  field('started_at', __('Start Time (UTC)', 'bit-integrations'), isCreate),
  noteField
]

const idField = (key, label) => field(key, label, true)

const invoiceIdField = idField('invoice_id', __('Invoice ID', 'bit-integrations'))
const clientIdField = idField('client_id', __('Client ID', 'bit-integrations'))
const expenseIdField = idField('expense_id', __('Expense ID', 'bit-integrations'))
const paymentIdField = idField('payment_id', __('Payment ID', 'bit-integrations'))
const estimateIdField = idField('estimate_id', __('Estimate ID', 'bit-integrations'))
const itemIdField = idField('item_id', __('Item ID', 'bit-integrations'))
const taxIdField = idField('tax_id', __('Tax ID', 'bit-integrations'))
const creditNoteIdField = idField('credit_note_id', __('Credit Note ID', 'bit-integrations'))
const billIdField = idField('bill_id', __('Bill ID', 'bit-integrations'))
const recurringProfileIdField = idField(
  'recurring_profile_id',
  __('Recurring Profile ID', 'bit-integrations')
)
const projectIdField = idField('project_id', __('Project ID', 'bit-integrations'))
const timeEntryIdField = idField('time_entry_id', __('Time Entry ID', 'bit-integrations'))

export const fieldsByAction = {
  create_invoice: invoiceFields(true),
  update_invoice: [invoiceIdField, ...invoiceFields(false)],
  delete_invoice: [invoiceIdField],
  create_client: clientFields,
  update_client: [clientIdField, ...clientFields],
  delete_client: [clientIdField],
  create_expense: expenseFields(true),
  update_expense: [expenseIdField, ...expenseFields(false)],
  delete_expense: [expenseIdField],
  create_payment: paymentFields(true),
  update_payment: [paymentIdField, ...paymentFields(false)],
  delete_payment: [paymentIdField],
  create_estimate: estimateFields(true),
  update_estimate: [estimateIdField, ...estimateFields(false)],
  delete_estimate: [estimateIdField],
  create_item: itemFields(true),
  update_item: [itemIdField, ...itemFields(false)],
  delete_item: [itemIdField],
  create_tax: taxFields(true),
  update_tax: [taxIdField, ...taxFields(false)],
  delete_tax: [taxIdField],
  create_credit_note: creditNoteFields(true),
  update_credit_note: [creditNoteIdField, ...creditNoteFields(false)],
  delete_credit_note: [creditNoteIdField],
  create_bill: billFields,
  update_bill: [billIdField, ...billFields],
  delete_bill: [billIdField],
  create_recurring_profile: recurringProfileFields(true),
  update_recurring_profile: [recurringProfileIdField, ...recurringProfileFields(false)],
  delete_recurring_profile: [recurringProfileIdField],
  create_project: projectFields(true),
  update_project: [projectIdField, ...projectFields(false)],
  delete_project: [projectIdField],
  create_time_entry: timeEntryFields(true),
  update_time_entry: [timeEntryIdField, ...timeEntryFields(false)],
  delete_time_entry: [timeEntryIdField],
  create_service: [field('name', __('Service Name', 'bit-integrations'), true)]
}

const scopeKeys = ['account_id', 'business_id']

const select = (key, label, source, required = false) => ({ key, label, required, source })

const accountSelect = select('account_id', __('Account', 'bit-integrations'), 'accounts', true)
const businessSelect = select('business_id', __('Business', 'bit-integrations'), 'businesses', true)

const accountScoped = (...selects) => [accountSelect, ...selects]
const businessScoped = (...selects) => [businessSelect, ...selects]

const clientSelect = (required = false) =>
  select('client_id', __('Client', 'bit-integrations'), 'clients', required)
const businessClientSelect = select('client_id', __('Client', 'bit-integrations'), 'businessClients')
const categorySelect = (required = false) =>
  select('category_id', __('Category', 'bit-integrations'), 'categories', required)
const staffSelect = select('staff_id', __('Staff Member', 'bit-integrations'), 'staff')
const invoiceSelect = (required = false) =>
  select('invoice_id', __('Invoice', 'bit-integrations'), 'invoices', required)
const taxSelects = [
  select('tax1', __('Tax 1', 'bit-integrations'), 'taxes'),
  select('tax2', __('Tax 2', 'bit-integrations'), 'taxes')
]
const vendorSelect = (required = false) =>
  select('vendor_id', __('Bill Vendor', 'bit-integrations'), 'vendors', required)
const lineCategorySelect = select(
  'line_category_id',
  __('Line Item Category', 'bit-integrations'),
  'categories'
)
const creditTypeSelect = (required = false) => ({
  key: 'credit_type',
  label: __('Credit Type', 'bit-integrations'),
  options: creditTypeOptions,
  required
})
const projectSelects = [
  businessClientSelect,
  {
    key: 'project_type',
    label: __('Project Type', 'bit-integrations'),
    options: projectTypeOptions,
    required: false
  },
  {
    key: 'billing_method',
    label: __('Billing Method', 'bit-integrations'),
    options: billingMethodOptions,
    required: false
  }
]
const timeEntrySelects = [
  businessClientSelect,
  select('project_id', __('Project', 'bit-integrations'), 'projects'),
  select('service_id', __('Service', 'bit-integrations'), 'services'),
  select('identity_id', __('Team Member', 'bit-integrations'), 'teamMembers')
]

export const selectsByAction = {
  create_invoice: accountScoped(clientSelect(true)),
  update_invoice: accountScoped(clientSelect()),
  delete_invoice: accountScoped(),
  create_client: accountScoped(),
  update_client: accountScoped(),
  delete_client: accountScoped(),
  create_expense: accountScoped(categorySelect(true), staffSelect, clientSelect()),
  update_expense: accountScoped(categorySelect(), staffSelect, clientSelect()),
  delete_expense: accountScoped(),
  create_payment: accountScoped(invoiceSelect(true)),
  update_payment: accountScoped(invoiceSelect()),
  delete_payment: accountScoped(),
  create_estimate: accountScoped(clientSelect(true)),
  update_estimate: accountScoped(clientSelect()),
  delete_estimate: accountScoped(),
  create_item: accountScoped(...taxSelects),
  update_item: accountScoped(...taxSelects),
  delete_item: accountScoped(),
  create_tax: accountScoped(),
  update_tax: accountScoped(),
  delete_tax: accountScoped(),
  create_credit_note: accountScoped(clientSelect(true), creditTypeSelect(true)),
  update_credit_note: accountScoped(clientSelect(), creditTypeSelect()),
  delete_credit_note: accountScoped(),
  create_bill: accountScoped(vendorSelect(true), lineCategorySelect),
  update_bill: accountScoped(vendorSelect(), lineCategorySelect),
  delete_bill: accountScoped(),
  create_recurring_profile: accountScoped(clientSelect(true)),
  update_recurring_profile: accountScoped(clientSelect()),
  delete_recurring_profile: accountScoped(),
  create_project: businessScoped(...projectSelects),
  update_project: businessScoped(...projectSelects),
  delete_project: businessScoped(),
  create_time_entry: businessScoped(...timeEntrySelects),
  update_time_entry: businessScoped(...timeEntrySelects),
  delete_time_entry: businessScoped(),
  create_service: businessScoped()
}

export const selectKeys = [
  ...new Set(Object.values(selectsByAction).flatMap(selects => selects.map(({ key }) => key)))
]

export const scopeKeyOf = action =>
  (selectsByAction[action] || []).find(({ key }) => scopeKeys.includes(key))?.key

const lineNameNote = __('Map <b>Line Item Name</b> to send a line item.', 'bit-integrations')
const lineNameUpdateNote = __(
  'Map <b>Line Item Name</b> to send a line item. It replaces all current line items. Leave Line Item Name empty to keep the current line items.',
  'bit-integrations'
)
const expenseTaxNote = __(
  '<b>Tax Percent</b> fields do not add tax to the expense. Map the <b>Tax Amount</b> fields to add tax.',
  'bit-integrations'
)
const startTimeNote = __(
  'Use an ISO 8601 date and time in UTC for <b>Start Time</b>, for example 2026-10-15T10:00:00Z.',
  'bit-integrations'
)

export const notesByAction = {
  create_invoice: lineNameNote,
  update_invoice: lineNameUpdateNote,
  create_expense: expenseTaxNote,
  update_expense: expenseTaxNote,
  create_estimate: lineNameNote,
  update_estimate: lineNameUpdateNote,
  create_credit_note: lineNameNote,
  update_credit_note: lineNameUpdateNote,
  create_bill: __('Select a <b>Line Item Category</b> to send a line item.', 'bit-integrations'),
  update_bill: __(
    'Select a <b>Line Item Category</b> to send a line item. It replaces all current line items. Leave the category empty to keep the current line items.',
    'bit-integrations'
  ),
  create_recurring_profile: lineNameNote,
  update_recurring_profile: lineNameUpdateNote,
  create_time_entry: startTimeNote,
  update_time_entry: startTimeNote
}

const checkboxUtility = (key, title, subTitle, value = 'true') => ({ key, subTitle, title, value })

const markAsSentUtility = checkboxUtility(
  'status',
  __('Mark as Sent', 'bit-integrations'),
  __('Set the status to Sent. FreshBooks does not send an email.', 'bit-integrations'),
  '2'
)
const emailToClientUtility = checkboxUtility(
  'send_email',
  __('Email to Client', 'bit-integrations'),
  __('Send each new invoice to the client by email.', 'bit-integrations')
)
const compoundTaxUtility = checkboxUtility(
  'compound',
  __('Compound Tax', 'bit-integrations'),
  __('Calculate this tax on top of the other taxes.', 'bit-integrations')
)
const internalProjectUtility = checkboxUtility(
  'internal',
  __('Internal Project', 'bit-integrations'),
  __('Mark the project as work for your own business.', 'bit-integrations')
)
const timeEntryUtilities = [
  checkboxUtility(
    'billable',
    __('Billable', 'bit-integrations'),
    __('Mark the time entry as billable.', 'bit-integrations')
  ),
  checkboxUtility(
    'is_logged',
    __('Timer Running', 'bit-integrations'),
    __('Keep the timer running. FreshBooks does not log the time yet.', 'bit-integrations'),
    'false'
  )
]

export const utilitiesByAction = {
  create_invoice: [markAsSentUtility],
  create_estimate: [markAsSentUtility],
  create_payment: [
    checkboxUtility(
      'from_credit',
      __('Pay with Client Credit', 'bit-integrations'),
      __('Pay the invoice with credit from the client account.', 'bit-integrations')
    ),
    checkboxUtility(
      'send_client_notification',
      __('Notify Client', 'bit-integrations'),
      __('Send the client a notification about this payment.', 'bit-integrations')
    )
  ],
  create_tax: [compoundTaxUtility],
  update_tax: [compoundTaxUtility],
  create_recurring_profile: [emailToClientUtility],
  update_recurring_profile: [
    emailToClientUtility,
    checkboxUtility(
      'disable',
      __('Stop Invoice Generation', 'bit-integrations'),
      __('Stop this recurring profile from creating new invoices.', 'bit-integrations')
    )
  ],
  create_project: [internalProjectUtility],
  update_project: [
    internalProjectUtility,
    checkboxUtility(
      'complete',
      __('Mark as Complete', 'bit-integrations'),
      __('Set the project status to complete.', 'bit-integrations')
    )
  ],
  create_time_entry: timeEntryUtilities,
  update_time_entry: timeEntryUtilities,
  create_service: [
    checkboxUtility(
      'billable',
      __('Billable', 'bit-integrations'),
      __('Mark the service as billable.', 'bit-integrations')
    )
  ]
}
