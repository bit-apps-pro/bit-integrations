import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_booking', label: __('Create Booking', 'bit-integrations'), is_pro: true },
  { name: 'update_booking', label: __('Update Booking', 'bit-integrations'), is_pro: true }
]

const CommonBookingFields = [
  { key: 'dates', label: __('Booking Dates', 'bit-integrations'), required: true },
  { key: 'name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'secondname', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'details', label: __('Details', 'bit-integrations'), required: false },
  { key: 'rangetime', label: __('Range Time', 'bit-integrations'), required: false },
  {
    key: 'booking_data_json',
    label: __('Additional Booking Data JSON', 'bit-integrations'),
    required: false
  },
  { key: 'is_send_emails', label: __('Send Emails (1 or 0)', 'bit-integrations'), required: false },
  { key: 'booking_form_type', label: __('Booking Form Type', 'bit-integrations'), required: false },
  { key: 'locale', label: __('Locale', 'bit-integrations'), required: false },
  {
    key: 'is_show_payment_form',
    label: __('Show Payment Form (1 or 0)', 'bit-integrations'),
    required: false
  },
  {
    key: 'is_approve_booking',
    label: __('Approve Booking (1 or 0)', 'bit-integrations'),
    required: false
  },
  {
    key: 'save_booking_even_if_unavailable',
    label: __('Save if Unavailable (1 or 0)', 'bit-integrations'),
    required: false
  },
  {
    key: 'is_use_booking_recurrent_time',
    label: __('Use Recurrent Time (1 or 0)', 'bit-integrations'),
    required: false
  }
]

export const BookingCalendarStaticData = {
  create_booking: CommonBookingFields,
  update_booking: CommonBookingFields
}
