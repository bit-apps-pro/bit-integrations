import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_contact', label: __('Create Contact', 'bit-integrations'), is_pro: true },
  { name: 'update_contact', label: __('Update Contact', 'bit-integrations'), is_pro: true },
  {
    name: 'create_or_update_contact',
    label: __('Create or Update Contact', 'bit-integrations'),
    is_pro: true
  },
  { name: 'archive_contact', label: __('Archive Contact', 'bit-integrations'), is_pro: true },
  { name: 'create_contact_group', label: __('Create Contact Group', 'bit-integrations'), is_pro: true },
  { name: 'rename_contact_group', label: __('Rename Contact Group', 'bit-integrations'), is_pro: true },
  { name: 'delete_contact_group', label: __('Delete Contact Group', 'bit-integrations'), is_pro: true },
  {
    name: 'add_contacts_to_group',
    label: __('Add Contacts to Group', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_contact_from_group',
    label: __('Remove Contact from Group', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_all_contacts_from_group',
    label: __('Remove All Contacts from Group', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_invoice', label: __('Create Invoice', 'bit-integrations'), is_pro: true },
  { name: 'create_bill', label: __('Create Bill', 'bit-integrations'), is_pro: true },
  { name: 'update_invoice', label: __('Update Invoice or Bill', 'bit-integrations'), is_pro: true },
  { name: 'approve_invoice', label: __('Approve Invoice or Bill', 'bit-integrations'), is_pro: true },
  { name: 'void_invoice', label: __('Void Invoice or Bill', 'bit-integrations'), is_pro: true },
  {
    name: 'delete_invoice',
    label: __('Delete Draft Invoice or Bill', 'bit-integrations'),
    is_pro: true
  },
  { name: 'email_invoice', label: __('Email Invoice', 'bit-integrations'), is_pro: true },
  { name: 'create_credit_note', label: __('Create Credit Note', 'bit-integrations'), is_pro: true },
  { name: 'update_credit_note', label: __('Update Credit Note', 'bit-integrations'), is_pro: true },
  { name: 'approve_credit_note', label: __('Approve Credit Note', 'bit-integrations'), is_pro: true },
  { name: 'void_credit_note', label: __('Void Credit Note', 'bit-integrations'), is_pro: true },
  {
    name: 'delete_credit_note',
    label: __('Delete Draft Credit Note', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'allocate_credit_note',
    label: __('Allocate Credit Note to Invoice', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_credit_note_allocation',
    label: __('Remove Credit Note Allocation', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_quote', label: __('Create Quote', 'bit-integrations'), is_pro: true },
  { name: 'update_quote', label: __('Update Quote', 'bit-integrations'), is_pro: true },
  { name: 'update_quote_status', label: __('Update Quote Status', 'bit-integrations'), is_pro: true },
  {
    name: 'create_purchase_order',
    label: __('Create Purchase Order', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_purchase_order',
    label: __('Update Purchase Order', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_purchase_order_status',
    label: __('Update Purchase Order Status', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_repeating_invoice',
    label: __('Create Repeating Invoice', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_repeating_invoice',
    label: __('Delete Repeating Invoice', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_item', label: __('Create Item', 'bit-integrations'), is_pro: true },
  { name: 'update_item', label: __('Update Item', 'bit-integrations'), is_pro: true },
  { name: 'delete_item', label: __('Delete Item', 'bit-integrations'), is_pro: true },
  {
    name: 'create_linked_transaction',
    label: __('Create Linked Transaction', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_linked_transaction',
    label: __('Update Linked Transaction', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_linked_transaction',
    label: __('Delete Linked Transaction', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_payment', label: __('Create Payment', 'bit-integrations'), is_pro: true },
  { name: 'delete_payment', label: __('Delete Payment', 'bit-integrations'), is_pro: true },
  { name: 'create_batch_payment', label: __('Create Batch Payment', 'bit-integrations'), is_pro: true },
  { name: 'delete_batch_payment', label: __('Delete Batch Payment', 'bit-integrations'), is_pro: true },
  {
    name: 'allocate_overpayment',
    label: __('Allocate Overpayment to Invoice', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_overpayment_allocation',
    label: __('Remove Overpayment Allocation', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'allocate_prepayment',
    label: __('Allocate Prepayment to Invoice', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_prepayment_allocation',
    label: __('Remove Prepayment Allocation', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_spend_money', label: __('Create Spend Money', 'bit-integrations'), is_pro: true },
  { name: 'create_receive_money', label: __('Create Receive Money', 'bit-integrations'), is_pro: true },
  {
    name: 'update_bank_transaction',
    label: __('Update Bank Transaction', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_bank_transaction',
    label: __('Delete Bank Transaction', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_bank_transfer', label: __('Create Bank Transfer', 'bit-integrations'), is_pro: true },
  { name: 'delete_bank_transfer', label: __('Delete Bank Transfer', 'bit-integrations'), is_pro: true },
  {
    name: 'create_manual_journal',
    label: __('Create Manual Journal', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_manual_journal',
    label: __('Update Manual Journal', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_manual_journal_status',
    label: __('Update Manual Journal Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_account', label: __('Create Account', 'bit-integrations'), is_pro: true },
  { name: 'update_account', label: __('Update Account', 'bit-integrations'), is_pro: true },
  { name: 'archive_account', label: __('Archive Account', 'bit-integrations'), is_pro: true },
  { name: 'delete_account', label: __('Delete Account', 'bit-integrations'), is_pro: true },
  {
    name: 'create_tracking_category',
    label: __('Create Tracking Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_tracking_category',
    label: __('Update Tracking Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_tracking_category',
    label: __('Delete Tracking Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_tracking_option',
    label: __('Create Tracking Option', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_tracking_option',
    label: __('Update Tracking Option', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_tracking_option',
    label: __('Delete Tracking Option', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_tax_rate', label: __('Create Tax Rate', 'bit-integrations'), is_pro: true },
  { name: 'update_tax_rate', label: __('Update Tax Rate', 'bit-integrations'), is_pro: true },
  { name: 'add_currency', label: __('Add Currency', 'bit-integrations'), is_pro: true },
  { name: 'add_note', label: __('Add Note to Record', 'bit-integrations'), is_pro: true },
  { name: 'upload_attachment', label: __('Upload Attachment', 'bit-integrations'), is_pro: true },
  { name: 'download_pdf', label: __('Download PDF to Media Library', 'bit-integrations'), is_pro: true }
]

const field = (key, label, required = false) => ({ key, label, required })

const idField = (key, label) => field(key, label, true)

const select = (key, label, source, required = false) => ({ key, label, required, source })

const enumSelect = (key, label, selectOptions, required = false) => ({
  key,
  label,
  options: selectOptions,
  required
})

const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'true' },
  { label: __('No', 'bit-integrations'), value: 'false' }
]

const lineAmountTypeOptions = [
  { label: __('Tax Exclusive', 'bit-integrations'), value: 'Exclusive' },
  { label: __('Tax Inclusive', 'bit-integrations'), value: 'Inclusive' },
  { label: __('No Tax', 'bit-integrations'), value: 'NoTax' }
]

const contactSelect = (required = true) =>
  select('contact_id', __('Contact', 'bit-integrations'), 'contacts', required)

const bankAccountSelect = (key, label, required = true) => select(key, label, 'bankAccounts', required)

const currencySelect = select('currency_code', __('Currency', 'bit-integrations'), 'currencies')

const brandingThemeSelect = select(
  'branding_theme_id',
  __('Branding Theme', 'bit-integrations'),
  'brandingThemes'
)

const lineAmountTypeSelect = enumSelect(
  'line_amount_types',
  __('Amounts Are', 'bit-integrations'),
  lineAmountTypeOptions
)

const lineSelects = [
  select('line_item_code', __('Line Item', 'bit-integrations'), 'items'),
  select('line_account_code', __('Line Account', 'bit-integrations'), 'accountCodes'),
  select('line_tax_type', __('Line Tax Rate', 'bit-integrations'), 'taxRates')
]

const lineFields = [
  field('line_description', __('Line Description', 'bit-integrations')),
  field('line_quantity', __('Line Quantity', 'bit-integrations')),
  field('line_unit_amount', __('Line Unit Price', 'bit-integrations')),
  field('line_discount_rate', __('Line Discount (%)', 'bit-integrations')),
  field('line_amount', __('Line Amount', 'bit-integrations')),
  field('line_tracking_name', __('Line Tracking Category Name', 'bit-integrations')),
  field('line_tracking_option', __('Line Tracking Option Name', 'bit-integrations'))
]

const lineNote = __(
  'Select a <b>Line Item</b> or map a <b>Line Description</b>. Leave the account and the tax rate empty to use the item details.',
  'bit-integrations'
)

const updateNote = __(
  'Only the mapped fields change. Xero keeps the current value of every other field.',
  'bit-integrations'
)

const invoiceIdField = idField('invoice_id', __('Invoice or Bill ID', 'bit-integrations'))
const creditNoteIdField = idField('credit_note_id', __('Credit Note ID', 'bit-integrations'))
const quoteIdField = idField('quote_id', __('Quote ID', 'bit-integrations'))
const purchaseOrderIdField = idField('purchase_order_id', __('Purchase Order ID', 'bit-integrations'))
const repeatingInvoiceIdField = idField(
  'repeating_invoice_id',
  __('Repeating Invoice ID', 'bit-integrations')
)

const documentDateField = field('date', __('Date (YYYY-MM-DD)', 'bit-integrations'))
const documentReferenceField = field('reference', __('Reference', 'bit-integrations'))
const currencyRateField = field('currency_rate', __('Currency Rate', 'bit-integrations'))

const invoiceStatusOptions = [
  { label: __('Draft', 'bit-integrations'), value: 'DRAFT' },
  { label: __('Submitted for Approval', 'bit-integrations'), value: 'SUBMITTED' },
  { label: __('Approved', 'bit-integrations'), value: 'AUTHORISED' }
]

const invoiceStatusSelect = enumSelect('status', __('Status', 'bit-integrations'), invoiceStatusOptions)

const sentToContactSelect = enumSelect(
  'sent_to_contact',
  __('Mark as Sent', 'bit-integrations'),
  yesNoOptions
)

const documentSelects = contactRequired => [
  contactSelect(contactRequired),
  ...lineSelects,
  lineAmountTypeSelect,
  currencySelect,
  brandingThemeSelect
]

const invoiceFields = [
  documentDateField,
  field('due_date', __('Due Date (YYYY-MM-DD)', 'bit-integrations')),
  field('invoice_number', __('Invoice Number', 'bit-integrations')),
  documentReferenceField,
  currencyRateField,
  field('expected_payment_date', __('Expected Payment Date (YYYY-MM-DD)', 'bit-integrations')),
  field('url', __('Source URL', 'bit-integrations')),
  ...lineFields
]

const billFields = [
  documentDateField,
  field('due_date', __('Due Date (YYYY-MM-DD)', 'bit-integrations')),
  field('invoice_number', __('Bill Reference', 'bit-integrations')),
  currencyRateField,
  field('planned_payment_date', __('Planned Payment Date (YYYY-MM-DD)', 'bit-integrations')),
  field('url', __('Source URL', 'bit-integrations')),
  ...lineFields
]

const updateInvoiceFields = [
  invoiceIdField,
  documentDateField,
  field('due_date', __('Due Date (YYYY-MM-DD)', 'bit-integrations')),
  field('invoice_number', __('Invoice Number or Bill Reference', 'bit-integrations')),
  documentReferenceField,
  currencyRateField,
  field('expected_payment_date', __('Expected Payment Date (YYYY-MM-DD)', 'bit-integrations')),
  field('planned_payment_date', __('Planned Payment Date (YYYY-MM-DD)', 'bit-integrations')),
  field('url', __('Source URL', 'bit-integrations')),
  ...lineFields
]

const creditNoteTypeSelect = enumSelect(
  'credit_note_type',
  __('Credit Note Type', 'bit-integrations'),
  [
    { label: __('Customer Credit Note', 'bit-integrations'), value: 'ACCRECCREDIT' },
    { label: __('Supplier Credit Note', 'bit-integrations'), value: 'ACCPAYCREDIT' }
  ],
  true
)

const creditNoteFields = [
  documentDateField,
  field('credit_note_number', __('Credit Note Number', 'bit-integrations')),
  documentReferenceField,
  currencyRateField,
  ...lineFields
]

const quoteStatusSelect = enumSelect('status', __('Status', 'bit-integrations'), [
  { label: __('Draft', 'bit-integrations'), value: 'DRAFT' },
  { label: __('Sent', 'bit-integrations'), value: 'SENT' }
])

const quoteStatusChangeSelect = enumSelect(
  'status',
  __('Status', 'bit-integrations'),
  [
    { label: __('Draft', 'bit-integrations'), value: 'DRAFT' },
    { label: __('Sent', 'bit-integrations'), value: 'SENT' },
    { label: __('Accepted', 'bit-integrations'), value: 'ACCEPTED' },
    { label: __('Declined', 'bit-integrations'), value: 'DECLINED' },
    { label: __('Invoiced', 'bit-integrations'), value: 'INVOICED' },
    { label: __('Deleted', 'bit-integrations'), value: 'DELETED' }
  ],
  true
)

const quoteFields = [
  field('date', __('Quote Date (YYYY-MM-DD)', 'bit-integrations')),
  field('expiry_date', __('Expiry Date (YYYY-MM-DD)', 'bit-integrations')),
  field('quote_number', __('Quote Number', 'bit-integrations')),
  documentReferenceField,
  field('title', __('Title', 'bit-integrations')),
  field('summary', __('Summary', 'bit-integrations')),
  field('terms', __('Terms', 'bit-integrations')),
  ...lineFields
]

const purchaseOrderStatusSelect = enumSelect(
  'status',
  __('Status', 'bit-integrations'),
  invoiceStatusOptions
)

const purchaseOrderStatusChangeSelect = enumSelect(
  'status',
  __('Status', 'bit-integrations'),
  [
    ...invoiceStatusOptions,
    { label: __('Billed', 'bit-integrations'), value: 'BILLED' },
    { label: __('Deleted', 'bit-integrations'), value: 'DELETED' }
  ],
  true
)

const purchaseOrderFields = [
  field('date', __('Order Date (YYYY-MM-DD)', 'bit-integrations')),
  field('delivery_date', __('Delivery Date (YYYY-MM-DD)', 'bit-integrations')),
  field('purchase_order_number', __('Purchase Order Number', 'bit-integrations')),
  documentReferenceField,
  field('delivery_address', __('Delivery Address', 'bit-integrations')),
  field('attention_to', __('Attention To', 'bit-integrations')),
  field('telephone', __('Telephone', 'bit-integrations')),
  field('delivery_instructions', __('Delivery Instructions', 'bit-integrations')),
  ...lineFields
]

const repeatingInvoiceFields = [
  field('period', __('Repeat Every (Number)', 'bit-integrations'), true),
  field('due_date', __('Due Date Number', 'bit-integrations'), true),
  field('start_date', __('Start Date (YYYY-MM-DD)', 'bit-integrations'), true),
  field('end_date', __('End Date (YYYY-MM-DD)', 'bit-integrations')),
  documentReferenceField,
  ...lineFields
]

const repeatingInvoiceSelects = [
  enumSelect(
    'invoice_type',
    __('Type', 'bit-integrations'),
    [
      { label: __('Invoice', 'bit-integrations'), value: 'ACCREC' },
      { label: __('Bill', 'bit-integrations'), value: 'ACCPAY' }
    ],
    true
  ),
  contactSelect(),
  enumSelect(
    'unit',
    __('Repeat Unit', 'bit-integrations'),
    [
      { label: __('Weeks', 'bit-integrations'), value: 'WEEKLY' },
      { label: __('Months', 'bit-integrations'), value: 'MONTHLY' }
    ],
    true
  ),
  enumSelect(
    'due_date_type',
    __('Due Date Type', 'bit-integrations'),
    [
      { label: __('Days After the Invoice Date', 'bit-integrations'), value: 'DAYSAFTERINVOICEDATE' },
      {
        label: __('Days After the End of the Invoice Month', 'bit-integrations'),
        value: 'DAYSAFTERINVOICEMONTH'
      },
      { label: __('Days After the Bill Date', 'bit-integrations'), value: 'DAYSAFTERBILLDATE' },
      {
        label: __('Days After the End of the Bill Month', 'bit-integrations'),
        value: 'DAYSAFTERBILLMONTH'
      },
      { label: __('Day of the Current Month', 'bit-integrations'), value: 'OFCURRENTMONTH' },
      { label: __('Day of the Following Month', 'bit-integrations'), value: 'OFFOLLOWINGMONTH' }
    ],
    true
  ),
  ...lineSelects,
  enumSelect('status', __('Status', 'bit-integrations'), [
    { label: __('Draft', 'bit-integrations'), value: 'DRAFT' },
    { label: __('Approved', 'bit-integrations'), value: 'AUTHORISED' }
  ]),
  lineAmountTypeSelect,
  currencySelect,
  brandingThemeSelect,
  enumSelect('approved_for_sending', __('Approve for Sending', 'bit-integrations'), yesNoOptions),
  enumSelect('send_copy', __('Send Me a Copy', 'bit-integrations'), yesNoOptions),
  enumSelect('mark_as_sent', __('Mark as Sent', 'bit-integrations'), yesNoOptions),
  enumSelect('include_pdf', __('Attach PDF', 'bit-integrations'), yesNoOptions)
]

const lineUpdateNote = `${updateNote} ${__(
  'Select a <b>Line Item</b> or map a <b>Line Description</b> to replace all lines with one new line. Leave both empty to keep the current lines.',
  'bit-integrations'
)}`

const invoiceIdNote = __(
  'Map the <b>InvoiceID</b> of the invoice or the bill, for example from a previous Xero action.',
  'bit-integrations'
)

const contactIdField = idField('contact_id', __('Contact ID', 'bit-integrations'))

const contactGroupIdField = idField('contact_group_id', __('Contact Group ID', 'bit-integrations'))

const contactAddressFields = (prefix, title) =>
  [
    ['address_line1', __('Address Line 1', 'bit-integrations')],
    ['address_line2', __('Address Line 2', 'bit-integrations')],
    ['city', __('City', 'bit-integrations')],
    ['region', __('Region', 'bit-integrations')],
    ['postal_code', __('Postal Code', 'bit-integrations')],
    ['country', __('Country', 'bit-integrations')]
  ].map(([key, label]) => field(`${prefix}${key}`, `${title} ${label}`))

const contactDetailFields = (nameRequired, emailRequired) => [
  field('name', __('Name', 'bit-integrations'), nameRequired),
  field('email', __('Email', 'bit-integrations'), emailRequired),
  field('first_name', __('First Name', 'bit-integrations')),
  field('last_name', __('Last Name', 'bit-integrations')),
  field('phone', __('Phone', 'bit-integrations')),
  field('mobile', __('Mobile', 'bit-integrations')),
  field('website', __('Website', 'bit-integrations')),
  field('contact_number', __('Contact Number', 'bit-integrations')),
  field('account_number', __('Account Number', 'bit-integrations')),
  field('company_number', __('Company Registration Number', 'bit-integrations')),
  field('tax_number', __('Tax Number', 'bit-integrations')),
  field('bank_account_details', __('Bank Account Details', 'bit-integrations')),
  ...contactAddressFields('postal_', __('Postal', 'bit-integrations')),
  ...contactAddressFields('street_', __('Street', 'bit-integrations'))
]

const contactSelects = [
  select('currency_code', __('Default Currency', 'bit-integrations'), 'currencies'),
  select('sales_tax_type', __('Default Sales Tax Rate', 'bit-integrations'), 'taxRates'),
  select('purchases_tax_type', __('Default Purchases Tax Rate', 'bit-integrations'), 'taxRates')
]

const itemIdField = idField('item_id', __('Item ID', 'bit-integrations'))

const itemDetailFields = codeRequired => [
  field('code', __('Item Code', 'bit-integrations'), codeRequired),
  field('name', __('Item Name', 'bit-integrations')),
  field('description', __('Sales Description', 'bit-integrations')),
  field('purchase_description', __('Purchase Description', 'bit-integrations')),
  field('sales_unit_price', __('Sales Unit Price', 'bit-integrations')),
  field('purchase_unit_price', __('Purchase Unit Price', 'bit-integrations'))
]

const itemSelects = [
  enumSelect('is_sold', __('Sell This Item', 'bit-integrations'), yesNoOptions),
  select('sales_account_code', __('Sales Account', 'bit-integrations'), 'accountCodes'),
  select('sales_tax_type', __('Sales Tax Rate', 'bit-integrations'), 'taxRates'),
  enumSelect('is_purchased', __('Purchase This Item', 'bit-integrations'), yesNoOptions),
  select('purchase_account_code', __('Purchase Account', 'bit-integrations'), 'accountCodes'),
  select('purchase_tax_type', __('Purchase Tax Rate', 'bit-integrations'), 'taxRates'),
  select('cogs_account_code', __('Cost of Goods Sold Account', 'bit-integrations'), 'accountCodes'),
  select(
    'inventory_asset_account_code',
    __('Inventory Asset Account', 'bit-integrations'),
    'accountCodes'
  )
]

const linkedTransactionIdField = idField(
  'linked_transaction_id',
  __('Linked Transaction ID', 'bit-integrations')
)

const linkedTransactionFields = sourceRequired => [
  field('source_transaction_id', __('Source Bill ID', 'bit-integrations'), sourceRequired),
  field('source_line_item_id', __('Source Line Item ID', 'bit-integrations'), sourceRequired),
  field('target_transaction_id', __('Target Invoice ID', 'bit-integrations')),
  field('target_line_item_id', __('Target Line Item ID', 'bit-integrations'))
]

const linkedTransactionNote = __(
  'A <b>Target Invoice ID</b> needs a <b>Target Line Item ID</b>. Get the line item IDs from the bill and the invoice in Xero.',
  'bit-integrations'
)

const paymentTargetOptions = [
  { label: __('Invoice or Bill', 'bit-integrations'), value: 'invoice' },
  { label: __('Credit Note', 'bit-integrations'), value: 'credit_note' },
  { label: __('Prepayment', 'bit-integrations'), value: 'prepayment' },
  { label: __('Overpayment', 'bit-integrations'), value: 'overpayment' }
]

const paymentDateField = field('date', __('Date (YYYY-MM-DD)', 'bit-integrations'))

const paymentAmountField = field('amount', __('Amount', 'bit-integrations'), true)

const paymentAllocationFields = (recordKey, recordLabel) => [
  idField(recordKey, recordLabel),
  idField('invoice_id', __('Invoice or Bill ID', 'bit-integrations')),
  paymentAmountField,
  paymentDateField
]

const paymentRemoveAllocationFields = (recordKey, recordLabel) => [
  idField(recordKey, recordLabel),
  idField('allocation_id', __('Allocation ID', 'bit-integrations'))
]

const paymentAllocationNote = __(
  'Leave the <b>Date</b> empty to use today. The invoice or bill must have the same contact.',
  'bit-integrations'
)

const paymentRemoveAllocationNote = __(
  'Xero shows the <b>Allocation ID</b> in the Allocations list of the record.',
  'bit-integrations'
)

const spendMoneyTypeOptions = [
  { label: __('Spend Money', 'bit-integrations'), value: 'SPEND' },
  { label: __('Prepayment', 'bit-integrations'), value: 'SPEND-PREPAYMENT' },
  { label: __('Overpayment', 'bit-integrations'), value: 'SPEND-OVERPAYMENT' }
]

const receiveMoneyTypeOptions = [
  { label: __('Receive Money', 'bit-integrations'), value: 'RECEIVE' },
  { label: __('Prepayment', 'bit-integrations'), value: 'RECEIVE-PREPAYMENT' },
  { label: __('Overpayment', 'bit-integrations'), value: 'RECEIVE-OVERPAYMENT' }
]

const manualJournalCreateStatusOptions = [
  { label: __('Draft', 'bit-integrations'), value: 'DRAFT' },
  { label: __('Posted', 'bit-integrations'), value: 'POSTED' }
]

const manualJournalStatusOptions = [
  { label: __('Draft', 'bit-integrations'), value: 'DRAFT' },
  { label: __('Posted', 'bit-integrations'), value: 'POSTED' },
  { label: __('Deleted', 'bit-integrations'), value: 'DELETED' },
  { label: __('Voided', 'bit-integrations'), value: 'VOIDED' }
]

const accountTypeOptions = [
  { label: __('Bank', 'bit-integrations'), value: 'BANK' },
  { label: __('Current Asset', 'bit-integrations'), value: 'CURRENT' },
  { label: __('Current Liability', 'bit-integrations'), value: 'CURRLIAB' },
  { label: __('Depreciation', 'bit-integrations'), value: 'DEPRECIATN' },
  { label: __('Direct Costs', 'bit-integrations'), value: 'DIRECTCOSTS' },
  { label: __('Equity', 'bit-integrations'), value: 'EQUITY' },
  { label: __('Expense', 'bit-integrations'), value: 'EXPENSE' },
  { label: __('Fixed Asset', 'bit-integrations'), value: 'FIXED' },
  { label: __('Inventory', 'bit-integrations'), value: 'INVENTORY' },
  { label: __('Liability', 'bit-integrations'), value: 'LIABILITY' },
  { label: __('Non-current Asset', 'bit-integrations'), value: 'NONCURRENT' },
  { label: __('Other Income', 'bit-integrations'), value: 'OTHERINCOME' },
  { label: __('Overhead', 'bit-integrations'), value: 'OVERHEADS' },
  { label: __('Prepayment', 'bit-integrations'), value: 'PREPAYMENT' },
  { label: __('Revenue', 'bit-integrations'), value: 'REVENUE' },
  { label: __('Sales', 'bit-integrations'), value: 'SALES' },
  { label: __('Non-current Liability', 'bit-integrations'), value: 'TERMLIAB' }
]

const bankAccountTypeOptions = [
  { label: __('Bank', 'bit-integrations'), value: 'BANK' },
  { label: __('Credit Card', 'bit-integrations'), value: 'CREDITCARD' },
  { label: __('PayPal', 'bit-integrations'), value: 'PAYPAL' }
]

const trackingStatusOptions = [
  { label: __('Active', 'bit-integrations'), value: 'ACTIVE' },
  { label: __('Archived', 'bit-integrations'), value: 'ARCHIVED' }
]

const taxRateStatusOptions = [
  { label: __('Active', 'bit-integrations'), value: 'ACTIVE' },
  { label: __('Archived', 'bit-integrations'), value: 'ARCHIVED' },
  { label: __('Deleted', 'bit-integrations'), value: 'DELETED' }
]

const reportTaxTypeOptions = [
  'AVALARA',
  'BASEXCLUDED',
  'CAPITALSALESOUTPUT',
  'CAPITALEXPENSESINPUT',
  'ECOUTPUT',
  'ECOUTPUTSERVICES',
  'ECINPUT',
  'ECACQUISITIONS',
  'EXEMPTEXPENSES',
  'EXEMPTINPUT',
  'EXEMPTOUTPUT',
  'GSTONIMPORTS',
  'INPUT',
  'INPUTTAXED',
  'MOSSSALES',
  'NONE',
  'NONEOUTPUT',
  'OUTPUT',
  'PURCHASESINPUT',
  'SALESOUTPUT',
  'EXEMPTCAPITAL',
  'EXEMPTEXPORT',
  'CAPITALEXINPUT',
  'GSTONCAPIMPORTS',
  'GSTONCAPITALIMPORTS',
  'REVERSECHARGES',
  'PAYMENTS',
  'INVOICE',
  'CASH',
  'ACCRUAL',
  'FLATRATECASH',
  'FLATRATEACCRUAL',
  'ACCRUALS',
  'TXCA',
  'SRCAS',
  'DSOUTPUT',
  'BLINPUT2',
  'EPINPUT',
  'IMINPUT2',
  'MEINPUT',
  'IGDSINPUT2',
  'ESN33OUTPUT',
  'OPINPUT',
  'OSOUTPUT',
  'TXN33INPUT',
  'TXESSINPUT',
  'TXREINPUT',
  'TXPETINPUT',
  'NRINPUT',
  'ES33OUTPUT',
  'ZERORATEDINPUT',
  'ZERORATEDOUTPUT',
  'DRCHARGESUPPLY',
  'DRCHARGE',
  'CAPINPUT',
  'CAPIMPORTS',
  'IMINPUT',
  'INPUT2',
  'CIUINPUT',
  'SRINPUT',
  'OUTPUT2',
  'SROUTPUT',
  'CAPOUTPUT',
  'SROUTPUT2',
  'CIUOUTPUT',
  'ZROUTPUT',
  'ZREXPORT',
  'ACC28PLUS',
  'ACCUPTO28',
  'OTHEROUTPUT',
  'SHOUTPUT',
  'ZRINPUT',
  'BADDEBT',
  'OTHERINPUT',
  'BADDEBTRELIEF',
  'IGDSINPUT3',
  'SROVR',
  'TOURISTREFUND',
  'TXRCN33',
  'TXRCRE',
  'TXRCESS',
  'TXRCTS',
  'CAPEXINPUT',
  'UNDEFINED',
  'CAPEXOUTPUT',
  'ZEROEXPOUTPUT',
  'GOODSIMPORT',
  'NONEINPUT',
  'NOTREPORTED',
  'SROVRRS',
  'SROVRLVG',
  'SRLVG',
  'IM',
  'IMESS',
  'IMN33',
  'IMRE',
  'BADDEBTRECOVERY',
  'USSALESTAX',
  'BLINPUT3'
].map(code => ({
  label: code,
  value: code
}))

const historyRecordTypeOptions = [
  { label: __('Bank Transaction', 'bit-integrations'), value: 'BankTransactions' },
  { label: __('Bank Transfer', 'bit-integrations'), value: 'BankTransfers' },
  { label: __('Batch Payment', 'bit-integrations'), value: 'BatchPayments' },
  { label: __('Contact', 'bit-integrations'), value: 'Contacts' },
  { label: __('Credit Note', 'bit-integrations'), value: 'CreditNotes' },
  { label: __('Invoice or Bill', 'bit-integrations'), value: 'Invoices' },
  { label: __('Item', 'bit-integrations'), value: 'Items' },
  { label: __('Manual Journal', 'bit-integrations'), value: 'ManualJournals' },
  { label: __('Overpayment', 'bit-integrations'), value: 'Overpayments' },
  { label: __('Payment', 'bit-integrations'), value: 'Payments' },
  { label: __('Prepayment', 'bit-integrations'), value: 'Prepayments' },
  { label: __('Purchase Order', 'bit-integrations'), value: 'PurchaseOrders' },
  { label: __('Quote', 'bit-integrations'), value: 'Quotes' },
  { label: __('Repeating Invoice', 'bit-integrations'), value: 'RepeatingInvoices' }
]

const attachmentRecordTypeOptions = [
  { label: __('Account', 'bit-integrations'), value: 'Accounts' },
  { label: __('Bank Transaction', 'bit-integrations'), value: 'BankTransactions' },
  { label: __('Bank Transfer', 'bit-integrations'), value: 'BankTransfers' },
  { label: __('Contact', 'bit-integrations'), value: 'Contacts' },
  { label: __('Credit Note', 'bit-integrations'), value: 'CreditNotes' },
  { label: __('Invoice or Bill', 'bit-integrations'), value: 'Invoices' },
  { label: __('Manual Journal', 'bit-integrations'), value: 'ManualJournals' },
  { label: __('Purchase Order', 'bit-integrations'), value: 'PurchaseOrders' },
  { label: __('Quote', 'bit-integrations'), value: 'Quotes' },
  { label: __('Repeating Invoice', 'bit-integrations'), value: 'RepeatingInvoices' }
]

const pdfRecordTypeOptions = [
  { label: __('Invoice or Bill', 'bit-integrations'), value: 'Invoices' },
  { label: __('Credit Note', 'bit-integrations'), value: 'CreditNotes' },
  { label: __('Quote', 'bit-integrations'), value: 'Quotes' },
  { label: __('Purchase Order', 'bit-integrations'), value: 'PurchaseOrders' }
]

const bankTransactionIdField = idField(
  'bank_transaction_id',
  __('Bank Transaction ID', 'bit-integrations')
)
const bankTransferIdField = idField('bank_transfer_id', __('Bank Transfer ID', 'bit-integrations'))
const manualJournalIdField = idField('manual_journal_id', __('Manual Journal ID', 'bit-integrations'))
const accountIdField = idField('account_id', __('Account ID', 'bit-integrations'))
const trackingCategoryIdField = idField(
  'tracking_category_id',
  __('Tracking Category ID', 'bit-integrations')
)
const trackingOptionIdField = idField('tracking_option_id', __('Tracking Option ID', 'bit-integrations'))
const recordIdField = idField('record_id', __('Record ID', 'bit-integrations'))
const yesNoSelect = (key, label) => enumSelect(key, label, yesNoOptions)

const bankTransactionFields = [
  ...lineFields,
  field('date', __('Date (YYYY-MM-DD)', 'bit-integrations')),
  field('reference', __('Reference', 'bit-integrations')),
  field('currency_rate', __('Currency Rate', 'bit-integrations')),
  field('url', __('Source URL', 'bit-integrations'))
]

const bankTransactionSelects = (typeOptions, required) => [
  ...(typeOptions
    ? [enumSelect('transaction_type', __('Transaction Type', 'bit-integrations'), typeOptions)]
    : []),
  contactSelect(required),
  bankAccountSelect('bank_account_id', __('Bank Account', 'bit-integrations'), required),
  ...lineSelects,
  lineAmountTypeSelect,
  currencySelect,
  yesNoSelect('is_reconciled', __('Mark as Reconciled', 'bit-integrations'))
]

const manualJournalFields = required => [
  field('narration', __('Narration', 'bit-integrations'), required),
  field('debit_amount', __('Debit Amount', 'bit-integrations'), required),
  field('credit_amount', __('Credit Amount', 'bit-integrations')),
  field('line_description', __('Line Description', 'bit-integrations')),
  field('date', __('Date (YYYY-MM-DD)', 'bit-integrations')),
  field('url', __('Source URL', 'bit-integrations'))
]

const manualJournalSelects = required => [
  select('debit_account_code', __('Debit Account', 'bit-integrations'), 'accountCodes', required),
  select('credit_account_code', __('Credit Account', 'bit-integrations'), 'accountCodes', required),
  select('line_tax_type', __('Tax Rate', 'bit-integrations'), 'taxRates'),
  enumSelect('status', __('Status', 'bit-integrations'), manualJournalCreateStatusOptions),
  lineAmountTypeSelect,
  yesNoSelect('show_on_cash_basis_reports', __('Show on Cash Basis Reports', 'bit-integrations'))
]

const accountFields = [
  field('code', __('Account Code', 'bit-integrations')),
  field('description', __('Description', 'bit-integrations')),
  field('bank_account_number', __('Bank Account Number', 'bit-integrations'))
]

const accountSelects = required => [
  enumSelect('account_type', __('Account Type', 'bit-integrations'), accountTypeOptions, required),
  select('tax_type', __('Tax Rate', 'bit-integrations'), 'taxRates'),
  enumSelect('bank_account_type', __('Bank Account Type', 'bit-integrations'), bankAccountTypeOptions),
  currencySelect,
  yesNoSelect('enable_payments', __('Enable Payments to This Account', 'bit-integrations')),
  yesNoSelect('show_in_expense_claims', __('Show in Expense Claims', 'bit-integrations')),
  yesNoSelect('add_to_watchlist', __('Show on the Dashboard Watchlist', 'bit-integrations'))
]

const taxComponentSelects = [
  enumSelect('report_tax_type', __('Report Tax Type', 'bit-integrations'), reportTaxTypeOptions),
  yesNoSelect('is_compound', __('Compound', 'bit-integrations')),
  yesNoSelect('is_non_recoverable', __('Non-recoverable', 'bit-integrations'))
]

const manualJournalNote = __(
  'Xero posts the debit amount to the debit account and the same amount as a credit to the credit account. Leave the credit amount empty to use the debit amount.',
  'bit-integrations'
)

const updateLinesNote = __(
  'Map a line field to replace all lines with one new line. Leave the line fields empty to keep the current lines.',
  'bit-integrations'
)

const idNote = __(
  'Map the ID from a previous step or a form field. Xero shows IDs in the record URL.',
  'bit-integrations'
)

export const fieldsByAction = {
  create_invoice: invoiceFields,
  create_bill: billFields,
  update_invoice: updateInvoiceFields,
  approve_invoice: [invoiceIdField],
  void_invoice: [invoiceIdField],
  delete_invoice: [invoiceIdField],
  email_invoice: [idField('invoice_id', __('Invoice ID', 'bit-integrations'))],
  create_credit_note: creditNoteFields,
  update_credit_note: [creditNoteIdField, ...creditNoteFields],
  approve_credit_note: [creditNoteIdField],
  void_credit_note: [creditNoteIdField],
  delete_credit_note: [creditNoteIdField],
  allocate_credit_note: [
    creditNoteIdField,
    idField('invoice_id', __('Invoice ID', 'bit-integrations')),
    field('amount', __('Amount', 'bit-integrations'), true),
    field('date', __('Allocation Date (YYYY-MM-DD)', 'bit-integrations'))
  ],
  delete_credit_note_allocation: [
    creditNoteIdField,
    idField('allocation_id', __('Allocation ID', 'bit-integrations'))
  ],
  create_quote: quoteFields,
  update_quote: [quoteIdField, ...quoteFields],
  update_quote_status: [quoteIdField],
  create_purchase_order: purchaseOrderFields,
  update_purchase_order: [purchaseOrderIdField, ...purchaseOrderFields],
  update_purchase_order_status: [purchaseOrderIdField],
  create_repeating_invoice: repeatingInvoiceFields,
  delete_repeating_invoice: [repeatingInvoiceIdField],
  create_contact: contactDetailFields(true, false),
  update_contact: [contactIdField, ...contactDetailFields(false, false)],
  create_or_update_contact: contactDetailFields(false, true),
  archive_contact: [contactIdField],
  create_contact_group: [field('name', __('Group Name', 'bit-integrations'), true)],
  rename_contact_group: [
    contactGroupIdField,
    field('name', __('New Group Name', 'bit-integrations'), true)
  ],
  delete_contact_group: [contactGroupIdField],
  add_contacts_to_group: [
    contactGroupIdField,
    field('contact_ids', __('Contact IDs (Comma Separated)', 'bit-integrations'))
  ],
  remove_contact_from_group: [contactGroupIdField, contactIdField],
  remove_all_contacts_from_group: [contactGroupIdField],
  create_item: itemDetailFields(true),
  update_item: [itemIdField, ...itemDetailFields(false)],
  delete_item: [itemIdField],
  create_linked_transaction: linkedTransactionFields(true),
  update_linked_transaction: [linkedTransactionIdField, ...linkedTransactionFields(false)],
  delete_linked_transaction: [linkedTransactionIdField],
  create_payment: [
    idField(
      'target_id',
      __('Invoice, Bill, Credit Note, Prepayment or Overpayment ID', 'bit-integrations')
    ),
    paymentAmountField,
    paymentDateField,
    field('reference', __('Reference', 'bit-integrations')),
    field('bank_amount', __('Bank Amount', 'bit-integrations')),
    field('currency_rate', __('Currency Rate', 'bit-integrations'))
  ],
  delete_payment: [idField('payment_id', __('Payment ID', 'bit-integrations'))],
  create_batch_payment: [
    idField('invoice_id', __('Invoice or Bill ID', 'bit-integrations')),
    paymentAmountField,
    paymentDateField,
    field('reference', __('Reference', 'bit-integrations'), true),
    field('payment_details', __('Payment Details', 'bit-integrations')),
    field('particulars', __('Particulars', 'bit-integrations')),
    field('code', __('Code', 'bit-integrations')),
    field('details', __('Batch Details', 'bit-integrations')),
    field('narrative', __('Narrative', 'bit-integrations'))
  ],
  delete_batch_payment: [idField('batch_payment_id', __('Batch Payment ID', 'bit-integrations'))],
  allocate_overpayment: paymentAllocationFields(
    'overpayment_id',
    __('Overpayment ID', 'bit-integrations')
  ),
  delete_overpayment_allocation: paymentRemoveAllocationFields(
    'overpayment_id',
    __('Overpayment ID', 'bit-integrations')
  ),
  allocate_prepayment: paymentAllocationFields('prepayment_id', __('Prepayment ID', 'bit-integrations')),
  delete_prepayment_allocation: paymentRemoveAllocationFields(
    'prepayment_id',
    __('Prepayment ID', 'bit-integrations')
  ),
  create_spend_money: bankTransactionFields,
  create_receive_money: bankTransactionFields,
  update_bank_transaction: [bankTransactionIdField, ...bankTransactionFields],
  delete_bank_transaction: [bankTransactionIdField],
  create_bank_transfer: [
    field('amount', __('Amount', 'bit-integrations'), true),
    field('date', __('Transfer Date (YYYY-MM-DD)', 'bit-integrations')),
    field('reference', __('Reference', 'bit-integrations'))
  ],
  delete_bank_transfer: [bankTransferIdField],
  create_manual_journal: manualJournalFields(true),
  update_manual_journal: [manualJournalIdField, ...manualJournalFields(false)],
  update_manual_journal_status: [manualJournalIdField],
  create_account: [field('name', __('Account Name', 'bit-integrations'), true), ...accountFields],
  update_account: [
    accountIdField,
    field('name', __('Account Name', 'bit-integrations')),
    ...accountFields
  ],
  archive_account: [accountIdField],
  delete_account: [accountIdField],
  create_tracking_category: [field('name', __('Name', 'bit-integrations'), true)],
  update_tracking_category: [trackingCategoryIdField, field('name', __('New Name', 'bit-integrations'))],
  delete_tracking_category: [trackingCategoryIdField],
  create_tracking_option: [trackingCategoryIdField, field('name', __('Name', 'bit-integrations'), true)],
  update_tracking_option: [
    trackingCategoryIdField,
    trackingOptionIdField,
    field('name', __('New Name', 'bit-integrations'))
  ],
  delete_tracking_option: [trackingCategoryIdField, trackingOptionIdField],
  create_tax_rate: [
    field('name', __('Name', 'bit-integrations'), true),
    field('component_name', __('Component Name', 'bit-integrations'), true),
    field('component_rate', __('Component Rate (%)', 'bit-integrations'), true)
  ],
  update_tax_rate: [
    idField('tax_type', __('Tax Type', 'bit-integrations')),
    field('name', __('New Name', 'bit-integrations')),
    field('component_name', __('Component Name', 'bit-integrations')),
    field('component_rate', __('Component Rate (%)', 'bit-integrations'))
  ],
  add_currency: [field('currency_code', __('Currency Code', 'bit-integrations'), true)],
  add_note: [recordIdField, field('note', __('Note', 'bit-integrations'), true)],
  upload_attachment: [
    recordIdField,
    field('file', __('File', 'bit-integrations'), true),
    field('file_name', __('File Name', 'bit-integrations'))
  ],
  download_pdf: [recordIdField, field('file_name', __('File Name', 'bit-integrations'))]
}

export const selectsByAction = {
  create_invoice: [...documentSelects(true), invoiceStatusSelect, sentToContactSelect],
  create_bill: [...documentSelects(true), invoiceStatusSelect],
  update_invoice: [...documentSelects(false), invoiceStatusSelect, sentToContactSelect],
  approve_invoice: [],
  void_invoice: [],
  delete_invoice: [],
  email_invoice: [],
  create_credit_note: [
    creditNoteTypeSelect,
    ...documentSelects(true),
    invoiceStatusSelect,
    sentToContactSelect
  ],
  update_credit_note: [...documentSelects(false), invoiceStatusSelect, sentToContactSelect],
  approve_credit_note: [],
  void_credit_note: [],
  delete_credit_note: [],
  allocate_credit_note: [],
  delete_credit_note_allocation: [],
  create_quote: [...documentSelects(true), quoteStatusSelect],
  update_quote: [...documentSelects(false), quoteStatusSelect],
  update_quote_status: [quoteStatusChangeSelect],
  create_purchase_order: [...documentSelects(true), purchaseOrderStatusSelect],
  update_purchase_order: [...documentSelects(false), purchaseOrderStatusSelect],
  update_purchase_order_status: [purchaseOrderStatusChangeSelect],
  create_repeating_invoice: repeatingInvoiceSelects,
  delete_repeating_invoice: [],
  create_contact: contactSelects,
  update_contact: contactSelects,
  create_or_update_contact: contactSelects,
  archive_contact: [],
  create_contact_group: [],
  rename_contact_group: [],
  delete_contact_group: [],
  add_contacts_to_group: [contactSelect(false)],
  remove_contact_from_group: [],
  remove_all_contacts_from_group: [],
  create_item: itemSelects,
  update_item: itemSelects,
  delete_item: [],
  create_linked_transaction: [contactSelect(false)],
  update_linked_transaction: [contactSelect(false)],
  delete_linked_transaction: [],
  create_payment: [
    enumSelect('target_type', __('Pay For', 'bit-integrations'), paymentTargetOptions, true),
    bankAccountSelect('bank_account_id', __('Bank Account', 'bit-integrations')),
    enumSelect('is_reconciled', __('Mark as Reconciled', 'bit-integrations'), yesNoOptions)
  ],
  delete_payment: [],
  create_batch_payment: [bankAccountSelect('bank_account_id', __('Bank Account', 'bit-integrations'))],
  delete_batch_payment: [],
  allocate_overpayment: [],
  delete_overpayment_allocation: [],
  allocate_prepayment: [],
  delete_prepayment_allocation: [],
  create_spend_money: bankTransactionSelects(spendMoneyTypeOptions, true),
  create_receive_money: bankTransactionSelects(receiveMoneyTypeOptions, true),
  update_bank_transaction: bankTransactionSelects(null, false),
  delete_bank_transaction: [],
  create_bank_transfer: [
    bankAccountSelect('from_bank_account_id', __('From Bank Account', 'bit-integrations')),
    bankAccountSelect('to_bank_account_id', __('To Bank Account', 'bit-integrations')),
    yesNoSelect('from_is_reconciled', __('Mark the Sending Side as Reconciled', 'bit-integrations')),
    yesNoSelect('to_is_reconciled', __('Mark the Receiving Side as Reconciled', 'bit-integrations'))
  ],
  delete_bank_transfer: [],
  create_manual_journal: manualJournalSelects(true),
  update_manual_journal: manualJournalSelects(false),
  update_manual_journal_status: [
    enumSelect('status', __('Status', 'bit-integrations'), manualJournalStatusOptions, true)
  ],
  create_account: accountSelects(true),
  update_account: accountSelects(false),
  archive_account: [],
  delete_account: [],
  create_tracking_category: [],
  update_tracking_category: [
    enumSelect('status', __('Status', 'bit-integrations'), trackingStatusOptions)
  ],
  delete_tracking_category: [],
  create_tracking_option: [],
  update_tracking_option: [
    enumSelect('status', __('Status', 'bit-integrations'), trackingStatusOptions)
  ],
  delete_tracking_option: [],
  create_tax_rate: taxComponentSelects,
  update_tax_rate: [
    ...taxComponentSelects,
    enumSelect('status', __('Status', 'bit-integrations'), taxRateStatusOptions)
  ],
  add_currency: [],
  add_note: [
    enumSelect('record_type', __('Record Type', 'bit-integrations'), historyRecordTypeOptions, true)
  ],
  upload_attachment: [
    enumSelect('record_type', __('Record Type', 'bit-integrations'), attachmentRecordTypeOptions, true),
    yesNoSelect('include_online', __('Show on Online Invoice or Credit Note', 'bit-integrations'))
  ],
  download_pdf: [
    enumSelect('record_type', __('Record Type', 'bit-integrations'), pdfRecordTypeOptions, true)
  ]
}

export const selectKeys = [
  ...new Set(Object.values(selectsByAction).flatMap(selects => selects.map(({ key }) => key)))
]

export const notesByAction = {
  create_invoice: `${lineNote} ${__(
    'An approved invoice needs a due date when the contact has no payment terms.',
    'bit-integrations'
  )}`,
  create_bill: lineNote,
  update_invoice: lineUpdateNote,
  approve_invoice: invoiceIdNote,
  void_invoice: __(
    'Remove all payments and allocations before you void an invoice or a bill.',
    'bit-integrations'
  ),
  delete_invoice: __('Xero deletes only draft and submitted invoices and bills.', 'bit-integrations'),
  email_invoice: __(
    'The invoice must be approved, and its contact needs an email address.',
    'bit-integrations'
  ),
  create_credit_note: lineNote,
  update_credit_note: lineUpdateNote,
  void_credit_note: __('Remove all allocations before you void a credit note.', 'bit-integrations'),
  delete_credit_note: __('Xero deletes only draft and submitted credit notes.', 'bit-integrations'),
  allocate_credit_note: __(
    'The credit note must be approved. Leave the date empty to use today.',
    'bit-integrations'
  ),
  delete_credit_note_allocation: __(
    'Get the <b>AllocationID</b> from the <b>Allocations</b> list of the credit note.',
    'bit-integrations'
  ),
  create_quote: `${lineNote} ${__('Leave the quote date empty to use today.', 'bit-integrations')}`,
  update_quote: lineUpdateNote,
  create_purchase_order: lineNote,
  update_purchase_order: lineUpdateNote,
  create_repeating_invoice: `${lineNote} ${__(
    'Xero sends the invoice only when the status is Approved, the type is Invoice and Approve for Sending is Yes.',
    'bit-integrations'
  )}`,
  update_contact: updateNote,
  create_or_update_contact: __(
    'Xero updates the contact that has this email. If no contact has it, Xero creates one. Map a name to create a contact.',
    'bit-integrations'
  ),
  add_contacts_to_group: __(
    'Select a contact, or map contact IDs. Separate the IDs with commas.',
    'bit-integrations'
  ),
  create_item: __('The item code must be unique in Xero.', 'bit-integrations'),
  update_item: updateNote,
  create_linked_transaction: linkedTransactionNote,
  update_linked_transaction: `${updateNote} ${linkedTransactionNote}`,
  create_payment: __(
    'Select what the payment is for and map the ID of that record. Leave the <b>Date</b> empty to use today.',
    'bit-integrations'
  ),
  create_batch_payment: __(
    'The batch pays one invoice or bill. Leave the <b>Date</b> empty to use today.',
    'bit-integrations'
  ),
  allocate_overpayment: paymentAllocationNote,
  delete_overpayment_allocation: paymentRemoveAllocationNote,
  allocate_prepayment: paymentAllocationNote,
  delete_prepayment_allocation: paymentRemoveAllocationNote,
  create_spend_money: lineNote,
  create_receive_money: lineNote,
  update_bank_transaction: `${updateNote} ${updateLinesNote}`,
  delete_bank_transaction: idNote,
  delete_bank_transfer: idNote,
  create_manual_journal: manualJournalNote,
  update_manual_journal: `${updateNote} ${__(
    'Map the debit fields to replace all lines with one debit line and one credit line.',
    'bit-integrations'
  )}`,
  update_manual_journal_status: idNote,
  update_account: updateNote,
  delete_account: __(
    'Xero does not delete bank accounts or accounts with transactions. Use Archive Account for them.',
    'bit-integrations'
  ),
  update_tracking_category: __(
    'Map a new name or select a status. Xero keeps the other values.',
    'bit-integrations'
  ),
  update_tracking_option: __(
    'Map a new name or select a status. Xero keeps the other values.',
    'bit-integrations'
  ),
  update_tax_rate: __(
    'Map the Tax Type code of the tax rate, for example TAX001. Map a component to replace all components.',
    'bit-integrations'
  ),
  add_currency: __(
    'Map the three-letter ISO code, for example USD. The organisation must have multicurrency enabled.',
    'bit-integrations'
  ),
  add_note: __(
    'Select the record type. Then map the ID of the record that gets the note.',
    'bit-integrations'
  ),
  upload_attachment: __(
    'Map a file upload field or a public file URL. Files can be up to 25 MB.',
    'bit-integrations'
  ),
  download_pdf: __(
    'Bit Integrations saves the PDF in the WordPress media library. Leave the file name empty to use the record type and ID.',
    'bit-integrations'
  )
}
