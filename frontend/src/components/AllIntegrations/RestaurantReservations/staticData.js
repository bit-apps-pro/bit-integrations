import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_booking', label: __('Create Booking', 'bit-integrations'), is_pro: true },
  { name: 'update_booking', label: __('Update Booking', 'bit-integrations'), is_pro: true },
  {
    name: 'change_booking_status',
    label: __('Change Booking Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'assign_tables', label: __('Assign Tables', 'bit-integrations'), is_pro: true },
  { name: 'trash_booking', label: __('Trash Booking', 'bit-integrations'), is_pro: true },
  { name: 'restore_booking', label: __('Restore Booking', 'bit-integrations'), is_pro: true },
  { name: 'delete_booking', label: __('Delete Booking', 'bit-integrations'), is_pro: true },
  {
    name: 'delete_bookings_by_email',
    label: __('Delete Bookings by Email', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'send_email_to_customer',
    label: __('Send Email to Customer', 'bit-integrations'),
    is_pro: true
  },
  { name: 'ban_email', label: __('Ban Email', 'bit-integrations'), is_pro: true },
  { name: 'ban_ip_address', label: __('Ban IP Address', 'bit-integrations'), is_pro: true }
]

const BookingIdField = [
  { key: 'booking_id', label: __('Booking ID', 'bit-integrations'), required: true }
]

const BookingDetailFields = required => [
  { key: 'name', label: __('Name', 'bit-integrations'), required },
  { key: 'email', label: __('Email', 'bit-integrations'), required },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'party', label: __('Party Size', 'bit-integrations'), required },
  { key: 'date', label: __('Date (YYYY-MM-DD)', 'bit-integrations'), required },
  { key: 'time', label: __('Time (HH:MM)', 'bit-integrations'), required },
  { key: 'message', label: __('Message', 'bit-integrations'), required: false }
]

const EmailField = [{ key: 'email', label: __('Email', 'bit-integrations'), required: true }]

export const fieldsByAction = {
  create_booking: BookingDetailFields(true),
  update_booking: [...BookingIdField, ...BookingDetailFields(false)],
  change_booking_status: BookingIdField,
  assign_tables: BookingIdField,
  trash_booking: BookingIdField,
  restore_booking: BookingIdField,
  delete_booking: BookingIdField,
  delete_bookings_by_email: EmailField,
  send_email_to_customer: [
    ...BookingIdField,
    { key: 'message', label: __('Message', 'bit-integrations'), required: true },
    { key: 'subject', label: __('Subject', 'bit-integrations'), required: false }
  ],
  ban_email: EmailField,
  ban_ip_address: [{ key: 'ip', label: __('IP Address', 'bit-integrations'), required: true }]
}

export const needsStatus = ['change_booking_status']

export const needsTables = ['assign_tables']

export const hasBookingOptions = ['create_booking', 'update_booking']

export const hasUtilities = [
  'create_booking',
  'update_booking',
  'change_booking_status',
  'delete_bookings_by_email'
]

export const actionNotes = {
  create_booking: __(
    'The plugin checks capacity, tables and duplicate bookings. Opening hours do not apply to this action.',
    'bit-integrations'
  ),
  update_booking: __('Fields that you do not map keep their current value.', 'bit-integrations'),
  send_email_to_customer: __(
    'You can use the plugin template tags in the message, for example {user_name}.',
    'bit-integrations'
  ),
  ban_email: __('The plugin blocks new bookings from this email.', 'bit-integrations'),
  ban_ip_address: __('The plugin blocks new bookings from this IP address.', 'bit-integrations')
}
