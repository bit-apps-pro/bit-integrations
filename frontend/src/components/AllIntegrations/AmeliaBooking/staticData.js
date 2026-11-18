import { __ } from '../../../Utils/i18nwrap'

const action = (name, label) => ({ name, label, is_pro: true })

export const modules = [
  action('create_appointment', __('Create Appointment', 'bit-integrations')),
  action('update_appointment_status', __('Update Appointment Status', 'bit-integrations')),
  action('reschedule_appointment', __('Reschedule Appointment', 'bit-integrations')),
  action('update_appointment_note', __('Update Appointment Note', 'bit-integrations')),
  action('delete_appointment', __('Delete Appointment', 'bit-integrations')),
  action('update_booking_status', __('Update Booking Status', 'bit-integrations')),
  action('cancel_booking', __('Cancel Booking', 'bit-integrations')),
  action('delete_booking', __('Delete Booking', 'bit-integrations')),
  action('create_event', __('Create Event', 'bit-integrations')),
  action('update_event_status', __('Update Event Status', 'bit-integrations')),
  action('delete_event', __('Delete Event', 'bit-integrations')),
  action('book_event', __('Book Customer into Event', 'bit-integrations')),
  action('update_event_booking_status', __('Update Event Booking Status', 'bit-integrations')),
  action('cancel_event_booking', __('Cancel Event Booking', 'bit-integrations')),
  action('delete_event_booking', __('Delete Event Booking', 'bit-integrations')),
  action('create_customer', __('Create Customer', 'bit-integrations')),
  action('update_customer', __('Update Customer', 'bit-integrations')),
  action('delete_customer', __('Delete Customer', 'bit-integrations')),
  action('create_employee', __('Create Employee', 'bit-integrations')),
  action('update_employee_status', __('Update Employee Status', 'bit-integrations')),
  action('delete_employee', __('Delete Employee', 'bit-integrations')),
  action('create_service', __('Create Service', 'bit-integrations')),
  action('update_service_status', __('Update Service Status', 'bit-integrations')),
  action('delete_service', __('Delete Service', 'bit-integrations')),
  action('create_category', __('Create Category', 'bit-integrations')),
  action('update_category', __('Update Category', 'bit-integrations')),
  action('delete_category', __('Delete Category', 'bit-integrations')),
  action('add_payment', __('Add Payment', 'bit-integrations')),
  action('update_payment', __('Update Payment', 'bit-integrations')),
  action('delete_payment', __('Delete Payment', 'bit-integrations'))
]

const field = (key, label, required = false) => ({ key, label, required })

const appointmentId = field('appointment_id', __('Appointment ID', 'bit-integrations'), true)
const bookingId = field('booking_id', __('Booking ID', 'bit-integrations'), true)
const eventId = field('event_id', __('Event ID', 'bit-integrations'), true)
const eventBookingId = field('event_booking_id', __('Event Booking ID', 'bit-integrations'), true)
const customer = field('customer', __('Customer ID or Email', 'bit-integrations'), true)
const employeeId = field('employee_id', __('Employee ID', 'bit-integrations'), true)
const serviceId = field('service_id', __('Service ID', 'bit-integrations'), true)
const categoryId = field('category_id', __('Category ID', 'bit-integrations'), true)
const paymentId = field('payment_id', __('Payment ID', 'bit-integrations'), true)
const persons = field('persons', __('Persons', 'bit-integrations'))

const profileFields = [
  field('phone', __('Phone', 'bit-integrations')),
  field('birthday', __('Birthday', 'bit-integrations')),
  field('note', __('Note', 'bit-integrations'))
]

