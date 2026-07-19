import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'add_new_order', label: __('Add New Order', 'bit-integrations'), is_pro: true },
  {
    name: 'add_or_update_customer',
    label: __('Add or Update Customer', 'bit-integrations'),
    is_pro: true
  }
]

// The plan is chosen per flow via a fetched dropdown, so it is deliberately absent
// from the field map below.
export const AddNewOrderFields = [
  { key: 'customer_email', label: __('Customer Email', 'bit-integrations'), required: true },
  { key: 'amount', label: __('Amount', 'bit-integrations'), required: false },
  { key: 'payment_method', label: __('Payment Method', 'bit-integrations'), required: false },
  { key: 'transaction_id', label: __('Transaction ID', 'bit-integrations'), required: false },
  { key: 'order_date', label: __('Order Date', 'bit-integrations'), required: false },
  { key: 'billing_address', label: __('Billing Address', 'bit-integrations'), required: false },
  { key: 'billing_city', label: __('Billing City', 'bit-integrations'), required: false },
  { key: 'billing_state', label: __('Billing State', 'bit-integrations'), required: false },
  { key: 'billing_postcode', label: __('Billing Postcode', 'bit-integrations'), required: false },
  { key: 'billing_country', label: __('Billing Country', 'bit-integrations'), required: false },
  { key: 'billing_phone', label: __('Billing Phone', 'bit-integrations'), required: false }
]

export const AddOrUpdateCustomerFields = [
  { key: 'user_email', label: __('Email Address', 'bit-integrations'), required: true },
  { key: 'user_name', label: __('Username', 'bit-integrations'), required: true },
  { key: 'password', label: __('Password', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  {
    key: 'ppress_billing_address',
    label: __('Billing Address', 'bit-integrations'),
    required: false
  },
  { key: 'ppress_billing_city', label: __('Billing City', 'bit-integrations'), required: false },
  { key: 'ppress_billing_state', label: __('Billing State', 'bit-integrations'), required: false },
  {
    key: 'ppress_billing_postcode',
    label: __('Billing Postcode', 'bit-integrations'),
    required: false
  },
  {
    key: 'ppress_billing_country',
    label: __('Billing Country', 'bit-integrations'),
    required: false
  },
  { key: 'ppress_billing_phone', label: __('Billing Phone', 'bit-integrations'), required: false }
]

// Fixed option sets — rendered as selects, never field mapped.
export const orderStatusOptions = [
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Complete', 'bit-integrations'), value: 'complete' },
  { label: __('Failed', 'bit-integrations'), value: 'failed' },
  { label: __('Refunded', 'bit-integrations'), value: 'refunded' },
  { label: __('Abandoned', 'bit-integrations'), value: 'abandoned' }
]

export const sendReceiptOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'yes' },
  { label: __('No', 'bit-integrations'), value: 'no' }
]

// Which actions render which control in the integration layout.
export const needsPlan = ['add_new_order']

// Actions exposing optional settings under Utilities. Both have working defaults
// (order status falls back to pending, receipt to not sent), so they are opt-in.
export const hasUtilities = ['add_new_order']
