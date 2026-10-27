import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_customer', label: __('Create Customer', 'bit-integrations'), is_pro: true },
  { name: 'update_customer', label: __('Update Customer', 'bit-integrations'), is_pro: true },
  { name: 'deactivate_customer', label: __('Deactivate Customer', 'bit-integrations'), is_pro: true },
  { name: 'create_vendor', label: __('Create Vendor', 'bit-integrations'), is_pro: true },
  { name: 'update_vendor', label: __('Update Vendor', 'bit-integrations'), is_pro: true },
  { name: 'deactivate_vendor', label: __('Deactivate Vendor', 'bit-integrations'), is_pro: true },
  { name: 'create_employee', label: __('Create Employee', 'bit-integrations'), is_pro: true },
  { name: 'update_employee', label: __('Update Employee', 'bit-integrations'), is_pro: true },
  { name: 'deactivate_employee', label: __('Deactivate Employee', 'bit-integrations'), is_pro: true },
  { name: 'create_item', label: __('Create Item', 'bit-integrations'), is_pro: true },
  { name: 'update_item', label: __('Update Item', 'bit-integrations'), is_pro: true },
  { name: 'deactivate_item', label: __('Deactivate Item', 'bit-integrations'), is_pro: true },
  { name: 'create_account', label: __('Create Account', 'bit-integrations'), is_pro: true },
  { name: 'update_account', label: __('Update Account', 'bit-integrations'), is_pro: true },
  { name: 'create_invoice', label: __('Create Invoice', 'bit-integrations'), is_pro: true },
  { name: 'update_invoice', label: __('Update Invoice', 'bit-integrations'), is_pro: true },
  { name: 'delete_invoice', label: __('Delete Invoice', 'bit-integrations'), is_pro: true },
  { name: 'void_invoice', label: __('Void Invoice', 'bit-integrations'), is_pro: true },
  { name: 'send_invoice', label: __('Send Invoice', 'bit-integrations'), is_pro: true },
  { name: 'create_estimate', label: __('Create Estimate', 'bit-integrations'), is_pro: true },
  { name: 'update_estimate', label: __('Update Estimate', 'bit-integrations'), is_pro: true },
  { name: 'delete_estimate', label: __('Delete Estimate', 'bit-integrations'), is_pro: true },
  { name: 'send_estimate', label: __('Send Estimate', 'bit-integrations'), is_pro: true },
  { name: 'create_sales_receipt', label: __('Create Sales Receipt', 'bit-integrations'), is_pro: true },
  { name: 'delete_sales_receipt', label: __('Delete Sales Receipt', 'bit-integrations'), is_pro: true },
  { name: 'void_sales_receipt', label: __('Void Sales Receipt', 'bit-integrations'), is_pro: true },
  { name: 'send_sales_receipt', label: __('Send Sales Receipt', 'bit-integrations'), is_pro: true },
  { name: 'create_payment', label: __('Create Payment', 'bit-integrations'), is_pro: true },
  { name: 'delete_payment', label: __('Delete Payment', 'bit-integrations'), is_pro: true },
  { name: 'void_payment', label: __('Void Payment', 'bit-integrations'), is_pro: true },
  { name: 'send_payment', label: __('Send Payment Receipt', 'bit-integrations'), is_pro: true },
  { name: 'create_credit_memo', label: __('Create Credit Memo', 'bit-integrations'), is_pro: true },
  { name: 'delete_credit_memo', label: __('Delete Credit Memo', 'bit-integrations'), is_pro: true },
  { name: 'send_credit_memo', label: __('Send Credit Memo', 'bit-integrations'), is_pro: true },
  {
    name: 'create_refund_receipt',
    label: __('Create Refund Receipt', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_refund_receipt',
    label: __('Delete Refund Receipt', 'bit-integrations'),
    is_pro: true
  },
  { name: 'send_refund_receipt', label: __('Send Refund Receipt', 'bit-integrations'), is_pro: true },
  { name: 'create_bill', label: __('Create Bill', 'bit-integrations'), is_pro: true },
  { name: 'update_bill', label: __('Update Bill', 'bit-integrations'), is_pro: true },
  { name: 'delete_bill', label: __('Delete Bill', 'bit-integrations'), is_pro: true },
  { name: 'create_bill_payment', label: __('Create Bill Payment', 'bit-integrations'), is_pro: true },
  { name: 'delete_bill_payment', label: __('Delete Bill Payment', 'bit-integrations'), is_pro: true },
  { name: 'void_bill_payment', label: __('Void Bill Payment', 'bit-integrations'), is_pro: true },
  { name: 'create_expense', label: __('Create Expense', 'bit-integrations'), is_pro: true },
  { name: 'delete_expense', label: __('Delete Expense', 'bit-integrations'), is_pro: true },
  {
    name: 'create_purchase_order',
    label: __('Create Purchase Order', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_purchase_order',
    label: __('Delete Purchase Order', 'bit-integrations'),
    is_pro: true
  },
  { name: 'send_purchase_order', label: __('Send Purchase Order', 'bit-integrations'), is_pro: true },
  { name: 'create_vendor_credit', label: __('Create Vendor Credit', 'bit-integrations'), is_pro: true },
  { name: 'delete_vendor_credit', label: __('Delete Vendor Credit', 'bit-integrations'), is_pro: true },
  { name: 'create_journal_entry', label: __('Create Journal Entry', 'bit-integrations'), is_pro: true },
  { name: 'delete_journal_entry', label: __('Delete Journal Entry', 'bit-integrations'), is_pro: true },
  { name: 'create_deposit', label: __('Create Deposit', 'bit-integrations'), is_pro: true },
  { name: 'delete_deposit', label: __('Delete Deposit', 'bit-integrations'), is_pro: true },
  { name: 'create_transfer', label: __('Create Transfer', 'bit-integrations'), is_pro: true },
  { name: 'delete_transfer', label: __('Delete Transfer', 'bit-integrations'), is_pro: true },
  { name: 'create_time_activity', label: __('Create Time Activity', 'bit-integrations'), is_pro: true },
  { name: 'delete_time_activity', label: __('Delete Time Activity', 'bit-integrations'), is_pro: true },
  { name: 'create_class', label: __('Create Class', 'bit-integrations'), is_pro: true },
  { name: 'create_department', label: __('Create Department', 'bit-integrations'), is_pro: true },
  { name: 'create_term', label: __('Create Term', 'bit-integrations'), is_pro: true },
  {
    name: 'create_payment_method',
    label: __('Create Payment Method', 'bit-integrations'),
    is_pro: true
  },
  { name: 'upload_attachment', label: __('Upload Attachment', 'bit-integrations'), is_pro: true },
  { name: 'add_note', label: __('Add Note', 'bit-integrations'), is_pro: true }
]

const field = (key, label, required = false) => ({ key, label, required })

const idField = (key, label) => field(key, label, true)

const contactFields = [
  field('title', __('Title', 'bit-integrations')),
  field('given_name', __('First Name', 'bit-integrations')),
  field('middle_name', __('Middle Name', 'bit-integrations')),
  field('family_name', __('Last Name', 'bit-integrations')),
  field('suffix', __('Suffix', 'bit-integrations')),
  field('company_name', __('Company Name', 'bit-integrations')),
  field('email', __('Email', 'bit-integrations')),
  field('phone', __('Phone', 'bit-integrations')),
  field('mobile', __('Mobile', 'bit-integrations')),
  field('fax', __('Fax', 'bit-integrations')),
  field('website', __('Website', 'bit-integrations'))
]

const addressFields = (prefix, title) => [
  field(`${prefix}line1`, `${title} ${__('Street', 'bit-integrations')}`),
  field(`${prefix}line2`, `${title} ${__('Street Line 2', 'bit-integrations')}`),
  field(`${prefix}city`, `${title} ${__('City', 'bit-integrations')}`),
  field(`${prefix}state`, `${title} ${__('State', 'bit-integrations')}`),
  field(`${prefix}postal_code`, `${title} ${__('ZIP Code', 'bit-integrations')}`),
  field(`${prefix}country`, `${title} ${__('Country', 'bit-integrations')}`)
]

const billingAddressFields = addressFields('bill_', __('Billing', 'bit-integrations'))

const displayNameField = required =>
  field('display_name', __('Display Name', 'bit-integrations'), required)

const customerFields = isCreate => [
  displayNameField(isCreate),
  ...contactFields,
  field('notes', __('Notes', 'bit-integrations')),
  ...billingAddressFields,
  ...addressFields('ship_', __('Shipping', 'bit-integrations')),
  field('resale_number', __('Resale Number', 'bit-integrations'))
]

const vendorFields = isCreate => [
  displayNameField(isCreate),
  ...contactFields,
  ...billingAddressFields,
  field('account_number', __('Account Number', 'bit-integrations')),
  field('tax_id', __('Tax ID', 'bit-integrations'))
]

const employeeFields = isCreate => [
  field('given_name', __('First Name', 'bit-integrations'), isCreate),
  field('family_name', __('Last Name', 'bit-integrations'), isCreate),
  field('title', __('Title', 'bit-integrations')),
  field('middle_name', __('Middle Name', 'bit-integrations')),
  field('suffix', __('Suffix', 'bit-integrations')),
  displayNameField(false),
  field('email', __('Email', 'bit-integrations')),
  field('phone', __('Phone', 'bit-integrations')),
  field('mobile', __('Mobile', 'bit-integrations')),
  ...addressFields('address_', __('Address', 'bit-integrations')),
  field('employee_number', __('Employee Number', 'bit-integrations')),
  field('hired_date', __('Hired Date (YYYY-MM-DD)', 'bit-integrations')),
  field('birth_date', __('Birth Date (YYYY-MM-DD)', 'bit-integrations')),
  field('bill_rate', __('Bill Rate', 'bit-integrations'))
]

const itemFields = isCreate => [
  field('name', __('Name', 'bit-integrations'), isCreate),
  field('sku', __('SKU', 'bit-integrations')),
  field('description', __('Description', 'bit-integrations')),
  field('unit_price', __('Unit Price', 'bit-integrations')),
  field('purchase_description', __('Purchase Description', 'bit-integrations')),
  field('purchase_cost', __('Purchase Cost', 'bit-integrations')),
  field('quantity_on_hand', __('Quantity on Hand', 'bit-integrations')),
  field('inventory_start_date', __('Inventory Start Date (YYYY-MM-DD)', 'bit-integrations'))
]

const accountFields = isCreate => [
  field('name', __('Name', 'bit-integrations'), isCreate),
  field('account_sub_type', __('Detail Type (for example CashOnHand)', 'bit-integrations')),
  field('account_number', __('Account Number', 'bit-integrations')),
  field('description', __('Description', 'bit-integrations'))
]

const txnDateField = label => field('txn_date', label)
const docNumberField = label => field('doc_number', label)
const dueDateField = field('due_date', __('Due Date (YYYY-MM-DD)', 'bit-integrations'))
const billEmailField = field('bill_email', __('Billing Email', 'bit-integrations'))
const customerMemoField = field('customer_memo', __('Message to Customer', 'bit-integrations'))
const privateNoteField = field('private_note', __('Private Note', 'bit-integrations'))
const memoField = field('private_note', __('Memo', 'bit-integrations'))
const paymentReferenceField = field('payment_reference', __('Reference Number', 'bit-integrations'))
const sendToField = field('send_to', __('Send To (Email)', 'bit-integrations'))

const lineFields = [
  field('line_description', __('Line Description', 'bit-integrations')),
  field('line_quantity', __('Line Quantity', 'bit-integrations')),
  field('line_unit_price', __('Line Unit Price', 'bit-integrations')),
  field('line_amount', __('Line Amount', 'bit-integrations'))
]

const salesLineFields = [
  ...lineFields,
  field('line_service_date', __('Line Service Date (YYYY-MM-DD)', 'bit-integrations'))
]

const salesHeaderFields = (dateLabel, numberLabel) => [
  txnDateField(dateLabel),
  docNumberField(numberLabel),
  billEmailField,
  customerMemoField,
  privateNoteField
]

const invoiceFields = [
  ...salesHeaderFields(
    __('Invoice Date (YYYY-MM-DD)', 'bit-integrations'),
    __('Invoice Number', 'bit-integrations')
  ),
  dueDateField,
  ...salesLineFields
]

const estimateFields = [
  ...salesHeaderFields(
    __('Estimate Date (YYYY-MM-DD)', 'bit-integrations'),
    __('Estimate Number', 'bit-integrations')
  ),
  field('expiration_date', __('Expiration Date (YYYY-MM-DD)', 'bit-integrations')),
  ...salesLineFields
]

const receiptFields = (dateLabel, numberLabel) => [
  ...salesHeaderFields(dateLabel, numberLabel),
  paymentReferenceField,
  ...salesLineFields
]

const purchaseHeaderFields = (dateLabel, numberLabel) => [
  txnDateField(dateLabel),
  docNumberField(numberLabel),
  memoField
]

const billFields = [
  ...purchaseHeaderFields(
    __('Bill Date (YYYY-MM-DD)', 'bit-integrations'),
    __('Bill Number', 'bit-integrations')
  ),
  dueDateField,
  ...lineFields
]

const invoiceIdField = idField('invoice_id', __('Invoice ID', 'bit-integrations'))
const estimateIdField = idField('estimate_id', __('Estimate ID', 'bit-integrations'))
const salesReceiptIdField = idField('sales_receipt_id', __('Sales Receipt ID', 'bit-integrations'))
const paymentIdField = idField('payment_id', __('Payment ID', 'bit-integrations'))
const creditMemoIdField = idField('credit_memo_id', __('Credit Memo ID', 'bit-integrations'))
const refundReceiptIdField = idField('refund_receipt_id', __('Refund Receipt ID', 'bit-integrations'))
const billIdField = idField('bill_id', __('Bill ID', 'bit-integrations'))
const purchaseOrderIdField = idField('purchase_order_id', __('Purchase Order ID', 'bit-integrations'))

const amountField = required => field('amount', __('Amount', 'bit-integrations'), required)
const descriptionField = field('description', __('Description', 'bit-integrations'))

export const fieldsByAction = {
  create_customer: customerFields(true),
  update_customer: [
    idField('customer_id', __('Customer ID', 'bit-integrations')),
    ...customerFields(false)
  ],
  deactivate_customer: [idField('customer_id', __('Customer ID', 'bit-integrations'))],
  create_vendor: vendorFields(true),
  update_vendor: [idField('vendor_id', __('Vendor ID', 'bit-integrations')), ...vendorFields(false)],
  deactivate_vendor: [idField('vendor_id', __('Vendor ID', 'bit-integrations'))],
  create_employee: employeeFields(true),
  update_employee: [
    idField('employee_id', __('Employee ID', 'bit-integrations')),
    ...employeeFields(false)
  ],
  deactivate_employee: [idField('employee_id', __('Employee ID', 'bit-integrations'))],
  create_item: itemFields(true),
  update_item: [idField('item_id', __('Item ID', 'bit-integrations')), ...itemFields(false)],
  deactivate_item: [idField('item_id', __('Item ID', 'bit-integrations'))],
  create_account: accountFields(true),
  update_account: [idField('account_id', __('Account ID', 'bit-integrations')), ...accountFields(false)],
  create_invoice: invoiceFields,
  update_invoice: [invoiceIdField, ...invoiceFields],
  delete_invoice: [invoiceIdField],
  void_invoice: [invoiceIdField],
  send_invoice: [invoiceIdField, sendToField],
  create_estimate: estimateFields,
  update_estimate: [estimateIdField, ...estimateFields],
  delete_estimate: [estimateIdField],
  send_estimate: [estimateIdField, sendToField],
  create_sales_receipt: receiptFields(
    __('Receipt Date (YYYY-MM-DD)', 'bit-integrations'),
    __('Receipt Number', 'bit-integrations')
  ),
  delete_sales_receipt: [salesReceiptIdField],
  void_sales_receipt: [salesReceiptIdField],
  send_sales_receipt: [salesReceiptIdField, sendToField],
  create_payment: [
    field('total_amount', __('Total Amount', 'bit-integrations'), true),
    field('invoice_id', __('Invoice ID to Pay', 'bit-integrations')),
    field('applied_amount', __('Amount to Apply', 'bit-integrations')),
    txnDateField(__('Payment Date (YYYY-MM-DD)', 'bit-integrations')),
    paymentReferenceField,
    privateNoteField
  ],
  delete_payment: [paymentIdField],
  void_payment: [paymentIdField],
  send_payment: [paymentIdField, sendToField],
  create_credit_memo: [
    ...salesHeaderFields(
      __('Credit Memo Date (YYYY-MM-DD)', 'bit-integrations'),
      __('Credit Memo Number', 'bit-integrations')
    ),
    ...salesLineFields
  ],
  delete_credit_memo: [creditMemoIdField],
  send_credit_memo: [creditMemoIdField, sendToField],
  create_refund_receipt: receiptFields(
    __('Refund Date (YYYY-MM-DD)', 'bit-integrations'),
    __('Refund Receipt Number', 'bit-integrations')
  ),
  delete_refund_receipt: [refundReceiptIdField],
  send_refund_receipt: [refundReceiptIdField, sendToField],
  create_bill: billFields,
  update_bill: [billIdField, ...billFields],
  delete_bill: [billIdField],
  create_bill_payment: [
    billIdField,
    field('total_amount', __('Amount', 'bit-integrations'), true),
    txnDateField(__('Payment Date (YYYY-MM-DD)', 'bit-integrations')),
    docNumberField(__('Reference Number', 'bit-integrations')),
    memoField
  ],
  delete_bill_payment: [idField('bill_payment_id', __('Bill Payment ID', 'bit-integrations'))],
  void_bill_payment: [idField('bill_payment_id', __('Bill Payment ID', 'bit-integrations'))],
  create_expense: [
    ...purchaseHeaderFields(
      __('Payment Date (YYYY-MM-DD)', 'bit-integrations'),
      __('Reference Number', 'bit-integrations')
    ),
    ...lineFields
  ],
  delete_expense: [idField('expense_id', __('Expense ID', 'bit-integrations'))],
  create_purchase_order: [
    ...purchaseHeaderFields(
      __('Purchase Order Date (YYYY-MM-DD)', 'bit-integrations'),
      __('PO Number', 'bit-integrations')
    ),
    dueDateField,
    field('memo', __('Message to Vendor', 'bit-integrations')),
    field('po_email', __('Vendor Email', 'bit-integrations')),
    ...addressFields('ship_', __('Shipping', 'bit-integrations')),
    ...lineFields
  ],
  delete_purchase_order: [purchaseOrderIdField],
  send_purchase_order: [purchaseOrderIdField, sendToField],
  create_vendor_credit: [
    ...purchaseHeaderFields(
      __('Credit Date (YYYY-MM-DD)', 'bit-integrations'),
      __('Reference Number', 'bit-integrations')
    ),
    ...lineFields
  ],
  delete_vendor_credit: [idField('vendor_credit_id', __('Vendor Credit ID', 'bit-integrations'))],
  create_journal_entry: [
    amountField(true),
    descriptionField,
    txnDateField(__('Journal Date (YYYY-MM-DD)', 'bit-integrations')),
    docNumberField(__('Journal Number', 'bit-integrations')),
    memoField
  ],
  delete_journal_entry: [idField('journal_entry_id', __('Journal Entry ID', 'bit-integrations'))],
  create_deposit: [
    amountField(true),
    descriptionField,
    txnDateField(__('Deposit Date (YYYY-MM-DD)', 'bit-integrations')),
    memoField
  ],
  delete_deposit: [idField('deposit_id', __('Deposit ID', 'bit-integrations'))],
  create_transfer: [
    amountField(true),
    txnDateField(__('Transfer Date (YYYY-MM-DD)', 'bit-integrations')),
    memoField
  ],
  delete_transfer: [idField('transfer_id', __('Transfer ID', 'bit-integrations'))],
  create_time_activity: [
    field('hours', __('Hours', 'bit-integrations'), true),
    field('minutes', __('Minutes', 'bit-integrations')),
    txnDateField(__('Date (YYYY-MM-DD)', 'bit-integrations')),
    descriptionField,
    field('hourly_rate', __('Hourly Rate', 'bit-integrations'))
  ],
  delete_time_activity: [idField('time_activity_id', __('Time Activity ID', 'bit-integrations'))],
  create_class: [field('name', __('Name', 'bit-integrations'), true)],
  create_department: [field('name', __('Name', 'bit-integrations'), true)],
  create_term: [
    field('name', __('Name', 'bit-integrations'), true),
    field('due_days', __('Due Days', 'bit-integrations'), true),
    field('discount_percent', __('Discount Percent', 'bit-integrations')),
    field('discount_days', __('Discount Days', 'bit-integrations'))
  ],
  create_payment_method: [field('name', __('Name', 'bit-integrations'), true)],
  upload_attachment: [
    idField('entity_id', __('Record ID', 'bit-integrations')),
    field('file_url', __('File URL', 'bit-integrations'), true),
    field('file_name', __('File Name', 'bit-integrations')),
    field('note', __('Note', 'bit-integrations'))
  ],
  add_note: [
    idField('entity_id', __('Record ID', 'bit-integrations')),
    field('note', __('Note', 'bit-integrations'), true)
  ]
}

const options = list => list.map(([value, label]) => ({ label, value }))

const itemTypeOptions = options([
  ['Service', __('Service', 'bit-integrations')],
  ['NonInventory', __('Non-inventory', 'bit-integrations')],
  ['Inventory', __('Inventory', 'bit-integrations')]
])

const accountTypeOptions = options([
  ['Bank', __('Bank', 'bit-integrations')],
  ['Accounts Receivable', __('Accounts Receivable', 'bit-integrations')],
  ['Other Current Asset', __('Other Current Asset', 'bit-integrations')],
  ['Fixed Asset', __('Fixed Asset', 'bit-integrations')],
  ['Other Asset', __('Other Asset', 'bit-integrations')],
  ['Accounts Payable', __('Accounts Payable', 'bit-integrations')],
  ['Credit Card', __('Credit Card', 'bit-integrations')],
  ['Other Current Liability', __('Other Current Liability', 'bit-integrations')],
  ['Long Term Liability', __('Long Term Liability', 'bit-integrations')],
  ['Equity', __('Equity', 'bit-integrations')],
  ['Income', __('Income', 'bit-integrations')],
  ['Other Income', __('Other Income', 'bit-integrations')],
  ['Cost of Goods Sold', __('Cost of Goods Sold', 'bit-integrations')],
  ['Expense', __('Expense', 'bit-integrations')],
  ['Other Expense', __('Other Expense', 'bit-integrations')]
])

const estimateStatusOptions = options([
  ['Pending', __('Pending', 'bit-integrations')],
  ['Accepted', __('Accepted', 'bit-integrations')],
  ['Closed', __('Closed', 'bit-integrations')],
  ['Rejected', __('Rejected', 'bit-integrations')]
])

const payTypeOptions = options([
  ['Check', __('Check', 'bit-integrations')],
  ['CreditCard', __('Credit Card', 'bit-integrations')]
])

const paymentTypeOptions = options([
  ['Cash', __('Cash', 'bit-integrations')],
  ['Check', __('Check', 'bit-integrations')],
  ['CreditCard', __('Credit Card', 'bit-integrations')]
])

const workerTypeOptions = options([
  ['Employee', __('Employee', 'bit-integrations')],
  ['Vendor', __('Vendor', 'bit-integrations')]
])

const billableStatusOptions = options([
  ['Billable', __('Billable', 'bit-integrations')],
  ['NotBillable', __('Not billable', 'bit-integrations')]
])

const paymentMethodTypeOptions = options([
  ['CREDIT_CARD', __('Credit card', 'bit-integrations')],
  ['NON_CREDIT_CARD', __('Other', 'bit-integrations')]
])

const deliveryMethodOptions = options([
  ['Email', __('Email', 'bit-integrations')],
  ['Print', __('Print', 'bit-integrations')],
  ['None', __('None', 'bit-integrations')]
])

const recordTypeOptions = options([
  ['Invoice', __('Invoice', 'bit-integrations')],
  ['Estimate', __('Estimate', 'bit-integrations')],
  ['SalesReceipt', __('Sales Receipt', 'bit-integrations')],
  ['CreditMemo', __('Credit Memo', 'bit-integrations')],
  ['RefundReceipt', __('Refund Receipt', 'bit-integrations')],
  ['Payment', __('Payment', 'bit-integrations')],
  ['Bill', __('Bill', 'bit-integrations')],
  ['BillPayment', __('Bill Payment', 'bit-integrations')],
  ['Purchase', __('Expense', 'bit-integrations')],
  ['PurchaseOrder', __('Purchase Order', 'bit-integrations')],
  ['VendorCredit', __('Vendor Credit', 'bit-integrations')],
  ['JournalEntry', __('Journal Entry', 'bit-integrations')],
  ['Deposit', __('Deposit', 'bit-integrations')],
  ['Transfer', __('Transfer', 'bit-integrations')],
  ['TimeActivity', __('Time Activity', 'bit-integrations')],
  ['Customer', __('Customer', 'bit-integrations')],
  ['Vendor', __('Vendor', 'bit-integrations')],
  ['Employee', __('Employee', 'bit-integrations')],
  ['Item', __('Item', 'bit-integrations')]
])

const select = (key, label, source, required = false) => ({ key, label, required, source })

const enumSelect = (key, label, selectOptions, required = false) => ({
  key,
  label,
  options: selectOptions,
  required
})

const customerSelect = required =>
  select('customer_id', __('Customer', 'bit-integrations'), 'customers', required)
const vendorSelect = required =>
  select('vendor_id', __('Vendor', 'bit-integrations'), 'vendors', required)
const termSelect = select('term_id', __('Terms', 'bit-integrations'), 'terms')
const paymentMethodSelect = select(
  'payment_method_id',
  __('Payment Method', 'bit-integrations'),
  'paymentMethods'
)
const classSelect = select('class_id', __('Class', 'bit-integrations'), 'classes')
const departmentSelect = select('department_id', __('Department', 'bit-integrations'), 'departments')
const accountSelect = (key, label, required = false) => select(key, label, 'accounts', required)
const lineItemSelect = required =>
  select('line_item_id', __('Line Item', 'bit-integrations'), 'items', required)
const lineCategorySelect = accountSelect('line_account_id', __('Line Category', 'bit-integrations'))
const depositAccountSelect = (label, required = false) =>
  accountSelect('deposit_account_id', label, required)

const salesSelects = (customerRequired, lineRequired) => [
  customerSelect(customerRequired),
  lineItemSelect(lineRequired),
  classSelect,
  departmentSelect
]

const expenseLineSelects = [lineCategorySelect, lineItemSelect(false)]

export const selectsByAction = {
  create_customer: [
    termSelect,
    paymentMethodSelect,
    select('parent_id', __('Parent Customer', 'bit-integrations'), 'customers'),
    enumSelect('delivery_method', __('Delivery Method', 'bit-integrations'), deliveryMethodOptions)
  ],
  update_customer: [
    termSelect,
    paymentMethodSelect,
    enumSelect('delivery_method', __('Delivery Method', 'bit-integrations'), deliveryMethodOptions)
  ],
  create_vendor: [termSelect],
  update_vendor: [termSelect],
  create_item: [
    enumSelect('item_type', __('Item Type', 'bit-integrations'), itemTypeOptions, true),
    accountSelect('income_account_id', __('Income Account', 'bit-integrations'), true),
    accountSelect('expense_account_id', __('Expense Account', 'bit-integrations')),
    accountSelect('asset_account_id', __('Inventory Asset Account', 'bit-integrations')),
    select('preferred_vendor_id', __('Preferred Vendor', 'bit-integrations'), 'vendors')
  ],
  update_item: [
    accountSelect('income_account_id', __('Income Account', 'bit-integrations')),
    accountSelect('expense_account_id', __('Expense Account', 'bit-integrations')),
    select('preferred_vendor_id', __('Preferred Vendor', 'bit-integrations'), 'vendors')
  ],
  create_account: [
    enumSelect('account_type', __('Account Type', 'bit-integrations'), accountTypeOptions, true),
    accountSelect('parent_id', __('Parent Account', 'bit-integrations'))
  ],
  update_account: [
    enumSelect('account_type', __('Account Type', 'bit-integrations'), accountTypeOptions),
    accountSelect('parent_id', __('Parent Account', 'bit-integrations'))
  ],
  create_invoice: [...salesSelects(true, true), termSelect],
  update_invoice: [...salesSelects(false, false), termSelect],
  create_estimate: [
    ...salesSelects(true, true),
    enumSelect('status', __('Estimate Status', 'bit-integrations'), estimateStatusOptions)
  ],
  update_estimate: [
    ...salesSelects(false, false),
    enumSelect('status', __('Estimate Status', 'bit-integrations'), estimateStatusOptions)
  ],
  create_sales_receipt: [
    ...salesSelects(false, true),
    paymentMethodSelect,
    depositAccountSelect(__('Deposit To', 'bit-integrations'))
  ],
  create_payment: [
    customerSelect(true),
    paymentMethodSelect,
    depositAccountSelect(__('Deposit To', 'bit-integrations'))
  ],
  create_credit_memo: salesSelects(true, true),
  create_refund_receipt: [
    ...salesSelects(false, true),
    paymentMethodSelect,
    depositAccountSelect(__('Refund From', 'bit-integrations'), true)
  ],
  create_bill: [
    vendorSelect(true),
    ...expenseLineSelects,
    termSelect,
    accountSelect('ap_account_id', __('Accounts Payable Account', 'bit-integrations')),
    departmentSelect
  ],
  update_bill: [
    ...expenseLineSelects,
    termSelect,
    accountSelect('ap_account_id', __('Accounts Payable Account', 'bit-integrations')),
    departmentSelect
  ],
  create_bill_payment: [
    vendorSelect(true),
    enumSelect('pay_type', __('Payment Type', 'bit-integrations'), payTypeOptions, true),
    accountSelect('payment_account_id', __('Payment Account', 'bit-integrations'), true)
  ],
  create_expense: [
    enumSelect('payment_type', __('Payment Type', 'bit-integrations'), paymentTypeOptions, true),
    accountSelect('payment_account_id', __('Payment Account', 'bit-integrations'), true),
    select('payee_id', __('Payee (Vendor)', 'bit-integrations'), 'vendors'),
    ...expenseLineSelects,
    paymentMethodSelect,
    departmentSelect
  ],
  create_purchase_order: [vendorSelect(true), ...expenseLineSelects, departmentSelect],
  create_vendor_credit: [vendorSelect(true), ...expenseLineSelects, departmentSelect],
  create_journal_entry: [
    accountSelect('debit_account_id', __('Debit Account', 'bit-integrations'), true),
    accountSelect('credit_account_id', __('Credit Account', 'bit-integrations'), true),
    customerSelect(false)
  ],
  create_deposit: [
    depositAccountSelect(__('Deposit To', 'bit-integrations'), true),
    accountSelect('line_account_id', __('Received From Account', 'bit-integrations'), true),
    departmentSelect
  ],
  create_transfer: [
    accountSelect('from_account_id', __('Transfer From', 'bit-integrations'), true),
    accountSelect('to_account_id', __('Transfer To', 'bit-integrations'), true)
  ],
  create_time_activity: [
    enumSelect('name_of', __('Worker Type', 'bit-integrations'), workerTypeOptions, true),
    select('employee_id', __('Employee', 'bit-integrations'), 'employees'),
    vendorSelect(false),
    customerSelect(false),
    select('item_id', __('Service', 'bit-integrations'), 'items'),
    enumSelect('billable_status', __('Billable Status', 'bit-integrations'), billableStatusOptions),
    classSelect,
    departmentSelect
  ],
  create_class: [select('parent_id', __('Parent Class', 'bit-integrations'), 'classes')],
  create_department: [select('parent_id', __('Parent Department', 'bit-integrations'), 'departments')],
  create_payment_method: [
    enumSelect('payment_method_type', __('Type', 'bit-integrations'), paymentMethodTypeOptions)
  ],
  upload_attachment: [
    enumSelect('entity_type', __('Record Type', 'bit-integrations'), recordTypeOptions, true)
  ],
  add_note: [enumSelect('entity_type', __('Record Type', 'bit-integrations'), recordTypeOptions, true)]
}

export const selectKeys = [
  ...new Set(Object.values(selectsByAction).flatMap(selects => selects.map(({ key }) => key)))
]

const salesLineNote = __(
  'Select a <b>Line Item</b>. Then map the <b>Line Amount</b>, or the <b>Line Quantity</b> and the <b>Line Unit Price</b>. Inventory items need a quantity.',
  'bit-integrations'
)
const salesLineUpdateNote = __(
  'Select a <b>Line Item</b> to replace all lines with one new line. Leave it empty to keep the current lines.',
  'bit-integrations'
)
const expenseLineNote = __(
  'Select a <b>Line Category</b> or a <b>Line Item</b>. Then map the <b>Line Amount</b>, or the <b>Line Quantity</b> and the <b>Line Unit Price</b>.',
  'bit-integrations'
)
const sendNote = __(
  'Leave <b>Send To</b> empty to use the email address that QuickBooks has for this record.',
  'bit-integrations'
)

export const notesByAction = {
  create_item: __(
    'An Inventory item also needs the <b>Expense Account</b>, the <b>Inventory Asset Account</b>, the <b>Quantity on Hand</b> and the <b>Inventory Start Date</b>. Its income account must have the Sales of Product Income detail type.',
    'bit-integrations'
  ),
  create_invoice: salesLineNote,
  update_invoice: salesLineUpdateNote,
  send_invoice: sendNote,
  create_estimate: salesLineNote,
  update_estimate: salesLineUpdateNote,
  send_estimate: sendNote,
  create_sales_receipt: salesLineNote,
  send_sales_receipt: sendNote,
  create_payment: __(
    'Map an <b>Invoice ID to Pay</b> to apply the payment to an invoice of the selected customer. Leave <b>Amount to Apply</b> empty to apply the total amount.',
    'bit-integrations'
  ),
  send_payment: sendNote,
  create_credit_memo: salesLineNote,
  send_credit_memo: sendNote,
  create_refund_receipt: salesLineNote,
  send_refund_receipt: sendNote,
  create_bill: expenseLineNote,
  update_bill: __(
    'Select a <b>Line Category</b> or a <b>Line Item</b> to replace all lines with one new line. Leave both empty to keep the current lines.',
    'bit-integrations'
  ),
  create_bill_payment: __(
    'Select a bank account for Check, or a credit card account for Credit Card.',
    'bit-integrations'
  ),
  create_expense: expenseLineNote,
  create_purchase_order: expenseLineNote,
  send_purchase_order: sendNote,
  create_vendor_credit: expenseLineNote,
  create_journal_entry: __(
    'The entry debits one account and credits the other with the same amount. An Accounts Receivable or Accounts Payable line needs a <b>Customer</b>.',
    'bit-integrations'
  ),
  create_time_activity: __(
    'Select an <b>Employee</b> for the Employee worker type, or a <b>Vendor</b> for the Vendor worker type.',
    'bit-integrations'
  ),
  upload_attachment: __(
    'Use a public file URL or a file URL from the WordPress media library. The maximum size is 20 MB.',
    'bit-integrations'
  ),
  deactivate_customer: __(
    'QuickBooks cannot deactivate a customer that has an open balance.',
    'bit-integrations'
  )
}

const checkboxUtility = (key, title, subTitle, value = 'true') => ({ key, subTitle, title, value })

const taxableUtility = checkboxUtility(
  'taxable',
  __('Taxable', 'bit-integrations'),
  __('Mark the record as taxable.', 'bit-integrations')
)

export const utilitiesByAction = {
  create_customer: [taxableUtility],
  update_customer: [taxableUtility],
  create_vendor: [
    checkboxUtility(
      'vendor_1099',
      __('Track 1099 Payments', 'bit-integrations'),
      __('Track payments to this vendor for 1099 forms.', 'bit-integrations')
    )
  ],
  create_employee: [
    checkboxUtility(
      'billable_time',
      __('Billable Time', 'bit-integrations'),
      __('Mark the time of this employee as billable.', 'bit-integrations')
    )
  ],
  create_item: [taxableUtility],
  update_item: [taxableUtility],
  create_journal_entry: [
    checkboxUtility(
      'adjustment',
      __('Adjusting Entry', 'bit-integrations'),
      __('Mark the journal entry as an adjusting entry.', 'bit-integrations')
    )
  ],
  upload_attachment: [
    checkboxUtility(
      'include_on_send',
      __('Include When Sent', 'bit-integrations'),
      __('Attach the file when QuickBooks sends the record by email.', 'bit-integrations')
    )
  ]
}