export const fieldSets = {
  create_appointment: [
    customer,
    field('booking_start', __('Start Date and Time', 'bit-integrations'), true),
    persons,
    field('internal_notes', __('Internal Notes', 'bit-integrations'))
  ],
  update_appointment_status: [appointmentId],
  reschedule_appointment: [
    appointmentId,
    field('booking_start', __('New Start Date and Time', 'bit-integrations'), true)
  ],
  update_appointment_note: [
    appointmentId,
    field('internal_notes', __('Internal Notes', 'bit-integrations'))
  ],
  delete_appointment: [appointmentId],
  update_booking_status: [bookingId],
  cancel_booking: [bookingId],
  delete_booking: [bookingId],
  create_event: [
    field('name', __('Event Name', 'bit-integrations'), true),
    field('start', __('Start Date and Time', 'bit-integrations'), true),
    field('end', __('End Date and Time', 'bit-integrations'), true),
    field('max_capacity', __('Maximum Capacity', 'bit-integrations'), true),
    field('price', __('Price', 'bit-integrations')),
    field('description', __('Description', 'bit-integrations'))
  ],
  update_event_status: [eventId],
  delete_event: [eventId],
  book_event: [customer, persons],
  update_event_booking_status: [eventBookingId],
  cancel_event_booking: [eventBookingId],
  delete_event_booking: [eventBookingId],
  create_customer: [
    field('first_name', __('First Name', 'bit-integrations'), true),
    field('last_name', __('Last Name', 'bit-integrations'), true),
    field('email', __('Email', 'bit-integrations'), true),
    ...profileFields
  ],
  update_customer: [
    customer,
    field('first_name', __('First Name', 'bit-integrations')),
    field('last_name', __('Last Name', 'bit-integrations')),
    field('email', __('Email', 'bit-integrations')),
    ...profileFields
  ],
  delete_customer: [customer],
  create_employee: [
    field('first_name', __('First Name', 'bit-integrations'), true),
    field('last_name', __('Last Name', 'bit-integrations'), true),
    field('email', __('Email', 'bit-integrations'), true),
    field('phone', __('Phone', 'bit-integrations')),
    field('description', __('Description', 'bit-integrations')),
    field('note', __('Note', 'bit-integrations'))
  ],
  update_employee_status: [employeeId],
  delete_employee: [employeeId],
  create_service: [
    field('name', __('Service Name', 'bit-integrations'), true),
    field('duration', __('Duration in Minutes', 'bit-integrations'), true),
    field('price', __('Price', 'bit-integrations'), true),
    field('min_capacity', __('Minimum Capacity', 'bit-integrations')),
    field('max_capacity', __('Maximum Capacity', 'bit-integrations')),
    field('description', __('Description', 'bit-integrations'))
  ],
  update_service_status: [serviceId],
  delete_service: [serviceId],
  create_category: [
    field('name', __('Category Name', 'bit-integrations'), true),
    field('color', __('Color', 'bit-integrations'))
  ],
  update_category: [
    categoryId,
    field('name', __('Category Name', 'bit-integrations')),
    field('color', __('Color', 'bit-integrations'))
  ],
  delete_category: [categoryId],
  add_payment: [
    bookingId,
    field('amount', __('Amount', 'bit-integrations'), true),
    field('transaction_id', __('Transaction ID', 'bit-integrations')),
    field('date_time', __('Payment Date', 'bit-integrations'))
  ],
  update_payment: [
    paymentId,
    field('amount', __('Amount', 'bit-integrations')),
    field('transaction_id', __('Transaction ID', 'bit-integrations'))
  ],
  delete_payment: [paymentId]
}

const changedFieldsNote = __(
  'Amelia changes only the fields that have a value. Empty fields keep their current value.',
  'bit-integrations'
)
const dateNote = __(
  'Use the format YYYY-MM-DD HH:mm for dates and times, for example 2026-12-24 14:30.',
  'bit-integrations'
)
const birthdayNote = __('Use the format YYYY-MM-DD for the birthday.', 'bit-integrations')
const personsNote = __('Persons is optional. The default is 1.', 'bit-integrations')
const colorNote = __('Use a hex color, for example #1788FB. The default is #1788FB.', 'bit-integrations')

export const oneOfFieldsNote = {
  create_appointment: `${dateNote} ${personsNote}`,
  reschedule_appointment: dateNote,
  create_event: dateNote,
  book_event: personsNote,
  create_customer: birthdayNote,
  update_customer: `${changedFieldsNote} ${birthdayNote}`,
  create_employee: __(
    'Amelia Lite allows only one active employee. Upgrade Amelia to add more employees.',
    'bit-integrations'
  ),
  create_service: __(
    'Duration is in minutes. Minimum and Maximum Capacity are optional. The default is 1.',
    'bit-integrations'
  ),
  create_category: colorNote,
  update_category: `${changedFieldsNote} ${colorNote}`,
  add_payment: __(
    'Use the format YYYY-MM-DD HH:mm for the payment date. Leave it empty to use the current time.',
    'bit-integrations'
  ),
  update_payment: changedFieldsNote,
  delete_booking: __(
    'Amelia deletes the appointment too when this is its only booking.',
    'bit-integrations'
  )
}

