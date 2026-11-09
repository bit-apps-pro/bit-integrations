import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_booking', label: __('Create Booking', 'bit-integrations'), is_pro: true },
  { name: 'update_booking', label: __('Update Booking', 'bit-integrations'), is_pro: true },
  {
    name: 'change_booking_status',
    label: __('Change Booking Status', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'send_booking_summary',
    label: __('Send Booking Summary Email', 'bit-integrations'),
    is_pro: true
  },
  { name: 'trash_booking', label: __('Move Booking to Trash', 'bit-integrations'), is_pro: true },
  { name: 'restore_booking', label: __('Restore Booking', 'bit-integrations'), is_pro: true },
  { name: 'delete_booking', label: __('Delete Booking', 'bit-integrations'), is_pro: true },
  {
    name: 'set_attendance_result',
    label: __('Set Attendance Result', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_customer', label: __('Create Customer', 'bit-integrations'), is_pro: true },
  { name: 'update_customer', label: __('Update Customer', 'bit-integrations'), is_pro: true },
  { name: 'delete_customer', label: __('Delete Customer', 'bit-integrations'), is_pro: true },
  { name: 'create_service', label: __('Create Service', 'bit-integrations'), is_pro: true },
  { name: 'update_service', label: __('Update Service', 'bit-integrations'), is_pro: true },
  { name: 'trash_service', label: __('Move Service to Trash', 'bit-integrations'), is_pro: true },
  {
    name: 'create_service_category',
    label: __('Create Service Category', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_assistant', label: __('Create Assistant', 'bit-integrations'), is_pro: true },
  { name: 'update_assistant', label: __('Update Assistant', 'bit-integrations'), is_pro: true },
  { name: 'trash_assistant', label: __('Move Assistant to Trash', 'bit-integrations'), is_pro: true }
]

const idField = (key, label) => [{ key, label, required: true }]

const BookingIdField = idField('booking_id', __('Booking ID', 'bit-integrations'))
const CustomerIdField = idField('customer_id', __('Customer (user ID or email)', 'bit-integrations'))
const ServiceIdField = idField('service_id', __('Service ID', 'bit-integrations'))
const AssistantIdField = idField('assistant_id', __('Assistant ID', 'bit-integrations'))

const ContactFields = [
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  {
    key: 'phone_prefix',
    label: __('Phone Prefix (for example +1)', 'bit-integrations'),
    required: false
  },
  { key: 'address', label: __('Address', 'bit-integrations'), required: false }
]

const BookingFields = required => [
  { key: 'date', label: __('Date (YYYY-MM-DD)', 'bit-integrations'), required },
  { key: 'time', label: __('Time (HH:MM, 24-hour)', 'bit-integrations'), required },
  {
    key: 'customer_id',
    label: __('Customer (user ID or email)', 'bit-integrations'),
    required: false
  },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  ...ContactFields,
  { key: 'note', label: __('Customer Note', 'bit-integrations'), required: false },
  { key: 'admin_note', label: __('Admin Note', 'bit-integrations'), required: false }
]

const CustomerFields = required => [
  { key: 'email', label: __('Email', 'bit-integrations'), required },
  ...ContactFields,
  { key: 'note', label: __('Personal Note', 'bit-integrations'), required: false }
]

const ServiceFields = required => [
  { key: 'name', label: __('Name', 'bit-integrations'), required },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'price', label: __('Price', 'bit-integrations'), required: false },
  { key: 'duration', label: __('Duration (HH:MM)', 'bit-integrations'), required: false },
  { key: 'unit', label: __('Units per Session', 'bit-integrations'), required: false }
]

const AssistantFields = required => [
  { key: 'name', label: __('Name', 'bit-integrations'), required },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  {
    key: 'phone_prefix',
    label: __('Phone Prefix (for example +1)', 'bit-integrations'),
    required: false
  }
]

export const fieldsByAction = {
  create_booking: BookingFields(true),
  update_booking: [...BookingIdField, ...BookingFields(false)],
  change_booking_status: BookingIdField,
  send_booking_summary: BookingIdField,
  trash_booking: BookingIdField,
  restore_booking: BookingIdField,
  delete_booking: BookingIdField,
  set_attendance_result: [
    ...BookingIdField,
    {
      key: 'delivered_fraction',
      label: __('Delivered Part (0.1 to 0.9)', 'bit-integrations'),
      required: false
    },
    { key: 'collected_amount', label: __('Collected Amount', 'bit-integrations'), required: false },
    { key: 'waive_reason', label: __('Waive Reason', 'bit-integrations'), required: false }
  ],
  create_customer: CustomerFields(true),
  update_customer: [...CustomerIdField, ...CustomerFields(false)],
  delete_customer: CustomerIdField,
  create_service: ServiceFields(true),
  update_service: [...ServiceIdField, ...ServiceFields(false)],
  trash_service: ServiceIdField,
  create_service_category: [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ],
  create_assistant: AssistantFields(true),
  update_assistant: [...AssistantIdField, ...AssistantFields(false)],
  trash_assistant: AssistantIdField
}

export const RECIPIENT_OPTIONS = [
  { label: __('Customer and Admin', 'bit-integrations'), value: 'all' },
  { label: __('Customer', 'bit-integrations'), value: 'customer' },
  { label: __('Admin', 'bit-integrations'), value: 'admin' }
]

export const ATTENDANCE_OPTIONS = [
  { label: __('Attended', 'bit-integrations'), value: 'attended' },
  { label: __('Partial show', 'bit-integrations'), value: 'partial_show' },
  { label: __('No-show', 'bit-integrations'), value: 'no_show' },
  { label: __('Late cancellation', 'bit-integrations'), value: 'late_cancel' },
  { label: __('Excused', 'bit-integrations'), value: 'excused' }
]

export const YES_NO_OPTIONS = [
  { label: __('Yes', 'bit-integrations'), value: 'yes' },
  { label: __('No', 'bit-integrations'), value: 'no' }
]

export const SERVICE_FLAGS = [
  {
    key: 'no_assistant_needed',
    confKey: 'selectedNoAssistantNeeded',
    label: __('No Assistant Needed', 'bit-integrations'),
    subTitle: __('Customers book this service without an assistant', 'bit-integrations')
  },
  {
    key: 'exclusive',
    confKey: 'selectedExclusive',
    label: __('Exclusive', 'bit-integrations'),
    subTitle: __('Customers cannot book other services in the same booking', 'bit-integrations')
  },
  {
    key: 'secondary',
    confKey: 'selectedSecondary',
    label: __('Secondary', 'bit-integrations'),
    subTitle: __('Customers can book this service only with a main service', 'bit-integrations')
  },
  {
    key: 'hide_on_frontend',
    confKey: 'selectedHideOnFrontend',
    label: __('Hide on Front End', 'bit-integrations'),
    subTitle: __('Do not show this service on the booking form', 'bit-integrations')
  }
]

export const bookingFormActions = ['create_booking', 'update_booking']

export const servicesActions = [...bookingFormActions, 'create_assistant', 'update_assistant']

export const statusActions = [...bookingFormActions, 'change_booking_status']

export const categoryActions = ['create_service', 'update_service']

export const hasUtilities = [...statusActions, 'create_customer', 'delete_customer', 'create_service']

export const actionNotes = {
  create_booking: __(
    'When the salon uses assistants, select an assistant to use Check Availability.',
    'bit-integrations'
  ),
  update_booking: __(
    'Fields that you do not map and options that you do not select keep their current value. Selected services replace the current services.',
    'bit-integrations'
  ),
  set_attendance_result: __(
    'Only confirmed bookings that already ended can get a result. Use Excused for other bookings. Map Delivered Part only for Partial show.',
    'bit-integrations'
  ),
  create_customer: __('The email is also the login name of the customer account.', 'bit-integrations'),
  update_customer: __('Fields that you do not map keep their current value.', 'bit-integrations'),
  delete_customer: __(
    'The bookings of the customer stay in the salon. Turn on Delete Bookings to delete them too.',
    'bit-integrations'
  ),
  update_service: __(
    'Fields that you do not map and options that you do not select keep their current value. Selected categories replace the current categories.',
    'bit-integrations'
  ),
  update_assistant: __(
    'Fields that you do not map and options that you do not select keep their current value. Selected services replace the current services.',
    'bit-integrations'
  )
}
