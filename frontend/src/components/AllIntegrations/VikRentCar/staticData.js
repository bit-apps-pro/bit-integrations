import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_booking', label: __('Create Booking', 'bit-integrations'), is_pro: true },
  { name: 'update_booking', label: __('Update Booking', 'bit-integrations'), is_pro: true },
  { name: 'confirm_booking', label: __('Confirm Booking', 'bit-integrations'), is_pro: true },
  { name: 'cancel_booking', label: __('Cancel Booking', 'bit-integrations'), is_pro: true },
  { name: 'delete_booking', label: __('Delete Booking', 'bit-integrations'), is_pro: true },
  {
    name: 'update_rental_status',
    label: __('Update Rental Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'send_booking_email', label: __('Send Booking Email', 'bit-integrations'), is_pro: true },
  { name: 'update_car', label: __('Update Car', 'bit-integrations'), is_pro: true },
  { name: 'create_location', label: __('Create Location', 'bit-integrations'), is_pro: true },
  { name: 'update_location', label: __('Update Location', 'bit-integrations'), is_pro: true },
  { name: 'delete_location', label: __('Delete Location', 'bit-integrations'), is_pro: true }
]

const field = (key, label, required = false) => ({ key, label, required })

const BookingIdField = field('booking_id', __('Booking ID', 'bit-integrations'), true)
const LocationIdField = field('location_id', __('Location ID', 'bit-integrations'), true)

const CustomerFields = [
  field('customer_first_name', __('Customer First Name', 'bit-integrations')),
  field('customer_last_name', __('Customer Last Name', 'bit-integrations')),
  field('customer_email', __('Customer Email', 'bit-integrations')),
  field('customer_phone', __('Customer Phone', 'bit-integrations'))
]

const LocationFields = required => [
  field('name', __('Name', 'bit-integrations'), required),
  field('address', __('Address', 'bit-integrations')),
  field('latitude', __('Latitude', 'bit-integrations')),
  field('longitude', __('Longitude', 'bit-integrations')),
  field('description', __('Description', 'bit-integrations')),
  field('opening_time', __('Opening Time', 'bit-integrations')),
  field('closing_time', __('Closing Time', 'bit-integrations'))
]

export const fieldsByAction = {
  create_booking: [
    field('pickup_date_time', __('Pick-up Date and Time', 'bit-integrations'), true),
    field('dropoff_date_time', __('Drop-off Date and Time', 'bit-integrations'), true),
    ...CustomerFields,
    field('customer_address', __('Customer Address', 'bit-integrations')),
    field('customer_city', __('Customer City', 'bit-integrations')),
    field('customer_zip', __('Customer ZIP Code', 'bit-integrations')),
    field('customer_info', __('Customer Information', 'bit-integrations')),
    field('total_amount', __('Total Amount', 'bit-integrations')),
    field('admin_notes', __('Administrator Notes', 'bit-integrations'))
  ],
  update_booking: [
    BookingIdField,
    ...CustomerFields,
    field('customer_info', __('Customer Information', 'bit-integrations')),
    field('total_amount', __('Total Amount', 'bit-integrations')),
    field('amount_paid', __('Amount Paid', 'bit-integrations')),
    field('admin_notes', __('Administrator Notes', 'bit-integrations'))
  ],
  confirm_booking: [BookingIdField],
  cancel_booking: [BookingIdField],
  delete_booking: [BookingIdField],
  update_rental_status: [BookingIdField, field('notes', __('Notes', 'bit-integrations'))],
  send_booking_email: [BookingIdField],
  update_car: [
    field('car_id', __('Car ID', 'bit-integrations'), true),
    field('name', __('Name', 'bit-integrations')),
    field('units', __('Units', 'bit-integrations')),
    field('starting_price', __('Starting Price', 'bit-integrations')),
    field('short_description', __('Short Description', 'bit-integrations'))
  ],
  create_location: LocationFields(true),
  update_location: [LocationIdField, ...LocationFields(false)],
  delete_location: [LocationIdField]
}

const dateNote = __(
  'Use the YYYY-MM-DD HH:MM format in the site time zone for dates, for example 2026-12-24 10:00.',
  'bit-integrations'
)
const keepNote = __('Leave a field unmapped to keep its current value.', 'bit-integrations')
const timeNote = __(
  'Use the 24-hour HH:MM format for the opening and closing times. Map both times together.',
  'bit-integrations'
)
const ownEventsNote = __(
  'Changes made by this action do not start VikRentCar triggers.',
  'bit-integrations'
)

export const notesByAction = {
  create_booking: [
    dateNote,
    __(
      'VikRentCar checks that the car is available for the dates. The default status is Confirmed.',
      'bit-integrations'
    ),
    __(
      'VikRentCar saves the customer when the first name, last name and email are all mapped.',
      'bit-integrations'
    ),
    ownEventsNote
  ],
  update_booking: [
    keepNote,
    __(
      'The customer information and the administrator notes replace the current text.',
      'bit-integrations'
    ),
    ownEventsNote
  ],
  confirm_booking: [ownEventsNote],
  cancel_booking: [ownEventsNote],
  update_rental_status: [
    __('Only a confirmed booking has a rental status.', 'bit-integrations'),
    ownEventsNote
  ],
  send_booking_email: [
    __('VikRentCar sends the booking email to the customer email of the booking.', 'bit-integrations')
  ],
  update_car: [keepNote, __('Map a whole number of 1 or more for the units.', 'bit-integrations')],
  create_location: [timeNote],
  update_location: [keepNote, timeNote]
}

export const bookingStatusOptions = [
  { label: __('Confirmed', 'bit-integrations'), value: 'confirmed' },
  { label: __('Standby', 'bit-integrations'), value: 'standby' }
]

export const rentalStatusOptions = [
  { label: __('Not started', 'bit-integrations'), value: '0' },
  { label: __('Started', 'bit-integrations'), value: '1' },
  { label: __('Terminated', 'bit-integrations'), value: '2' },
  { label: __('No show', 'bit-integrations'), value: '-1' }
]

export const availabilityOptions = [
  { label: __('Available', 'bit-integrations'), value: 'available' },
  { label: __('Not available', 'bit-integrations'), value: 'unavailable' }
]

const sendEmailUtility = subTitle => ({
  key: 'send_email',
  checkbox: true,
  value: 'true',
  title: __('Send Email to Customer', 'bit-integrations'),
  subTitle
})

const locationUtility = (key, title, subTitle) => ({
  key,
  optionsKey: 'allLocations',
  title,
  subTitle
})

export const utilitiesByAction = {
  create_booking: [
    {
      key: 'status',
      options: bookingStatusOptions,
      title: __('Status', 'bit-integrations'),
      subTitle: __(
        'Set the booking status. A confirmed booking blocks the car. The default is Confirmed.',
        'bit-integrations'
      )
    },
    locationUtility(
      'pickup_location',
      __('Pick-up Location', 'bit-integrations'),
      __('Select the pick-up location.', 'bit-integrations')
    ),
    locationUtility(
      'return_location',
      __('Drop-off Location', 'bit-integrations'),
      __('Select the drop-off location.', 'bit-integrations')
    ),
    {
      key: 'customer_country',
      optionsKey: 'allCountries',
      title: __('Customer Country', 'bit-integrations'),
      subTitle: __('Select the country of the customer.', 'bit-integrations')
    },
    sendEmailUtility(__('Send the VikRentCar booking email to the customer.', 'bit-integrations'))
  ],
  update_booking: [
    locationUtility(
      'pickup_location',
      __('Pick-up Location', 'bit-integrations'),
      __('Change the pick-up location of the booking.', 'bit-integrations')
    ),
    locationUtility(
      'return_location',
      __('Drop-off Location', 'bit-integrations'),
      __('Change the drop-off location of the booking.', 'bit-integrations')
    )
  ],
  confirm_booking: [
    {
      key: 'ignore_availability',
      checkbox: true,
      value: 'true',
      title: __('Ignore Availability', 'bit-integrations'),
      subTitle: __(
        'Confirm the booking also when the car is not available for the dates.',
        'bit-integrations'
      )
    },
    sendEmailUtility(__('Send the VikRentCar booking email to the customer.', 'bit-integrations'))
  ],
  cancel_booking: [
    sendEmailUtility(__('Send the VikRentCar cancellation email to the customer.', 'bit-integrations'))
  ],
  send_booking_email: [
    {
      key: 'attach_pdf',
      checkbox: true,
      value: 'true',
      title: __('Attach PDF', 'bit-integrations'),
      subTitle: __('Attach the booking PDF. A cancelled booking gets no PDF.', 'bit-integrations')
    }
  ],
  update_car: [
    {
      key: 'availability',
      options: availabilityOptions,
      title: __('Availability', 'bit-integrations'),
      subTitle: __(
        'Set the availability. Customers cannot book a car that is not available.',
        'bit-integrations'
      )
    }
  ]
}

export const needsCar = ['create_booking']

export const needsRentalStatus = ['update_rental_status']
