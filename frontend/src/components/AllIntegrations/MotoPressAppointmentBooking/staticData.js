import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_booking', label: __('Create Booking', 'bit-integrations'), is_pro: true },
  { name: 'update_booking', label: __('Update Booking', 'bit-integrations'), is_pro: true },
  { name: 'reschedule_booking', label: __('Reschedule Booking', 'bit-integrations'), is_pro: true },
  {
    name: 'change_booking_status',
    label: __('Change Booking Status', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'add_booking_log_entry',
    label: __('Add Booking Log Entry', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'resend_booking_confirmation',
    label: __('Resend Booking Confirmation', 'bit-integrations'),
    is_pro: true
  },
  { name: 'trash_booking', label: __('Move Booking to Trash', 'bit-integrations'), is_pro: true },
  { name: 'restore_booking', label: __('Restore Booking', 'bit-integrations'), is_pro: true },
  { name: 'delete_booking', label: __('Delete Booking', 'bit-integrations'), is_pro: true },
  { name: 'create_payment', label: __('Create Payment', 'bit-integrations'), is_pro: true },
  {
    name: 'change_payment_status',
    label: __('Change Payment Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_customer', label: __('Create Customer', 'bit-integrations'), is_pro: true },
  { name: 'update_customer', label: __('Update Customer', 'bit-integrations'), is_pro: true },
  { name: 'delete_customer', label: __('Delete Customer', 'bit-integrations'), is_pro: true },
  {
    name: 'create_customer_account',
    label: __('Create Customer Account', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_coupon', label: __('Create Coupon', 'bit-integrations'), is_pro: true },
  { name: 'update_coupon', label: __('Update Coupon', 'bit-integrations'), is_pro: true },
  { name: 'delete_coupon', label: __('Delete Coupon', 'bit-integrations'), is_pro: true }
]

const idField = (key, label) => [{ key, label, required: true }]

const BookingIdField = idField('booking_id', __('Booking ID', 'bit-integrations'))
const PaymentIdField = idField('payment_id', __('Payment ID', 'bit-integrations'))
const CustomerIdField = idField('customer_id', __('Customer ID', 'bit-integrations'))
const CouponIdField = idField('coupon_id', __('Coupon ID', 'bit-integrations'))

const ScheduleFields = [
  { key: 'date', label: __('Date (YYYY-MM-DD)', 'bit-integrations'), required: true },
  { key: 'start_time', label: __('Start Time (HH:MM, 24-hour)', 'bit-integrations'), required: true }
]

const BookingCustomerFields = [
  { key: 'customer_name', label: __('Customer Name', 'bit-integrations'), required: false },
  { key: 'customer_email', label: __('Customer Email', 'bit-integrations'), required: false },
  { key: 'customer_phone', label: __('Customer Phone', 'bit-integrations'), required: false },
  { key: 'customer_notes', label: __('Customer Notes', 'bit-integrations'), required: false }
]

const CustomerFields = required => [
  { key: 'name', label: __('Name', 'bit-integrations'), required },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false }
]

const CouponFields = required => [
  { key: 'code', label: __('Code', 'bit-integrations'), required },
  { key: 'amount', label: __('Amount', 'bit-integrations'), required },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  {
    key: 'expiration_date',
    label: __('Expiration Date (YYYY-MM-DD)', 'bit-integrations'),
    required: false
  },
  {
    key: 'min_date',
    label: __('First Booking Date (YYYY-MM-DD)', 'bit-integrations'),
    required: false
  },
  {
    key: 'max_date',
    label: __('Last Booking Date (YYYY-MM-DD)', 'bit-integrations'),
    required: false
  },
  { key: 'usage_limit', label: __('Usage Limit', 'bit-integrations'), required: false }
]

export const fieldsByAction = {
  create_booking: [
    ...ScheduleFields,
    { key: 'capacity', label: __('Number of Clients', 'bit-integrations'), required: false },
    ...BookingCustomerFields,
    { key: 'coupon_code', label: __('Coupon Code', 'bit-integrations'), required: false }
  ],
  update_booking: [...BookingIdField, ...BookingCustomerFields],
  reschedule_booking: [
    ...BookingIdField,
    ...ScheduleFields,
    { key: 'reservation_id', label: __('Reservation ID', 'bit-integrations'), required: false }
  ],
  change_booking_status: BookingIdField,
  add_booking_log_entry: [
    ...BookingIdField,
    { key: 'message', label: __('Message', 'bit-integrations'), required: true }
  ],
  resend_booking_confirmation: BookingIdField,
  trash_booking: BookingIdField,
  restore_booking: BookingIdField,
  delete_booking: BookingIdField,
  create_payment: [
    ...BookingIdField,
    { key: 'amount', label: __('Amount', 'bit-integrations'), required: true },
    { key: 'payment_method', label: __('Payment Method', 'bit-integrations'), required: false },
    { key: 'transaction_id', label: __('Transaction ID', 'bit-integrations'), required: false }
  ],
  change_payment_status: [
    ...PaymentIdField,
    { key: 'note', label: __('Note', 'bit-integrations'), required: false }
  ],
  create_customer: CustomerFields(true),
  update_customer: [...CustomerIdField, ...CustomerFields(false)],
  delete_customer: CustomerIdField,
  create_customer_account: CustomerIdField,
  create_coupon: CouponFields(true),
  update_coupon: [...CouponIdField, ...CouponFields(false)],
  delete_coupon: CouponIdField
}

export const BOOKING_STATUS_OPTIONS = [
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Confirmed', 'bit-integrations'), value: 'confirmed' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' }
]

export const PAYMENT_STATUS_OPTIONS = [
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('On Hold', 'bit-integrations'), value: 'on-hold' },
  { label: __('Completed', 'bit-integrations'), value: 'completed' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' },
  { label: __('Abandoned', 'bit-integrations'), value: 'abandoned' },
  { label: __('Failed', 'bit-integrations'), value: 'failed' },
  { label: __('Refunded', 'bit-integrations'), value: 'refunded' }
]

export const COUPON_TYPE_OPTIONS = [
  { label: __('Fixed', 'bit-integrations'), value: 'fixed' },
  { label: __('Percentage', 'bit-integrations'), value: 'percentage' }
]

export const COUPON_STATUS_OPTIONS = [
  { label: __('Active', 'bit-integrations'), value: 'publish' },
  { label: __('Inactive', 'bit-integrations'), value: 'draft' }
]

export const scheduleActions = ['create_booking', 'reschedule_booking']

export const bookingStatusActions = ['create_booking', 'change_booking_status']

export const paymentStatusActions = ['create_payment', 'change_payment_status']

export const userActions = ['create_customer', 'update_customer']

export const couponActions = ['create_coupon', 'update_coupon']

export const hasUtilities = bookingStatusActions

export const actionNotes = {
  create_booking: __(
    'Leave Employee and Location empty to let the plugin select them. Leave Status empty to use the plugin confirmation settings.',
    'bit-integrations'
  ),
  update_booking: __('Fields that you do not map keep their current value.', 'bit-integrations'),
  reschedule_booking: __(
    'Map the Reservation ID when the booking has more than one reservation. Leave Employee and Location empty to keep the current values.',
    'bit-integrations'
  ),
  resend_booking_confirmation: __(
    'The booking must be confirmed and have a customer email.',
    'bit-integrations'
  ),
  create_payment: __(
    'Leave the options empty to use the Pending status, the manual gateway and the site currency.',
    'bit-integrations'
  ),
  create_coupon: __(
    'Leave Discount Type empty to use a fixed discount. Leave Services empty to use the coupon for all services.',
    'bit-integrations'
  ),
  create_customer: __('Map an email or a phone. Each customer needs one of them.', 'bit-integrations'),
  update_customer: __(
    'Fields that you do not map and options that you do not select keep their current value.',
    'bit-integrations'
  ),
  delete_customer: __(
    'You cannot delete a customer that has bookings. Delete the bookings first.',
    'bit-integrations'
  ),
  create_customer_account: __(
    'When a WordPress user has the customer email, the customer is linked to that user.',
    'bit-integrations'
  ),
  update_coupon: __(
    'Fields that you do not map and options that you do not select keep their current value. Selected services replace the current services.',
    'bit-integrations'
  )
}
