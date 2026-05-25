import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'cancel_appointment', label: __('Cancel Appointment', 'bit-integrations'), is_pro: true },
  { name: 'update_appointment_status', label: __('Update Appointment Status', 'bit-integrations'), is_pro: true },
  { name: 'create_customer', label: __('Create Customer', 'bit-integrations'), is_pro: true },
  { name: 'update_customer', label: __('Update Customer', 'bit-integrations'), is_pro: true },
  { name: 'delete_appointment', label: __('Delete Appointment', 'bit-integrations'), is_pro: true },
  { name: 'delete_customer', label: __('Delete Customer', 'bit-integrations'), is_pro: true },
]

export const appointmentIdField = [
  { key: 'appointment_id', label: __('Appointment ID', 'bit-integrations'), required: true },
]

export const updateAppointmentStatusFields = [
  { key: 'appointment_id', label: __('Appointment ID', 'bit-integrations'), required: true },
  { key: 'status', label: __('Status', 'bit-integrations'), required: true },
]

export const createCustomerFields = [
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
  { key: 'email', label: __('Email', 'bit-integrations'), required: true },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
]

export const updateCustomerFields = [
  { key: 'customer_id', label: __('Customer ID', 'bit-integrations'), required: true },
  { key: 'bookingpress_user_firstname', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'bookingpress_user_lastname', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'bookingpress_user_email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'bookingpress_user_phone', label: __('Phone', 'bit-integrations'), required: false },
]

export const deleteCustomerFields = [
  { key: 'customer_id', label: __('Customer ID', 'bit-integrations'), required: true },
]
