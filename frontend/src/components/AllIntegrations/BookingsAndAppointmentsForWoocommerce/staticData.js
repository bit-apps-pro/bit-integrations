import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_booking', label: __('Create Booking', 'bit-integrations'), is_pro: true },
  {
    name: 'update_booking_status',
    label: __('Update Booking Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'confirm_booking', label: __('Confirm Booking', 'bit-integrations'), is_pro: true },
  { name: 'cancel_booking', label: __('Cancel Booking', 'bit-integrations'), is_pro: true },
  { name: 'delete_booking', label: __('Delete Booking', 'bit-integrations'), is_pro: true },
  { name: 'reschedule_booking', label: __('Reschedule Booking', 'bit-integrations'), is_pro: true },
  { name: 'update_booking_notes', label: __('Update Booking Notes', 'bit-integrations'), is_pro: true },
  { name: 'update_booking_asset', label: __('Update Booking Asset', 'bit-integrations'), is_pro: true },
  {
    name: 'update_booking_participants',
    label: __('Update Booking Participants', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'send_booking_confirmation_email',
    label: __('Send Booking Confirmation Email', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'send_booking_cancelled_email',
    label: __('Send Booking Cancelled Email', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'send_booking_requires_confirmation_email',
    label: __('Send Booking Requires-Confirmation Email', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'send_booking_updated_email',
    label: __('Send Booking Updated Email', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'send_booking_payment_email',
    label: __('Send Booking Payment Email', 'bit-integrations'),
    is_pro: true
  }
]

export const CreateBookingFields = [
  { key: 'from', label: __('From (Date/Time)', 'bit-integrations'), required: true },
  { key: 'to', label: __('To (Date/Time)', 'bit-integrations'), required: true },
  { key: 'number_of_persons', label: __('Number of Persons', 'bit-integrations'), required: false }
]

export const BookingIdField = [
  { key: 'item_id', label: __('Booking ID', 'bit-integrations'), required: true }
]

export const BookingStatusFields = [
  { key: 'item_id', label: __('Booking ID', 'bit-integrations'), required: true }
]

export const RescheduleBookingFields = [
  { key: 'item_id', label: __('Booking ID', 'bit-integrations'), required: true },
  { key: 'from', label: __('New From (Date/Time)', 'bit-integrations'), required: true },
  { key: 'to', label: __('New To (Date/Time)', 'bit-integrations'), required: true }
]

export const BookingNotesFields = [
  { key: 'item_id', label: __('Booking ID', 'bit-integrations'), required: true },
  { key: 'notes', label: __('Notes', 'bit-integrations'), required: true }
]

export const BookingAssetFields = [
  { key: 'item_id', label: __('Booking ID', 'bit-integrations'), required: true }
]

export const BookingParticipantsFields = [
  { key: 'item_id', label: __('Booking ID', 'bit-integrations'), required: true },
  {
    key: 'participants',
    label: __('Participants (label:count, label:count)', 'bit-integrations'),
    required: true
  }
]

export const BookingUpdatedEmailFields = [
  { key: 'item_id', label: __('Booking ID', 'bit-integrations'), required: true }
]

export const BookingPaymentEmailFields = [
  { key: 'item_id', label: __('Booking ID', 'bit-integrations'), required: true },
  { key: 'to_email', label: __('Send To (Email)', 'bit-integrations'), required: false },
  { key: 'status', label: __('Payment Status', 'bit-integrations'), required: false }
]

// Fixed option sets — never mapped, rendered as selects.
export const statusOptions = [
  { label: __('Paid', 'bit-integrations'), value: 'paid' },
  { label: __('Un-paid', 'bit-integrations'), value: 'un-paid' },
  { label: __('Confirmed', 'bit-integrations'), value: 'confirmed' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' },
  { label: __('Deleted', 'bit-integrations'), value: 'deleted' }
]

export const notifyModeOptions = [
  { label: __('Details and Payment', 'bit-integrations'), value: 'details_and_payment' },
  { label: __('Details Only', 'bit-integrations'), value: 'details_only' }
]

// Which actions render which select.
export const needsProduct = ['create_booking']
export const needsCustomer = ['create_booking']
export const needsAsset = ['create_booking', 'update_booking_asset']
export const needsStatus = ['update_booking_status']
export const needsNotifyMode = ['send_booking_updated_email']
