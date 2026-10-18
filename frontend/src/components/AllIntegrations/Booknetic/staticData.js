import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_appointment', label: __('Create Appointment', 'bit-integrations'), is_pro: true },
  { name: 'update_appointment', label: __('Update Appointment', 'bit-integrations'), is_pro: true },
  { name: 'delete_appointment', label: __('Delete Appointment', 'bit-integrations'), is_pro: true },
  {
    name: 'reschedule_appointment',
    label: __('Reschedule Appointment', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'change_appointment_status',
    label: __('Change Appointment Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'update_payment', label: __('Update Payment', 'bit-integrations'), is_pro: true },
  { name: 'complete_payment', label: __('Complete Payment', 'bit-integrations'), is_pro: true },
  { name: 'create_customer', label: __('Create Customer', 'bit-integrations'), is_pro: true },
  { name: 'update_customer', label: __('Update Customer', 'bit-integrations'), is_pro: true },
  { name: 'delete_customer', label: __('Delete Customer', 'bit-integrations'), is_pro: true },
  {
    name: 'assign_customer_category',
    label: __('Assign Customer Category', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_staff', label: __('Create Staff', 'bit-integrations'), is_pro: true },
  { name: 'update_staff', label: __('Update Staff', 'bit-integrations'), is_pro: true },
  { name: 'delete_staff', label: __('Delete Staff', 'bit-integrations'), is_pro: true },
  { name: 'duplicate_staff', label: __('Duplicate Staff', 'bit-integrations'), is_pro: true },
  { name: 'set_staff_status', label: __('Set Staff Status', 'bit-integrations'), is_pro: true },
  { name: 'create_location', label: __('Create Location', 'bit-integrations'), is_pro: true },
  { name: 'update_location', label: __('Update Location', 'bit-integrations'), is_pro: true },
  { name: 'delete_location', label: __('Delete Location', 'bit-integrations'), is_pro: true },
  { name: 'duplicate_location', label: __('Duplicate Location', 'bit-integrations'), is_pro: true },
  { name: 'set_location_status', label: __('Set Location Status', 'bit-integrations'), is_pro: true },
  { name: 'create_service', label: __('Create Service', 'bit-integrations'), is_pro: true },
  { name: 'update_service', label: __('Update Service', 'bit-integrations'), is_pro: true },
  { name: 'delete_service', label: __('Delete Service', 'bit-integrations'), is_pro: true },
  { name: 'duplicate_service', label: __('Duplicate Service', 'bit-integrations'), is_pro: true },
  { name: 'set_service_status', label: __('Set Service Status', 'bit-integrations'), is_pro: true },
  {
    name: 'create_service_extra',
    label: __('Create Service Extra', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_service_extra',
    label: __('Update Service Extra', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_service_extra',
    label: __('Delete Service Extra', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'duplicate_service_extra',
    label: __('Duplicate Service Extra', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_customer_category',
    label: __('Create Customer Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_customer_category',
    label: __('Update Customer Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_customer_category',
    label: __('Delete Customer Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_location_category',
    label: __('Create Location Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_location_category',
    label: __('Update Location Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_location_category',
    label: __('Delete Location Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_service_category',
    label: __('Create Service Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_service_category',
    label: __('Update Service Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_service_category',
    label: __('Delete Service Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_in_app_notification',
    label: __('Create In-App Notification', 'bit-integrations'),
    is_pro: true
  }
]

const field = (key, label, required = false) => ({ key, label, required })

const appointmentId = field('appointment_id', __('Appointment ID', 'bit-integrations'), true)
const customerId = field('customer_id', __('Customer ID', 'bit-integrations'), true)
const staffId = field('staff_id', __('Staff ID', 'bit-integrations'), true)
const locationId = field('location_id', __('Location ID', 'bit-integrations'), true)
const serviceId = field('service_id', __('Service ID', 'bit-integrations'), true)
const serviceExtraId = field('service_extra_id', __('Service Extra ID', 'bit-integrations'), true)

const customerFields = required => [
  field('first_name', __('First Name', 'bit-integrations'), required),
  field('last_name', __('Last Name', 'bit-integrations'), required),
  field('email', __('Email', 'bit-integrations'), required),
  field('phone_number', __('Phone Number', 'bit-integrations')),
  field('birthdate', __('Birth Date (YYYY-MM-DD)', 'bit-integrations')),
  field('notes', __('Notes', 'bit-integrations'))
]

const staffFields = required => [
  field('name', __('Name', 'bit-integrations'), required),
  field('email', __('Email', 'bit-integrations'), required),
  field('phone_number', __('Phone Number', 'bit-integrations')),
  field('profession', __('Profession', 'bit-integrations')),
  field('about', __('About', 'bit-integrations'))
]

const locationFields = required => [
  field('name', __('Name', 'bit-integrations'), required),
  field('address', __('Address', 'bit-integrations')),
  field('phone_number', __('Phone Number', 'bit-integrations')),
  field('latitude', __('Latitude', 'bit-integrations')),
  field('longitude', __('Longitude', 'bit-integrations')),
  field('address_components', __('Address Components', 'bit-integrations')),
  field('notes', __('Notes', 'bit-integrations'))
]

const serviceFields = required => [
  field('name', __('Name', 'bit-integrations'), required),
  field('price', __('Price', 'bit-integrations'), required),
  field('duration', __('Duration in Minutes', 'bit-integrations'), required),
  field('timeslot_length', __('Timeslot Length in Minutes', 'bit-integrations')),
  field('buffer_before', __('Buffer Before in Minutes', 'bit-integrations')),
  field('buffer_after', __('Buffer After in Minutes', 'bit-integrations')),
  field('max_capacity', __('Maximum Capacity', 'bit-integrations')),
  field('color', __('Color', 'bit-integrations')),
  field('deposit', __('Deposit', 'bit-integrations')),
  field('notes', __('Notes', 'bit-integrations'))
]

const serviceExtraFields = required => [
  field('name', __('Name', 'bit-integrations'), required),
  field('price', __('Price', 'bit-integrations'), required),
  field('min_quantity', __('Minimum Quantity', 'bit-integrations'), required),
  field('max_quantity', __('Maximum Quantity', 'bit-integrations'), required),
  field('duration', __('Duration in Minutes', 'bit-integrations')),
  field('notes', __('Notes', 'bit-integrations'))
]

const customerCategoryFields = required => [
  field('name', __('Name', 'bit-integrations'), required),
  field('color', __('Color', 'bit-integrations')),
  field('icon', __('Icon', 'bit-integrations')),
  field('note', __('Note', 'bit-integrations'))
]

const nameField = field('name', __('Name', 'bit-integrations'), true)

export const BookneticStaticData = {
  create_appointment: [
    field('starts_at', __('Starts At (YYYY-MM-DD HH:MM)', 'bit-integrations'), true),
    field('customer_id', __('Customer ID', 'bit-integrations')),
    field('location_id', __('Location ID', 'bit-integrations')),
    field('service_id', __('Service ID', 'bit-integrations')),
    field('staff_id', __('Staff ID', 'bit-integrations')),
    field('weight', __('Number of Customers', 'bit-integrations')),
    field('paid_amount', __('Paid Amount', 'bit-integrations')),
    field('note', __('Note', 'bit-integrations'))
  ],
  update_appointment: [
    appointmentId,
    field('starts_at', __('Starts At (YYYY-MM-DD HH:MM)', 'bit-integrations')),
    field('weight', __('Number of Customers', 'bit-integrations')),
    field('note', __('Note', 'bit-integrations'))
  ],
  delete_appointment: [appointmentId],
  reschedule_appointment: [
    appointmentId,
    field('date', __('Date (YYYY-MM-DD)', 'bit-integrations'), true),
    field('time', __('Time (HH:MM)', 'bit-integrations'), true)
  ],
  change_appointment_status: [appointmentId],
  update_payment: [
    appointmentId,
    field('paid_amount', __('Paid Amount', 'bit-integrations')),
    field('service_price', __('Service Price', 'bit-integrations'))
  ],
  complete_payment: [appointmentId],
  create_customer: customerFields(true),
  update_customer: [customerId, ...customerFields(false)],
  delete_customer: [customerId],
  assign_customer_category: [customerId],
  create_staff: staffFields(true),
  update_staff: [staffId, ...staffFields(false)],
  delete_staff: [staffId],
  duplicate_staff: [staffId],
  set_staff_status: [staffId],
  create_location: locationFields(true),
  update_location: [locationId, ...locationFields(false)],
  delete_location: [locationId],
  duplicate_location: [locationId],
  set_location_status: [locationId],
  create_service: serviceFields(true),
  update_service: [serviceId, ...serviceFields(false)],
  delete_service: [serviceId],
  duplicate_service: [serviceId],
  set_service_status: [serviceId],
  create_service_extra: serviceExtraFields(true),
  update_service_extra: [serviceExtraId, ...serviceExtraFields(false)],
  delete_service_extra: [serviceExtraId],
  duplicate_service_extra: [serviceExtraId],
  create_customer_category: customerCategoryFields(true),
  update_customer_category: [
    field('customer_category_id', __('Customer Category ID', 'bit-integrations'), true),
    ...customerCategoryFields(false)
  ],
  delete_customer_category: [
    field('customer_category_id', __('Customer Category ID', 'bit-integrations'), true)
  ],
  create_location_category: [nameField],
  update_location_category: [
    field('location_category_id', __('Location Category ID', 'bit-integrations'), true),
    nameField
  ],
  delete_location_category: [
    field('location_category_id', __('Location Category ID', 'bit-integrations'), true)
  ],
  create_service_category: [nameField],
  update_service_category: [
    field('service_category_id', __('Service Category ID', 'bit-integrations'), true),
    nameField
  ],
  delete_service_category: [
    field('service_category_id', __('Service Category ID', 'bit-integrations'), true)
  ],
  create_in_app_notification: [
    field('title', __('Title', 'bit-integrations'), true),
    field('message', __('Message', 'bit-integrations'), true),
    field('user_id', __('WordPress User ID', 'bit-integrations'))
  ]
}

export const actionNotes = {
  create_appointment: __(
    'Map Starts At as YYYY-MM-DD HH:MM. The staff member must work at the location, give the service and be free at that time.',
    'bit-integrations'
  ),
  update_appointment: __(
    'Map only the fields to change. Map Starts At as YYYY-MM-DD HH:MM.',
    'bit-integrations'
  ),
  reschedule_appointment: __(
    'Map Date as YYYY-MM-DD and Time as HH:MM. The staff member must be free at that time.',
    'bit-integrations'
  ),
  update_payment: __(
    'Service Price is the total for all customers of the appointment. Other prices stay the same.',
    'bit-integrations'
  ),
  update_customer: __('Map only the fields to change.', 'bit-integrations'),
  update_staff: __('Map only the fields to change.', 'bit-integrations'),
  update_location: __('Map only the fields to change.', 'bit-integrations'),
  update_service: __('Map only the fields to change.', 'bit-integrations'),
  update_service_extra: __('Map only the fields to change.', 'bit-integrations'),
  update_customer_category: __('Map only the fields to change.', 'bit-integrations'),
  delete_customer: __('Booknetic does not delete a customer that has appointments.', 'bit-integrations'),
  delete_staff: __(
    'Booknetic does not delete a staff member that has appointments.',
    'bit-integrations'
  ),
  delete_location: __(
    'Booknetic does not delete a location that has staff members or appointments.',
    'bit-integrations'
  ),
  delete_service: __('Booknetic does not delete a service that has appointments.', 'bit-integrations')
}

export const paymentStatusOptions = [
  { label: __('Not Paid', 'bit-integrations'), value: 'not_paid' },
  { label: __('Paid', 'bit-integrations'), value: 'paid' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Canceled', 'bit-integrations'), value: 'canceled' }
]

export const activeStatusOptions = [
  { label: __('Active', 'bit-integrations'), value: '1' },
  { label: __('Inactive', 'bit-integrations'), value: '0' }
]

export const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: '1' },
  { label: __('No', 'bit-integrations'), value: '0' }
]

export const genderOptions = [
  { label: __('Male', 'bit-integrations'), value: 'male' },
  { label: __('Female', 'bit-integrations'), value: 'female' }
]

export const depositTypeOptions = [
  { label: __('Percent', 'bit-integrations'), value: 'percent' },
  { label: __('Fixed Amount', 'bit-integrations'), value: 'price' }
]

export const requiredSelects = [
  {
    key: 'selectedLocation',
    mapKey: 'location_id',
    label: __('Location', 'bit-integrations'),
    source: 'locations',
    actions: ['create_appointment']
  },
  {
    key: 'selectedService',
    mapKey: 'service_id',
    label: __('Service', 'bit-integrations'),
    source: 'services',
    actions: ['create_appointment']
  },
  {
    key: 'selectedStaff',
    mapKey: 'staff_id',
    label: __('Staff', 'bit-integrations'),
    source: 'staff',
    actions: ['create_appointment']
  },
  {
    key: 'selectedCustomer',
    mapKey: 'customer_id',
    label: __('Customer', 'bit-integrations'),
    source: 'customers',
    actions: ['create_appointment']
  },
  {
    key: 'selectedStatus',
    label: __('Status', 'bit-integrations'),
    source: 'statuses',
    actions: ['create_appointment', 'change_appointment_status']
  },
  {
    key: 'selectedPaymentStatus',
    label: __('Payment Status', 'bit-integrations'),
    options: paymentStatusOptions,
    actions: ['update_payment']
  },
  {
    key: 'selectedCustomerCategory',
    label: __('Customer Category', 'bit-integrations'),
    source: 'customer_categories',
    actions: ['assign_customer_category']
  },
  {
    key: 'selectedLocations',
    label: __('Locations', 'bit-integrations'),
    source: 'locations',
    multi: true,
    actions: ['create_staff']
  },
  {
    key: 'selectedServiceCategory',
    label: __('Service Category', 'bit-integrations'),
    source: 'service_categories',
    actions: ['create_service']
  },
  {
    key: 'selectedActiveStatus',
    label: __('Status', 'bit-integrations'),
    options: activeStatusOptions,
    actions: ['set_staff_status', 'set_location_status', 'set_service_status']
  },
  {
    key: 'selectedUser',
    mapKey: 'user_id',
    label: __('WordPress User', 'bit-integrations'),
    source: 'users',
    actions: ['create_in_app_notification']
  }
]

const utility = (key, title, subTitle, actions, extra = {}) => ({
  key,
  title,
  subTitle,
  actions,
  ...extra
})

export const utilities = [
  utility(
    'selected_payment_method',
    __('Payment Method', 'bit-integrations'),
    __('Set the payment method', 'bit-integrations'),
    ['create_appointment'],
    { source: 'payment_gateways' }
  ),
  utility(
    'selected_payment_status',
    __('Payment Status', 'bit-integrations'),
    __('Set the payment status', 'bit-integrations'),
    ['create_appointment'],
    { options: paymentStatusOptions }
  ),
  utility(
    'selected_location',
    __('Location', 'bit-integrations'),
    __('Change the location', 'bit-integrations'),
    ['update_appointment'],
    { source: 'locations' }
  ),
  utility(
    'selected_service',
    __('Service', 'bit-integrations'),
    __('Change the service', 'bit-integrations'),
    ['update_appointment'],
    { source: 'services' }
  ),
  utility(
    'selected_staff',
    __('Staff', 'bit-integrations'),
    __('Change the staff member', 'bit-integrations'),
    ['update_appointment', 'reschedule_appointment'],
    { source: 'staff' }
  ),
  utility(
    'selected_customer',
    __('Customer', 'bit-integrations'),
    __('Change the customer', 'bit-integrations'),
    ['update_appointment'],
    { source: 'customers' }
  ),
  utility(
    'selected_status',
    __('Status', 'bit-integrations'),
    __('Change the status', 'bit-integrations'),
    ['update_appointment'],
    { source: 'statuses' }
  ),
  utility(
    'selected_reset_status',
    __('Reset Status', 'bit-integrations'),
    __('Set the status back to the default', 'bit-integrations'),
    ['reschedule_appointment'],
    { options: yesNoOptions }
  ),
  utility(
    'selected_gender',
    __('Gender', 'bit-integrations'),
    __('Set the gender', 'bit-integrations'),
    ['create_customer', 'update_customer'],
    { options: genderOptions }
  ),
  utility(
    'selected_customer_category',
    __('Customer Category', 'bit-integrations'),
    __('Set the customer category', 'bit-integrations'),
    ['create_customer', 'update_customer'],
    { source: 'customer_categories' }
  ),
  utility(
    'selected_locations',
    __('Locations', 'bit-integrations'),
    __('Set the locations', 'bit-integrations'),
    ['update_staff'],
    { source: 'locations', multi: true }
  ),
  utility(
    'selected_services',
    __('Services', 'bit-integrations'),
    __('Set the services', 'bit-integrations'),
    ['create_staff', 'update_staff'],
    { source: 'services', multi: true }
  ),
  utility(
    'selected_user',
    __('WordPress User', 'bit-integrations'),
    __('Link a WordPress user', 'bit-integrations'),
    ['create_customer', 'update_customer', 'create_staff', 'update_staff'],
    { source: 'users' }
  ),
  utility(
    'selected_location_category',
    __('Location Category', 'bit-integrations'),
    __('Set the location category', 'bit-integrations'),
    ['create_location', 'update_location'],
    { source: 'location_categories' }
  ),
  utility(
    'selected_staff_members',
    __('Staff', 'bit-integrations'),
    __('Set the staff members', 'bit-integrations'),
    ['create_service'],
    { source: 'staff', multi: true }
  ),
  utility(
    'selected_service_category',
    __('Service Category', 'bit-integrations'),
    __('Change the service category', 'bit-integrations'),
    ['update_service'],
    { source: 'service_categories' }
  ),
  utility(
    'selected_deposit_type',
    __('Deposit Type', 'bit-integrations'),
    __('Set the deposit type', 'bit-integrations'),
    ['create_service', 'update_service'],
    { options: depositTypeOptions }
  ),
  utility(
    'selected_service',
    __('Service', 'bit-integrations'),
    __('Set the service', 'bit-integrations'),
    ['create_service_extra', 'update_service_extra'],
    { source: 'services' }
  ),
  utility(
    'selected_service',
    __('Destination Service', 'bit-integrations'),
    __('Add the copy to this service', 'bit-integrations'),
    ['duplicate_service_extra'],
    { source: 'services' }
  ),
  utility(
    'selected_extra_category',
    __('Extra Category', 'bit-integrations'),
    __('Set the service extra category', 'bit-integrations'),
    ['create_service_extra', 'update_service_extra'],
    { source: 'extra_categories' }
  ),
  utility(
    'selected_active_status',
    __('Status', 'bit-integrations'),
    __('Set the status', 'bit-integrations'),
    ['update_service_extra'],
    { options: activeStatusOptions }
  ),
  utility(
    'selected_is_default',
    __('Default Category', 'bit-integrations'),
    __('Make this the default category', 'bit-integrations'),
    ['create_customer_category', 'update_customer_category'],
    { options: yesNoOptions }
  ),
  utility(
    'selected_parent_category',
    __('Parent Category', 'bit-integrations'),
    __('Set the parent category', 'bit-integrations'),
    ['create_service_category', 'update_service_category'],
    { source: 'service_categories' }
  )
]
