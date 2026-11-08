import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_appointment', label: __('Create Appointment', 'bit-integrations'), is_pro: true },
  { name: 'update_appointment', label: __('Update Appointment', 'bit-integrations'), is_pro: true },
  {
    name: 'change_appointment_status',
    label: __('Change Appointment Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'cancel_appointment', label: __('Cancel Appointment', 'bit-integrations'), is_pro: true },
  { name: 'delete_appointment', label: __('Delete Appointment', 'bit-integrations'), is_pro: true },
  { name: 'create_customer', label: __('Create Customer', 'bit-integrations'), is_pro: true },
  { name: 'update_customer', label: __('Update Customer', 'bit-integrations'), is_pro: true },
  { name: 'delete_customer', label: __('Delete Customer', 'bit-integrations'), is_pro: true },
  { name: 'create_service', label: __('Create Service', 'bit-integrations'), is_pro: true },
  { name: 'update_service', label: __('Update Service', 'bit-integrations'), is_pro: true },
  { name: 'delete_service', label: __('Delete Service', 'bit-integrations'), is_pro: true },
  { name: 'create_location', label: __('Create Location', 'bit-integrations'), is_pro: true },
  { name: 'update_location', label: __('Update Location', 'bit-integrations'), is_pro: true },
  { name: 'delete_location', label: __('Delete Location', 'bit-integrations'), is_pro: true },
  { name: 'create_employee', label: __('Create Employee', 'bit-integrations'), is_pro: true },
  { name: 'update_employee', label: __('Update Employee', 'bit-integrations'), is_pro: true },
  { name: 'delete_employee', label: __('Delete Employee', 'bit-integrations'), is_pro: true },
  { name: 'create_connection', label: __('Create Connection', 'bit-integrations'), is_pro: true },
  { name: 'update_connection', label: __('Update Connection', 'bit-integrations'), is_pro: true },
  { name: 'delete_connection', label: __('Delete Connection', 'bit-integrations'), is_pro: true }
]

const idField = (key, label) => [{ key, label, required: true }]

const AppointmentIdField = idField('appointment_id', __('Appointment ID', 'bit-integrations'))
const CustomerIdField = idField('customer_id', __('Customer ID', 'bit-integrations'))
const ServiceIdField = idField('service_id', __('Service ID', 'bit-integrations'))
const LocationIdField = idField('location_id', __('Location ID', 'bit-integrations'))
const EmployeeIdField = idField('employee_id', __('Employee ID', 'bit-integrations'))
const ConnectionIdField = idField('connection_id', __('Connection ID', 'bit-integrations'))

const AppointmentFields = required => [
  { key: 'date', label: __('Date (YYYY-MM-DD)', 'bit-integrations'), required },
  { key: 'start_time', label: __('Start Time (HH:MM)', 'bit-integrations'), required },
  { key: 'name', label: __('Customer Name', 'bit-integrations'), required: false },
  { key: 'email', label: __('Customer Email', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Customer Phone', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'price', label: __('Price', 'bit-integrations'), required: false }
]

const CustomerFields = required => [
  { key: 'name', label: __('Name', 'bit-integrations'), required },
  { key: 'email', label: __('Email', 'bit-integrations'), required },
  { key: 'mobile', label: __('Mobile', 'bit-integrations'), required: false },
  { key: 'address', label: __('Address', 'bit-integrations'), required: false },
  { key: 'dob', label: __('Date of Birth (YYYY-MM-DD)', 'bit-integrations'), required: false }
]

const ServiceFields = required => [
  { key: 'name', label: __('Name', 'bit-integrations'), required },
  { key: 'duration', label: __('Duration (minutes)', 'bit-integrations'), required },
  { key: 'price', label: __('Price', 'bit-integrations'), required },
  { key: 'slot_step', label: __('Slot Step (minutes)', 'bit-integrations'), required: false },
  { key: 'block_before', label: __('Block Before (minutes)', 'bit-integrations'), required: false },
  { key: 'block_after', label: __('Block After (minutes)', 'bit-integrations'), required: false },
  { key: 'daily_limit', label: __('Daily Limit', 'bit-integrations'), required: false },
  {
    key: 'advance_booking_days',
    label: __('Advance Booking Days', 'bit-integrations'),
    required: false
  },
  { key: 'color', label: __('Color (hex, for example #0693E3)', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

const LocationFields = required => [
  { key: 'name', label: __('Name', 'bit-integrations'), required },
  { key: 'address', label: __('Address', 'bit-integrations'), required },
  { key: 'location_details', label: __('Location', 'bit-integrations'), required },
  {
    key: 'coordinates',
    label: __('Coordinates (latitude,longitude)', 'bit-integrations'),
    required: false
  }
]

const EmployeeFields = required => [
  { key: 'name', label: __('Name', 'bit-integrations'), required },
  { key: 'email', label: __('Email', 'bit-integrations'), required },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

const ConnectionFields = required => [
  { key: 'time_from', label: __('Start Time (HH:MM)', 'bit-integrations'), required },
  { key: 'time_to', label: __('End Time (HH:MM)', 'bit-integrations'), required },
  { key: 'date_from', label: __('Start Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
  { key: 'date_to', label: __('End Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
  { key: 'slot_count', label: __('Number of Slots', 'bit-integrations'), required: false }
]

export const fieldsByAction = {
  create_appointment: AppointmentFields(true),
  update_appointment: [...AppointmentIdField, ...AppointmentFields(false)],
  change_appointment_status: AppointmentIdField,
  cancel_appointment: AppointmentIdField,
  delete_appointment: AppointmentIdField,
  create_customer: CustomerFields(true),
  update_customer: [...CustomerIdField, ...CustomerFields(false)],
  delete_customer: CustomerIdField,
  create_service: ServiceFields(true),
  update_service: [...ServiceIdField, ...ServiceFields(false)],
  delete_service: ServiceIdField,
  create_location: LocationFields(true),
  update_location: [...LocationIdField, ...LocationFields(false)],
  delete_location: LocationIdField,
  create_employee: EmployeeFields(true),
  update_employee: [...EmployeeIdField, ...EmployeeFields(false)],
  delete_employee: EmployeeIdField,
  create_connection: ConnectionFields(true),
  update_connection: [...ConnectionIdField, ...ConnectionFields(false)],
  delete_connection: ConnectionIdField
}

export const DAY_OPTIONS = [
  { label: __('Monday', 'bit-integrations'), value: 'Monday' },
  { label: __('Tuesday', 'bit-integrations'), value: 'Tuesday' },
  { label: __('Wednesday', 'bit-integrations'), value: 'Wednesday' },
  { label: __('Thursday', 'bit-integrations'), value: 'Thursday' },
  { label: __('Friday', 'bit-integrations'), value: 'Friday' },
  { label: __('Saturday', 'bit-integrations'), value: 'Saturday' },
  { label: __('Sunday', 'bit-integrations'), value: 'Sunday' }
]

export const REPEAT_OPTIONS = [
  { label: __('Weekly', 'bit-integrations'), value: '0' },
  { label: __('Every Second Week', 'bit-integrations'), value: '2' },
  { label: __('Tomorrow Only', 'bit-integrations'), value: '-1' }
]

export const WORKING_OPTIONS = [
  { label: __('Yes', 'bit-integrations'), value: '1' },
  { label: __('No', 'bit-integrations'), value: '0' }
]

export const scheduleActions = [
  'create_appointment',
  'update_appointment',
  'create_connection',
  'update_connection'
]

export const requiredScheduleActions = ['create_appointment', 'create_connection']

export const appointmentFormActions = ['create_appointment', 'update_appointment']

export const statusActions = [...appointmentFormActions, 'change_appointment_status']

export const userActions = [...appointmentFormActions, 'create_customer', 'update_customer']

export const connectionActions = ['create_connection', 'update_connection']

export const hasUtilities = [
  ...appointmentFormActions,
  'change_appointment_status',
  'cancel_appointment'
]

export const actionNotes = {
  create_appointment: __(
    'The action checks the employee working hours and free slots, as the booking form does. Easy Appointments actions do not start Easy Appointments triggers.',
    'bit-integrations'
  ),
  change_appointment_status: __(
    'Easy Appointments actions do not start Easy Appointments triggers.',
    'bit-integrations'
  ),
  cancel_appointment: __(
    'Easy Appointments actions do not start Easy Appointments triggers.',
    'bit-integrations'
  ),
  update_appointment: __(
    'Fields that you do not map and options that you do not select keep their current value.',
    'bit-integrations'
  ),
  create_customer: __(
    'Easy Appointments links new appointments to the customer with the same email.',
    'bit-integrations'
  ),
  update_customer: __('Fields that you do not map keep their current value.', 'bit-integrations'),
  update_service: __('Fields that you do not map keep their current value.', 'bit-integrations'),
  update_location: __('Fields that you do not map keep their current value.', 'bit-integrations'),
  update_employee: __('Fields that you do not map keep their current value.', 'bit-integrations'),
  create_connection: __(
    'A connection sets the working hours of an employee for a service at a location. Select No in Is Working to block these hours, for example for a break. The default is Weekly and Yes.',
    'bit-integrations'
  ),
  update_connection: __(
    'Fields that you do not map and options that you do not select keep their current value. Select No in Is Working to block these hours, for example for a break.',
    'bit-integrations'
  )
}
