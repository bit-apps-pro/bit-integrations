import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_booking', label: __('Create Booking', 'bit-integrations'), is_pro: true },
  {
    name: 'change_booking_status',
    label: __('Change Booking Status', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_booking_customer',
    label: __('Update Booking Customer', 'bit-integrations'),
    is_pro: true
  },
  { name: 'add_booking_note', label: __('Add Booking Note', 'bit-integrations'), is_pro: true },
  { name: 'trash_booking', label: __('Move Booking to Trash', 'bit-integrations'), is_pro: true },
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
    name: 'create_accommodation_type',
    label: __('Create Accommodation Type', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_accommodation',
    label: __('Create Accommodation', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_coupon', label: __('Create Coupon', 'bit-integrations'), is_pro: true },
  { name: 'block_dates', label: __('Block Dates', 'bit-integrations'), is_pro: true },
  {
    name: 'remove_blocked_dates',
    label: __('Remove Blocked Dates', 'bit-integrations'),
    is_pro: true
  }
]

const idField = (key, label) => [{ key, label, required: true }]

const BookingIdField = idField('booking_id', __('Booking ID', 'bit-integrations'))
const PaymentIdField = idField('payment_id', __('Payment ID', 'bit-integrations'))
const CustomerIdField = idField('customer_id', __('Customer (customer ID or email)', 'bit-integrations'))

const CustomerFields = emailRequired => [
  { key: 'email', label: __('Email', 'bit-integrations'), required: emailRequired },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'state', label: __('State or County', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'zip', label: __('Postcode', 'bit-integrations'), required: false },
  { key: 'address', label: __('Address', 'bit-integrations'), required: false }
]

const dateLabel = label => `${label} ${__('(YYYY-MM-DD)', 'bit-integrations')}`

export const fieldsByAction = {
  create_booking: [
    { key: 'check_in_date', label: dateLabel(__('Check-in Date', 'bit-integrations')), required: true },
    {
      key: 'check_out_date',
      label: dateLabel(__('Check-out Date', 'bit-integrations')),
      required: true
    },
    ...CustomerFields(true),
    { key: 'adults', label: __('Adults', 'bit-integrations'), required: false },
    { key: 'children', label: __('Children', 'bit-integrations'), required: false },
    { key: 'guest_name', label: __('Guest Name', 'bit-integrations'), required: false },
    { key: 'note', label: __('Customer Note', 'bit-integrations'), required: false },
    { key: 'coupon_code', label: __('Coupon Code', 'bit-integrations'), required: false }
  ],
  change_booking_status: BookingIdField,
  update_booking_customer: [...BookingIdField, ...CustomerFields(false)],
  add_booking_note: [
    ...BookingIdField,
    { key: 'note', label: __('Note', 'bit-integrations'), required: true }
  ],
  trash_booking: BookingIdField,
  delete_booking: BookingIdField,
  create_payment: [
    ...BookingIdField,
    { key: 'amount', label: __('Amount', 'bit-integrations'), required: true },
    { key: 'transaction_id', label: __('Transaction ID', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false }
  ],
  change_payment_status: [
    ...PaymentIdField,
    { key: 'note', label: __('Note', 'bit-integrations'), required: false }
  ],
  create_customer: CustomerFields(true),
  update_customer: [...CustomerIdField, ...CustomerFields(false)],
  delete_customer: CustomerIdField,
  create_accommodation_type: [
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'excerpt', label: __('Short Description', 'bit-integrations'), required: false },
    { key: 'adults', label: __('Adults', 'bit-integrations'), required: false },
    { key: 'children', label: __('Children', 'bit-integrations'), required: false },
    { key: 'total_capacity', label: __('Total Capacity', 'bit-integrations'), required: false },
    { key: 'size', label: __('Size', 'bit-integrations'), required: false },
    { key: 'bed_type', label: __('Bed Type', 'bit-integrations'), required: false },
    { key: 'view', label: __('View', 'bit-integrations'), required: false },
    {
      key: 'accommodations_count',
      label: __('Number of Accommodations', 'bit-integrations'),
      required: false
    }
  ],
  create_accommodation: [
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ],
  create_coupon: [
    { key: 'code', label: __('Code', 'bit-integrations'), required: true },
    { key: 'amount', label: __('Amount', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    {
      key: 'expiration_date',
      label: dateLabel(__('Expiration Date', 'bit-integrations')),
      required: false
    },
    {
      key: 'check_in_date_after',
      label: dateLabel(__('Check-in After', 'bit-integrations')),
      required: false
    },
    {
      key: 'check_out_date_before',
      label: dateLabel(__('Check-out Before', 'bit-integrations')),
      required: false
    },
    { key: 'min_nights', label: __('Minimum Nights', 'bit-integrations'), required: false },
    { key: 'max_nights', label: __('Maximum Nights', 'bit-integrations'), required: false },
    {
      key: 'min_days_before_check_in',
      label: __('Minimum Days Before Check-in', 'bit-integrations'),
      required: false
    },
    {
      key: 'max_days_before_check_in',
      label: __('Maximum Days Before Check-in', 'bit-integrations'),
      required: false
    },
    { key: 'usage_limit', label: __('Usage Limit', 'bit-integrations'), required: false }
  ],
  block_dates: [
    { key: 'date_from', label: dateLabel(__('Start Date', 'bit-integrations')), required: true },
    { key: 'date_to', label: dateLabel(__('End Date', 'bit-integrations')), required: true },
    { key: 'comment', label: __('Comment', 'bit-integrations'), required: false }
  ],
  remove_blocked_dates: idField('block_id', __('Blocked Dates ID', 'bit-integrations'))
}

export const BOOKING_STATUS_OPTIONS = [
  { label: __('Confirmed', 'bit-integrations'), value: 'confirmed' },
  { label: __('Pending Admin', 'bit-integrations'), value: 'pending' },
  { label: __('Pending User Confirmation', 'bit-integrations'), value: 'pending-user' },
  { label: __('Pending Payment', 'bit-integrations'), value: 'pending-payment' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' },
  { label: __('Abandoned', 'bit-integrations'), value: 'abandoned' }
]

export const PAYMENT_STATUS_OPTIONS = [
  { label: __('Pending', 'bit-integrations'), value: 'mphb-p-pending' },
  { label: __('On Hold', 'bit-integrations'), value: 'mphb-p-on-hold' },
  { label: __('Completed', 'bit-integrations'), value: 'mphb-p-completed' },
  { label: __('Cancelled', 'bit-integrations'), value: 'mphb-p-cancelled' },
  { label: __('Abandoned', 'bit-integrations'), value: 'mphb-p-abandoned' },
  { label: __('Failed', 'bit-integrations'), value: 'mphb-p-failed' },
  { label: __('Refunded', 'bit-integrations'), value: 'mphb-p-refunded' }
]

export const POST_STATUS_OPTIONS = [
  { label: __('Published', 'bit-integrations'), value: 'publish' },
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Pending Review', 'bit-integrations'), value: 'pending' },
  { label: __('Private', 'bit-integrations'), value: 'private' }
]

export const COUPON_STATUS_OPTIONS = [
  { label: __('Active', 'bit-integrations'), value: 'publish' },
  { label: __('Inactive', 'bit-integrations'), value: 'draft' }
]

export const COUPON_TYPE_OPTIONS = [
  { label: __('Percentage', 'bit-integrations'), value: 'percentage' },
  { label: __('Fixed Amount per Accommodation', 'bit-integrations'), value: 'per_accomm' },
  {
    label: __('Fixed Amount per Accommodation per Day', 'bit-integrations'),
    value: 'per_accomm_per_day'
  }
]

export const STATUS_OPTIONS_BY_ACTION = {
  create_booking: BOOKING_STATUS_OPTIONS,
  change_booking_status: BOOKING_STATUS_OPTIONS,
  create_payment: PAYMENT_STATUS_OPTIONS,
  change_payment_status: PAYMENT_STATUS_OPTIONS,
  create_accommodation_type: POST_STATUS_OPTIONS,
  create_accommodation: POST_STATUS_OPTIONS,
  create_coupon: COUPON_STATUS_OPTIONS
}

export const requiredStatusActions = ['change_booking_status', 'change_payment_status']

export const accommodationTypeActions = ['create_booking', 'create_accommodation', 'block_dates']

export const requiredAccommodationTypeActions = ['create_booking', 'create_accommodation']

export const accommodationActions = ['create_booking', 'block_dates']

export const countryActions = [
  'create_booking',
  'update_booking_customer',
  'create_customer',
  'update_customer'
]

export const UTILITIES_BY_ACTION = {
  create_customer: [
    {
      key: 'create_account',
      title: __('Create WordPress Account', 'bit-integrations'),
      subTitle: __('Create a WordPress user account and email the login details', 'bit-integrations')
    }
  ],
  block_dates: [
    {
      key: 'not_check_in',
      title: __('Block Check-in Only', 'bit-integrations'),
      subTitle: __('Block only check-in on these dates', 'bit-integrations')
    },
    {
      key: 'not_check_out',
      title: __('Block Check-out Only', 'bit-integrations'),
      subTitle: __('Block only check-out on these dates', 'bit-integrations')
    },
    {
      key: 'not_stay_in',
      title: __('Block Stay-in', 'bit-integrations'),
      subTitle: __('Block stays on these dates', 'bit-integrations')
    }
  ]
}

export const actionNotes = {
  create_booking: __(
    'Leave Accommodation and Rate empty to use the first free accommodation and the first available rate. Leave Status empty to create a confirmed booking.',
    'bit-integrations'
  ),
  update_booking_customer: __(
    'Fields that you do not map keep their current value. A new email moves the booking to the customer with that email.',
    'bit-integrations'
  ),
  add_booking_note: __(
    'Leave Author empty to add the note as the current user or the first administrator.',
    'bit-integrations'
  ),
  create_payment: __(
    'Leave Status and Payment Gateway empty to create a pending manual payment.',
    'bit-integrations'
  ),
  create_customer: __(
    'With Create WordPress Account on, a WordPress user with the same email is linked to the customer.',
    'bit-integrations'
  ),
  update_customer: __('Fields that you do not map keep their current value.', 'bit-integrations'),
  create_accommodation_type: __(
    'Map Number of Accommodations to create accommodations of the new type.',
    'bit-integrations'
  ),
  create_coupon: __(
    'Leave Discount Type empty to use a percentage discount. Leave Accommodation Types empty to use the coupon for all types.',
    'bit-integrations'
  ),
  block_dates: __(
    'Leave Accommodation Type and Accommodation empty to block all accommodations.',
    'bit-integrations'
  )
}
