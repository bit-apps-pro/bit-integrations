import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_appointment', label: __('Create Appointment', 'bit-integrations'), is_pro: true },
  { name: 'update_appointment', label: __('Update Appointment', 'bit-integrations'), is_pro: true },
  {
    name: 'change_appointment_status',
    label: __('Change Appointment Status', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_payment_status',
    label: __('Update Payment Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'delete_appointment', label: __('Delete Appointment', 'bit-integrations'), is_pro: true },
  { name: 'create_customer', label: __('Create Customer', 'bit-integrations'), is_pro: true },
  { name: 'update_customer', label: __('Update Customer', 'bit-integrations'), is_pro: true },
  { name: 'delete_customer', label: __('Delete Customer', 'bit-integrations'), is_pro: true },
  { name: 'create_staff', label: __('Create Staff Member', 'bit-integrations'), is_pro: true },
  { name: 'update_staff', label: __('Update Staff Member', 'bit-integrations'), is_pro: true },
  { name: 'delete_staff', label: __('Delete Staff Member', 'bit-integrations'), is_pro: true },
  {
    name: 'assign_service_to_staff',
    label: __('Assign Service to Staff Member', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_service_from_staff',
    label: __('Remove Service from Staff Member', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_staff_working_hours',
    label: __('Update Staff Working Hours', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_service', label: __('Create Service', 'bit-integrations'), is_pro: true },
  { name: 'update_service', label: __('Update Service', 'bit-integrations'), is_pro: true },
  { name: 'delete_service', label: __('Delete Service', 'bit-integrations'), is_pro: true },
  { name: 'create_category', label: __('Create Category', 'bit-integrations'), is_pro: true },
  { name: 'update_category', label: __('Update Category', 'bit-integrations'), is_pro: true },
  { name: 'delete_category', label: __('Delete Category', 'bit-integrations'), is_pro: true }
]

const field = (key, label, required = false) => ({ key, label, required })

const AppointmentIdField = field('appointment_id', __('Appointment ID', 'bit-integrations'), true)
const CustomerIdField = field('customer_id', __('Customer ID or Email', 'bit-integrations'), true)
const StaffIdField = field('staff_id', __('Staff ID', 'bit-integrations'), true)
const ServiceIdField = field('service_id', __('Service ID', 'bit-integrations'), true)
const CategoryIdField = field('category_id', __('Category ID', 'bit-integrations'), true)

const ScheduleFields = required => [
  field('date', __('Date', 'bit-integrations'), required),
  field('start_time', __('Start Time', 'bit-integrations'), required),
  field('end_time', __('End Time', 'bit-integrations'))
]

const PersonFields = required => [
  field('full_name', __('Full Name', 'bit-integrations'), required),
  field('email', __('Email', 'bit-integrations'), required),
  field('phone', __('Phone', 'bit-integrations'))
]

const ServiceFields = required => [
  field('title', __('Title', 'bit-integrations'), required),
  field('duration', __('Duration (Minutes)', 'bit-integrations')),
  field('price', __('Price', 'bit-integrations'))
]

export const fieldsByAction = {
  create_appointment: [
    ...ScheduleFields(true),
    field('customer_email', __('Customer Email', 'bit-integrations')),
    field('customer_name', __('Customer Full Name', 'bit-integrations')),
    field('customer_phone', __('Customer Phone', 'bit-integrations')),
    field('price', __('Price', 'bit-integrations')),
    field('comment', __('Comment', 'bit-integrations'))
  ],
  update_appointment: [
    AppointmentIdField,
    ...ScheduleFields(false),
    field('price', __('Price', 'bit-integrations')),
    field('comment', __('Comment', 'bit-integrations'))
  ],
  change_appointment_status: [AppointmentIdField],
  update_payment_status: [AppointmentIdField],
  delete_appointment: [AppointmentIdField, field('reason', __('Reason', 'bit-integrations'))],
  create_customer: PersonFields(true),
  update_customer: [CustomerIdField, ...PersonFields(false)],
  delete_customer: [CustomerIdField],
  create_staff: PersonFields(true),
  update_staff: [StaffIdField, ...PersonFields(false)],
  delete_staff: [StaffIdField],
  assign_service_to_staff: [StaffIdField, field('price', __('Price', 'bit-integrations'))],
  remove_service_from_staff: [StaffIdField],
  update_staff_working_hours: [
    StaffIdField,
    field('start_time', __('Start Time', 'bit-integrations')),
    field('end_time', __('End Time', 'bit-integrations')),
    field('break_from', __('Break Start', 'bit-integrations')),
    field('break_to', __('Break End', 'bit-integrations'))
  ],
  create_service: ServiceFields(true),
  update_service: [ServiceIdField, ...ServiceFields(false)],
  delete_service: [ServiceIdField],
  create_category: [field('name', __('Name', 'bit-integrations'), true)],
  update_category: [CategoryIdField, field('name', __('Name', 'bit-integrations'), true)],
  delete_category: [CategoryIdField]
}

const formatNote = __(
  'Use the YYYY-MM-DD date format and the 24-hour HH:MM time format, for example 2026-12-24 and 14:30.',
  'bit-integrations'
)
const keepNote = __('Leave a field empty to keep the current value.', 'bit-integrations')
const phoneNote = __('Use 9 to 14 digits for the phone. A + sign is optional.', 'bit-integrations')

export const notesByAction = {
  create_appointment: [
    formatNote,
    __(
      'Select a customer in Utilities, or map the customer email. If no customer has the email, Bookit creates one. Then map the customer full name too.',
      'bit-integrations'
    ),
    __(
      'Leave the end time empty to use the service duration. Leave the price empty to use the staff price.',
      'bit-integrations'
    ),
    __('Use 8 to 14 digits for the customer phone. A + sign is optional.', 'bit-integrations')
  ],
  update_appointment: [
    formatNote,
    keepNote,
    __(
      'When the service or staff member changes and the price is empty, the appointment gets the staff price.',
      'bit-integrations'
    )
  ],
  delete_appointment: [__('Bookit adds the reason to the delete emails.', 'bit-integrations')],
  create_customer: [
    __('Use 3 to 25 characters for the full name. The email must be unique.', 'bit-integrations'),
    phoneNote
  ],
  update_customer: [
    __('Map the customer ID or the customer email.', 'bit-integrations'),
    keepNote,
    phoneNote
  ],
  delete_customer: [__('Bookit also deletes the appointments of this customer.', 'bit-integrations')],
  create_staff: [
    __('Use 3 to 50 characters for the full name.', 'bit-integrations'),
    phoneNote,
    __('The staff member gets working hours from Monday to Friday, 09:00 to 18:00.', 'bit-integrations')
  ],
  update_staff: [keepNote, phoneNote],
  delete_staff: [__('Bookit also deletes the appointments of this staff member.', 'bit-integrations')],
  assign_service_to_staff: [__('Leave the price empty to use the service price.', 'bit-integrations')],
  update_staff_working_hours: [
    __('Use the 24-hour HH:MM time format, for example 14:30.', 'bit-integrations'),
    __('Leave the start and end time empty to set a day off.', 'bit-integrations'),
    __('Leave the break times empty for no break.', 'bit-integrations')
  ],
  create_service: [
    __(
      'Enter the duration in minutes from 15 to 720, in steps of 15. Leave it empty to use 15 minutes.',
      'bit-integrations'
    )
  ],
  update_service: [
    keepNote,
    __('Enter the duration in minutes from 15 to 720, in steps of 15.', 'bit-integrations')
  ],
  delete_service: [__('Bookit also deletes the appointments of this service.', 'bit-integrations')],
  create_category: [
    __('Use 3 to 25 characters for the name. The name must be unique.', 'bit-integrations')
  ],
  update_category: [
    __('Use 3 to 25 characters for the name. The name must be unique.', 'bit-integrations')
  ],
  delete_category: [
    __('Bookit also deletes the services and appointments in this category.', 'bit-integrations')
  ]
}

export const appointmentStatusOptions = [
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Approved', 'bit-integrations'), value: 'approved' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' }
]

export const paymentStatusOptions = [
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Complete', 'bit-integrations'), value: 'complete' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' },
  { label: __('Rejected', 'bit-integrations'), value: 'rejected' }
]

export const weekdayOptions = [
  { label: __('Monday', 'bit-integrations'), value: '1' },
  { label: __('Tuesday', 'bit-integrations'), value: '2' },
  { label: __('Wednesday', 'bit-integrations'), value: '3' },
  { label: __('Thursday', 'bit-integrations'), value: '4' },
  { label: __('Friday', 'bit-integrations'), value: '5' },
  { label: __('Saturday', 'bit-integrations'), value: '6' },
  { label: __('Sunday', 'bit-integrations'), value: '7' }
]

const sendEmailsUtility = subTitle => ({
  key: 'send_notifications',
  checkbox: true,
  value: 'true',
  title: __('Send Bookit Emails', 'bit-integrations'),
  subTitle
})

const appointmentStatusUtility = subTitle => ({
  key: 'status',
  options: appointmentStatusOptions,
  title: __('Status', 'bit-integrations'),
  subTitle
})

const paymentMethodUtility = subTitle => ({
  key: 'payment_method',
  optionsKey: 'allPaymentMethods',
  title: __('Payment Method', 'bit-integrations'),
  subTitle
})

const paymentStatusUtility = subTitle => ({
  key: 'payment_status',
  options: paymentStatusOptions,
  title: __('Payment Status', 'bit-integrations'),
  subTitle
})

const wpUserUtility = {
  key: 'wp_user',
  optionsKey: 'allWpUsers',
  title: __('WordPress User', 'bit-integrations'),
  subTitle: __('Link a WordPress user to the customer.', 'bit-integrations')
}

const staffWpUserUtility = {
  key: 'wp_user',
  optionsKey: 'allStaffWpUsers',
  title: __('WordPress User', 'bit-integrations'),
  subTitle: __(
    'Link a WordPress user to the staff member. Bookit replaces the roles of the user with the Bookit Staff role. The list does not show administrators.',
    'bit-integrations'
  )
}

export const utilitiesByAction = {
  create_appointment: [
    {
      key: 'customer',
      optionsKey: 'allCustomers',
      title: __('Customer', 'bit-integrations'),
      subTitle: __(
        'Select an existing customer. Clear it to use the mapped customer email.',
        'bit-integrations'
      )
    },
    appointmentStatusUtility(__('Set the status. The default is Pending.', 'bit-integrations')),
    paymentMethodUtility(
      __(
        'Select an active payment method. The default is Pay Locally, or the first active method when Pay Locally is off.',
        'bit-integrations'
      )
    ),
    paymentStatusUtility(
      __(
        'Set the payment status. The default is Pending. Bookit sets Complete when the price is 0.',
        'bit-integrations'
      )
    ),
    sendEmailsUtility(__('Send the Bookit new appointment emails.', 'bit-integrations'))
  ],
  update_appointment: [
    {
      key: 'service',
      optionsKey: 'allServices',
      title: __('Service', 'bit-integrations'),
      subTitle: __('Change the service of the appointment.', 'bit-integrations')
    },
    {
      key: 'staff',
      optionsKey: 'allStaff',
      title: __('Staff Member', 'bit-integrations'),
      subTitle: __(
        'Change the staff member. Select a staff member who provides the service.',
        'bit-integrations'
      )
    },
    appointmentStatusUtility(__('Change the status of the appointment.', 'bit-integrations')),
    paymentMethodUtility(__('Change the payment method of the appointment.', 'bit-integrations')),
    paymentStatusUtility(__('Change the payment status of the appointment.', 'bit-integrations')),
    sendEmailsUtility(__('Send the Bookit appointment changed emails.', 'bit-integrations'))
  ],
  change_appointment_status: [
    sendEmailsUtility(__('Send the Bookit status changed emails.', 'bit-integrations'))
  ],
  delete_appointment: [
    {
      key: 'notify_customer',
      checkbox: true,
      value: 'true',
      title: __('Send Email to Customer', 'bit-integrations'),
      subTitle: __('Send the Bookit appointment deleted email to the customer.', 'bit-integrations')
    },
    {
      key: 'notify_staff',
      checkbox: true,
      value: 'true',
      title: __('Send Email to Staff Member', 'bit-integrations'),
      subTitle: __('Send the Bookit appointment deleted email to the staff member.', 'bit-integrations')
    }
  ],
  create_customer: [wpUserUtility],
  update_customer: [wpUserUtility],
  create_staff: [
    staffWpUserUtility,
    {
      key: 'services',
      optionsKey: 'allServices',
      multiple: true,
      title: __('Services', 'bit-integrations'),
      subTitle: __(
        'Select the services that the staff member provides at the service price.',
        'bit-integrations'
      )
    }
  ],
  update_staff: [staffWpUserUtility],
  update_service: [
    {
      key: 'category',
      optionsKey: 'allCategories',
      title: __('Category', 'bit-integrations'),
      subTitle: __('Move the service to another category.', 'bit-integrations')
    }
  ]
}

export const needsService = [
  'create_appointment',
  'assign_service_to_staff',
  'remove_service_from_staff'
]

export const needsStaff = ['create_appointment']

export const needsStatus = ['change_appointment_status']

export const needsPaymentStatus = ['update_payment_status']

export const needsWeekdays = ['update_staff_working_hours']

export const needsCategory = ['create_service']
