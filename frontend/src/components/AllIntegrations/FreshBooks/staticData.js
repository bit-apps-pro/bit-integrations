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

export const creditTypeOptions = [
  { label: __('Goodwill', 'bit-integrations'), value: 'goodwill' },
  { label: __('Prepayment', 'bit-integrations'), value: 'prepayment' }
]

export const projectTypeOptions = [
  { label: __('Fixed Price', 'bit-integrations'), value: 'fixed_price' },
  { label: __('Hourly Rate', 'bit-integrations'), value: 'hourly_rate' }
]

export const billingMethodOptions = [
  { label: __('Project Rate', 'bit-integrations'), value: 'project_rate' },
  { label: __('Service Rate', 'bit-integrations'), value: 'service_rate' },
  { label: __('Team Member Rate', 'bit-integrations'), value: 'team_member_rate' },
  { label: __('Business Rate', 'bit-integrations'), value: 'business_rate' }
]

const field = (key, label, { helper, required = false } = {}) => ({ helper, key, label, required })

const dateHelper = __('Use the YYYY-MM-DD format.', 'bit-integrations')
const currencyHelper = __('Use a three-letter currency code, for example USD.', 'bit-integrations')
const languageHelper = __('Use a two-letter language code, for example en.', 'bit-integrations')
const percentHelper = __('Use a percentage, for example 10.', 'bit-integrations')
const amountHelper = __('Use a decimal number, for example 25.00.', 'bit-integrations')

const idField = (key, label) => field(key, label, { required: true })
const dateField = (key, label, required = false) => field(key, label, { helper: dateHelper, required })
const currencyField = (required = false) =>
  field('currency_code', __('Currency Code', 'bit-integrations'), {
    helper: currencyHelper,
    required
  })
const languageField = field('language', __('Language', 'bit-integrations'), {
  helper: languageHelper
})
const discountField = field('discount_value', __('Discount Value', 'bit-integrations'), {
  helper: percentHelper
})
const dueOffsetField = field('due_offset_days', __('Due Offset Days', 'bit-integrations'), {
  helper: __('Number of days from the create date to the due date.', 'bit-integrations')
})
const poNumberField = field('po_number', __('PO Number', 'bit-integrations'))
const notesField = field('notes', __('Notes', 'bit-integrations'))
const termsField = field('terms', __('Terms', 'bit-integrations'))
const noteField = field('note', __('Note', 'bit-integrations'))

const lineNameField = field('line_name', __('Line Item Name', 'bit-integrations'))
const lineDescriptionField = field('line_description', __('Line Item Description', 'bit-integrations'))
const lineQuantityField = field('line_quantity', __('Line Item Quantity', 'bit-integrations'), {
  helper: __('Use a number, for example 1.', 'bit-integrations')
})
const lineUnitCostField = field('line_unit_cost', __('Line Item Unit Cost', 'bit-integrations'), {
  helper: amountHelper
})
const lineTaxFields = [
  field('line_tax_name', __('Line Item Tax Name', 'bit-integrations')),
  field('line_tax_amount', __('Line Item Tax Amount (%)', 'bit-integrations'), {
    helper: percentHelper
  })
]
const lineFields = [
  lineNameField,
  lineDescriptionField,
  lineQuantityField,
  lineUnitCostField,
  ...lineTaxFields
]

