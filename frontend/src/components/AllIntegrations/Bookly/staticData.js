import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_appointment', label: __('Create Appointment', 'bit-integrations'), is_pro: true },
  { name: 'update_appointment_status', label: __('Update Appointment Status', 'bit-integrations'), is_pro: true },
  { name: 'delete_appointment', label: __('Delete Appointment', 'bit-integrations'), is_pro: true },
  { name: 'create_customer', label: __('Create Customer', 'bit-integrations'), is_pro: true },
  { name: 'update_customer', label: __('Update Customer', 'bit-integrations'), is_pro: true },
  { name: 'delete_customer', label: __('Delete Customer', 'bit-integrations'), is_pro: true },
]


export const CreateAppointmentFields = [
  { key: 'customer_email', label: __('Customer Email', 'bit-integrations'), required: true },
  { key: 'start_date', label: __('Start Date', 'bit-integrations'), required: true },
  { key: 'end_date', label: __('End Date', 'bit-integrations'), required: true },
  { key: 'number_of_persons', label: __('Number of Persons', 'bit-integrations'), required: false },
  { key: 'internal_note', label: __('Internal Note', 'bit-integrations'), required: false },
  { key: 'notes', label: __('Notes', 'bit-integrations'), required: false },
]

export const UpdateAppointmentStatusFields = [
  { key: 'customer_appointment_id', label: __('Customer Appointment ID', 'bit-integrations'), required: true },
]

export const DeleteAppointmentFields = [
  { key: 'customer_appointment_id', label: __('Customer Appointment ID', 'bit-integrations'), required: true },
]

export const CreateCustomerFields = [
  { key: 'full_name', label: __('Full Name', 'bit-integrations'), required: true },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'wp_user_id', label: __('WordPress User ID', 'bit-integrations'), required: false },
]

export const UpdateCustomerFields = [
  { key: 'customer_email', label: __('Customer Email', 'bit-integrations'), required: true },
  { key: 'full_name', label: __('Full Name', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'wp_user_id', label: __('WordPress User ID', 'bit-integrations'), required: false },
]

export const DeleteCustomerFields = [
  { key: 'customer_email', label: __('Customer Email', 'bit-integrations'), required: true },
]