const appointmentStatusOptions = [
  { label: __('Approved', 'bit-integrations'), value: 'approved' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Canceled', 'bit-integrations'), value: 'canceled' },
  { label: __('Rejected', 'bit-integrations'), value: 'rejected' },
  { label: __('No-show', 'bit-integrations'), value: 'no-show' }
]

const newBookingStatusOptions = [
  { label: __('Approved', 'bit-integrations'), value: 'approved' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' }
]

const eventBookingStatusOptions = [
  { label: __('Approved', 'bit-integrations'), value: 'approved' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Canceled', 'bit-integrations'), value: 'canceled' },
  { label: __('Rejected', 'bit-integrations'), value: 'rejected' }
]

const eventStatusOptions = [
  { label: __('Opened', 'bit-integrations'), value: 'approved' },
  { label: __('Canceled', 'bit-integrations'), value: 'rejected' }
]

const visibilityOptions = [
  { label: __('Visible', 'bit-integrations'), value: 'visible' },
  { label: __('Hidden', 'bit-integrations'), value: 'hidden' }
]

const paymentStatusOptions = [
  { label: __('Paid', 'bit-integrations'), value: 'paid' },
  { label: __('Partially Paid', 'bit-integrations'), value: 'partiallyPaid' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Refunded', 'bit-integrations'), value: 'refunded' }
]

const gatewayOptions = [
  { label: __('On-site', 'bit-integrations'), value: 'onSite' },
  { label: __('Stripe', 'bit-integrations'), value: 'stripe' },
  { label: __('PayPal', 'bit-integrations'), value: 'payPal' },
  { label: __('WooCommerce', 'bit-integrations'), value: 'wc' },
  { label: __('Mollie', 'bit-integrations'), value: 'mollie' },
  { label: __('Razorpay', 'bit-integrations'), value: 'razorpay' },
  { label: __('Square', 'bit-integrations'), value: 'square' }
]

const genderOptions = [
  { label: __('Male', 'bit-integrations'), value: 'male' },
  { label: __('Female', 'bit-integrations'), value: 'female' }
]

const select = (confKey, label, source, required = true, multi = false) => ({
  confKey,
  label,
  required,
  multi,
  ...source
})

const statusSelect = options => select('selectedStatus', __('Status:', 'bit-integrations'), { options })
const locationSelect = select(
  'selectedLocation',
  __('Location:', 'bit-integrations'),
  { list: 'locations' },
  false
)

export const selectsByAction = {
  create_appointment: [
    select('selectedService', __('Service:', 'bit-integrations'), { list: 'services' }),
    select('selectedEmployee', __('Employee:', 'bit-integrations'), { list: 'employees' }),
    locationSelect
  ],
  update_appointment_status: [statusSelect(appointmentStatusOptions)],
  update_booking_status: [statusSelect(appointmentStatusOptions)],
  create_event: [locationSelect],
  update_event_status: [statusSelect(eventStatusOptions)],
  book_event: [select('selectedEvent', __('Event:', 'bit-integrations'), { list: 'events' })],
  update_event_booking_status: [statusSelect(eventBookingStatusOptions)],
  create_employee: [locationSelect],
  update_employee_status: [statusSelect(visibilityOptions)],
  create_service: [
    select('selectedCategory', __('Category:', 'bit-integrations'), { list: 'categories' }),
    select('selectedEmployees', __('Employees:', 'bit-integrations'), { list: 'employees' }, true, true)
  ],
  update_service_status: [statusSelect(visibilityOptions)],
  add_payment: [
    select('selectedStatus', __('Payment Status:', 'bit-integrations'), {
      options: paymentStatusOptions
    })
  ]
}

export const listsByAction = Object.fromEntries(
  Object.entries(selectsByAction)
    .map(([name, selects]) => [name, selects.filter(item => item.list).map(item => item.list)])
    .filter(([, lists]) => lists.length > 0)
)

const selectUtility = (key, title, subTitle, options) => ({ key, title, subTitle, options })

const checkboxUtility = (key, title, subTitle, value = 'true') => ({
  checkbox: true,
  key,
  subTitle,
  title,
  value
})

const bookingStatusUtility = selectUtility(
  'booking_status',
  __('Booking Status', 'bit-integrations'),
  __('Set the booking status. The default is Approved.', 'bit-integrations'),
  newBookingStatusOptions
)

const genderUtility = selectUtility(
  'gender',
  __('Gender', 'bit-integrations'),
  __('Set the customer gender.', 'bit-integrations'),
  genderOptions
)

const gatewayUtility = selectUtility(
  'gateway',
  __('Payment Method', 'bit-integrations'),
  __('Set the payment method. The default is On-site.', 'bit-integrations'),
  gatewayOptions
)

export const utilitiesByAction = {
  create_appointment: [
    bookingStatusUtility,
    checkboxUtility(
      'notify',
      __('Do Not Notify', 'bit-integrations'),
      __('Do not send Amelia notifications to the customer and the employee.', 'bit-integrations'),
      'false'
    )
  ],
  create_event: [
    checkboxUtility(
      'bringing_anyone',
      __('Block Extra People', 'bit-integrations'),
      __('Let one customer book a place for one person only.', 'bit-integrations'),
      'false'
    ),
    checkboxUtility(
      'book_multiple_times',
      __('Block Repeat Bookings', 'bit-integrations'),
      __('Let one customer book the event only one time.', 'bit-integrations'),
      'false'
    ),
    checkboxUtility(
      'show',
      __('Hide on Site', 'bit-integrations'),
      __('Do not show the event on the booking pages of the site.', 'bit-integrations'),
      'false'
    )
  ],
  book_event: [bookingStatusUtility],
  create_customer: [genderUtility],
  update_customer: [genderUtility],
  add_payment: [gatewayUtility],
  update_payment: [
    selectUtility(
      'payment_status',
      __('Payment Status', 'bit-integrations'),
      __('Set the payment status.', 'bit-integrations'),
      paymentStatusOptions
    ),
    gatewayUtility
  ]
}