const invoiceFields = isCreate => [
  dateField('create_date', __('Create Date', 'bit-integrations'), isCreate),
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

const expenseTaxPercentHelper = __(
  'Use a percentage. This value does not add tax to the expense.',
  'bit-integrations'
)
const expenseTaxAmountHelper = __(
  'Tax amount to add to the expense, for example 1.30.',
  'bit-integrations'
)

const expenseTaxFields = [
  field('tax_name1', __('Tax Name 1', 'bit-integrations')),
  field('tax_percent1', __('Tax Percent 1', 'bit-integrations'), {
    helper: expenseTaxPercentHelper
  }),
  field('tax_amount1', __('Tax Amount 1', 'bit-integrations'), { helper: expenseTaxAmountHelper }),
  field('tax_name2', __('Tax Name 2', 'bit-integrations')),
  field('tax_percent2', __('Tax Percent 2', 'bit-integrations'), {
    helper: expenseTaxPercentHelper
  }),
  field('tax_amount2', __('Tax Amount 2', 'bit-integrations'), { helper: expenseTaxAmountHelper })
]

const expenseFields = isCreate => [
  field('amount', __('Amount', 'bit-integrations'), { helper: amountHelper, required: isCreate }),
  dateField('date', __('Date', 'bit-integrations'), isCreate),
  field('vendor', __('Vendor', 'bit-integrations')),
  notesField,
  field('markup_percent', __('Markup Percent', 'bit-integrations'), { helper: percentHelper }),
  currencyField(),
  ...expenseTaxFields
]

const orderIdField = field('order_id', __('Order ID', 'bit-integrations'), {
  helper: __('ID of the related payment gateway order.', 'bit-integrations')
})

const paymentFields = isCreate => [
  field('amount', __('Amount', 'bit-integrations'), { helper: amountHelper, required: isCreate }),
  dateField('date', __('Payment Date', 'bit-integrations'), isCreate),
  field('type', __('Payment Type', 'bit-integrations'), {
    helper: __('Use a payment method, for example Check, Credit or Cash.', 'bit-integrations'),
    required: isCreate
  }),
  noteField,
  ...(isCreate ? [orderIdField] : []),
  currencyField()
]

const estimateFields = isCreate => [
  dateField('create_date', __('Create Date', 'bit-integrations'), isCreate),
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
  field('name', __('Name', 'bit-integrations'), { required: isCreate }),
  field('description', __('Description', 'bit-integrations')),
  field('sku', __('SKU', 'bit-integrations')),
  field('qty', __('Quantity', 'bit-integrations'), {
    helper: __('Use a number, for example 1.', 'bit-integrations')
  }),
  field('inventory', __('Inventory', 'bit-integrations'), {
    helper: __('Number of units in stock, for example 10.', 'bit-integrations')
  }),
  field('unit_cost', __('Unit Cost', 'bit-integrations'), { helper: amountHelper }),
  currencyField()
]

const taxFields = isCreate => [
  field('name', __('Name', 'bit-integrations'), {
    helper: __('Name of the tax, for example GST.', 'bit-integrations'),
    required: isCreate
  }),
  field('amount', __('Amount (%)', 'bit-integrations'), {
    helper: __('Use a percentage, for example 5 or 7.5.', 'bit-integrations')
  }),
  field('number', __('Tax Number', 'bit-integrations'), {
    helper: __('Use the tax registration number of your business.', 'bit-integrations')
  })
]

const creditNoteFields = isCreate => [
  dateField('create_date', __('Create Date', 'bit-integrations'), isCreate),
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

const billLineTaxFields = [
  field('line_tax_name1', __('Line Item Tax Name 1', 'bit-integrations')),
  field('line_tax_percent1', __('Line Item Tax Percent 1', 'bit-integrations'), {
    helper: percentHelper
  }),
  field('line_tax_name2', __('Line Item Tax Name 2', 'bit-integrations')),
  field('line_tax_percent2', __('Line Item Tax Percent 2', 'bit-integrations'), {
    helper: percentHelper
  })
]

const billFields = [
  dateField('issue_date', __('Issue Date', 'bit-integrations')),
  dateField('due_date', __('Due Date', 'bit-integrations')),
  field('due_offset_days', __('Due Offset Days', 'bit-integrations'), {
    helper: __('Number of days from the issue date to the due date.', 'bit-integrations')
  }),
  field('bill_number', __('Bill Number', 'bit-integrations')),
  currencyField(),
  languageField,
  lineDescriptionField,
  lineQuantityField,
  lineUnitCostField,
  ...billLineTaxFields
]

const recurringProfileFields = isCreate => [
  dateField('create_date', __('Create Date', 'bit-integrations'), isCreate),
  field('frequency', __('Frequency', 'bit-integrations'), {
    helper: __('Use a number and a unit: d, w, m or y. For example, 2w.', 'bit-integrations'),
    required: isCreate
  }),
  field('number_recurring', __('Number of Invoices', 'bit-integrations'), {
    helper: __('Use 0 for no limit.', 'bit-integrations'),
    required: isCreate
  }),
  dueOffsetField,
  currencyField(),
  discountField,
  poNumberField,
  notesField,
  termsField,
  ...lineFields
]

const projectFields = isCreate => [
  field('title', __('Title', 'bit-integrations'), { required: isCreate }),
  field('description', __('Description', 'bit-integrations')),
  dateField('due_date', __('Due Date', 'bit-integrations')),
  field('fixed_price', __('Fixed Price', 'bit-integrations'), {
    helper: __('Amount for a fixed price project, for example 1000.00.', 'bit-integrations')
  }),
  field('rate', __('Rate', 'bit-integrations'), {
    helper: __('Hourly rate for an hourly rate project, for example 75.00.', 'bit-integrations')
  }),
  field('budget', __('Budget', 'bit-integrations'), {
    helper: __('Use a whole number.', 'bit-integrations')
  })
]

const timeEntryFields = isCreate => [
  field('duration', __('Duration', 'bit-integrations'), {
    helper: __('Number of seconds.', 'bit-integrations'),
    required: isCreate
  }),
  field('started_at', __('Start Time', 'bit-integrations'), {
    helper: __('Use an ISO 8601 date and time.', 'bit-integrations'),
    required: isCreate
  }),
  noteField
]

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
  create_service: [field('name', __('Service Name', 'bit-integrations'), { required: true })]
}

export const scopeKeys = ['account_id', 'business_id']

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
  'account_id',
  'business_id',
  'client_id',
  'category_id',
  'staff_id',
  'project_id',
  'vendor_id',
  'invoice_id',
  'tax1',
  'tax2',
  'service_id',
  'identity_id',
  'line_category_id',
  'credit_type',
  'project_type',
  'billing_method'
]

export const scopeKeyOf = action =>
  (selectsByAction[action] || []).find(({ key }) => scopeKeys.includes(key))?.key

const lineReplaceNote = __(
  'Mapped line item fields replace all current line items. Leave them unmapped to keep the current line items.',
  'bit-integrations'
)
const billLineNote = __(
  'Select a <b>Line Item Category</b> to send the line item fields.',
  'bit-integrations'
)

export const notesByAction = {
  update_invoice: lineReplaceNote,
  update_estimate: lineReplaceNote,
  update_credit_note: lineReplaceNote,
  update_recurring_profile: lineReplaceNote,
  create_bill: billLineNote,
  update_bill: `${billLineNote} ${lineReplaceNote}`
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
