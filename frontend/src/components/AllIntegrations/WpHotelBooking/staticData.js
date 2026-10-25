import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_booking', label: __('Create Booking', 'bit-integrations'), is_pro: true },
  {
    name: 'update_booking_status',
    label: __('Update Booking Status', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_booking_customer',
    label: __('Update Booking Customer', 'bit-integrations'),
    is_pro: true
  },
  { name: 'update_booking_note', label: __('Update Booking Note', 'bit-integrations'), is_pro: true },
  {
    name: 'mark_payment_complete',
    label: __('Mark Payment Complete', 'bit-integrations'),
    is_pro: true
  },
  { name: 'delete_booking', label: __('Delete Booking', 'bit-integrations'), is_pro: true },
  { name: 'add_room_to_booking', label: __('Add Room to Booking', 'bit-integrations'), is_pro: true },
  { name: 'remove_booking_item', label: __('Remove Booking Item', 'bit-integrations'), is_pro: true },
  { name: 'create_coupon', label: __('Create Coupon', 'bit-integrations'), is_pro: true },
  { name: 'update_coupon', label: __('Update Coupon', 'bit-integrations'), is_pro: true },
  { name: 'delete_coupon', label: __('Delete Coupon', 'bit-integrations'), is_pro: true },
  {
    name: 'apply_coupon_to_booking',
    label: __('Apply Coupon to Booking', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_coupon_from_booking',
    label: __('Remove Coupon from Booking', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_room', label: __('Create Room', 'bit-integrations'), is_pro: true },
  { name: 'update_room', label: __('Update Room', 'bit-integrations'), is_pro: true },
  { name: 'delete_room', label: __('Delete Room', 'bit-integrations'), is_pro: true },
  {
    name: 'set_room_regular_price',
    label: __('Set Room Regular Price', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'add_seasonal_pricing_plan',
    label: __('Add Seasonal Pricing Plan', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_room_type', label: __('Create Room Type', 'bit-integrations'), is_pro: true },
  { name: 'create_extra', label: __('Create Extra', 'bit-integrations'), is_pro: true },
  { name: 'update_extra', label: __('Update Extra', 'bit-integrations'), is_pro: true },
  { name: 'delete_extra', label: __('Delete Extra', 'bit-integrations'), is_pro: true },
  {
    name: 'assign_extras_to_room',
    label: __('Assign Extras to Room', 'bit-integrations'),
    is_pro: true
  },
  { name: 'add_room_review', label: __('Add Room Review', 'bit-integrations'), is_pro: true }
]

const BookingIdField = {
  key: 'booking_id',
  label: __('Booking ID', 'bit-integrations'),
  required: true
}

const RoomIdField = { key: 'room_id', label: __('Room ID', 'bit-integrations'), required: true }

const StayFields = [
  {
    key: 'check_in_date',
    label: __('Check-in Date', 'bit-integrations'),
    required: true
  },
  {
    key: 'check_out_date',
    label: __('Check-out Date', 'bit-integrations'),
    required: true
  },
  { key: 'quantity', label: __('Room Quantity', 'bit-integrations'), required: false },
  { key: 'adults', label: __('Adults', 'bit-integrations'), required: false },
  { key: 'children', label: __('Children', 'bit-integrations'), required: false }
]

const CustomerFields = required => [
  { key: 'customer_email', label: __('Customer Email', 'bit-integrations'), required },
  { key: 'customer_first_name', label: __('Customer First Name', 'bit-integrations'), required },
  { key: 'customer_last_name', label: __('Customer Last Name', 'bit-integrations'), required },
  { key: 'customer_phone', label: __('Customer Phone', 'bit-integrations'), required: false },
  { key: 'customer_address', label: __('Customer Address', 'bit-integrations'), required: false },
  { key: 'customer_city', label: __('Customer City', 'bit-integrations'), required: false },
  { key: 'customer_state', label: __('Customer State', 'bit-integrations'), required: false },
  {
    key: 'customer_postal_code',
    label: __('Customer Postal Code', 'bit-integrations'),
    required: false
  },
  { key: 'customer_country', label: __('Customer Country', 'bit-integrations'), required: false }
]

const CouponFields = required => [
  { key: 'code', label: __('Coupon Code', 'bit-integrations'), required },
  { key: 'discount_value', label: __('Discount Value', 'bit-integrations'), required },
  { key: 'date_from', label: __('Valid From', 'bit-integrations'), required },
  { key: 'date_to', label: __('Valid Until', 'bit-integrations'), required },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'minimum_spend', label: __('Minimum Spend', 'bit-integrations'), required: false },
  { key: 'maximum_spend', label: __('Maximum Spend', 'bit-integrations'), required: false },
  { key: 'usage_limit', label: __('Usage Limit', 'bit-integrations'), required: false }
]

const RoomFields = required => [
  { key: 'title', label: __('Room Name', 'bit-integrations'), required },
  { key: 'num_of_rooms', label: __('Number of Rooms', 'bit-integrations'), required },
  { key: 'max_adults', label: __('Max Adults per Room', 'bit-integrations'), required },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'max_children', label: __('Max Children per Room', 'bit-integrations'), required: false },
  { key: 'beds', label: __('Beds', 'bit-integrations'), required: false },
  { key: 'area', label: __('Area', 'bit-integrations'), required: false },
  { key: 'price', label: __('Regular Price per Night', 'bit-integrations'), required: false },
  { key: 'external_link', label: __('External Link', 'bit-integrations'), required: false },
  {
    key: 'addition_information',
    label: __('Additional Information', 'bit-integrations'),
    required: false
  },
  { key: 'rules', label: __('Room Rules', 'bit-integrations'), required: false }
]

const PriceFields = [
  { key: 'price', label: __('Base Price per Night', 'bit-integrations'), required: true },
  { key: 'sunday_price', label: __('Sunday Price', 'bit-integrations'), required: false },
  { key: 'monday_price', label: __('Monday Price', 'bit-integrations'), required: false },
  { key: 'tuesday_price', label: __('Tuesday Price', 'bit-integrations'), required: false },
  { key: 'wednesday_price', label: __('Wednesday Price', 'bit-integrations'), required: false },
  { key: 'thursday_price', label: __('Thursday Price', 'bit-integrations'), required: false },
  { key: 'friday_price', label: __('Friday Price', 'bit-integrations'), required: false },
  { key: 'saturday_price', label: __('Saturday Price', 'bit-integrations'), required: false }
]

const ExtraFields = required => [
  { key: 'title', label: __('Extra Name', 'bit-integrations'), required },
  { key: 'price', label: __('Price', 'bit-integrations'), required },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'unit', label: __('Unit', 'bit-integrations'), required: false }
]

const optional = fields => fields.map(field => ({ ...field, required: false }))

export const fieldsByAction = {
  create_booking: [
    ...StayFields,
    ...CustomerFields(true),
    { key: 'note', label: __('Booking Note', 'bit-integrations'), required: false }
  ],
  update_booking_status: [BookingIdField],
  update_booking_customer: [BookingIdField, ...CustomerFields(false)],
  update_booking_note: [
    BookingIdField,
    { key: 'note', label: __('Booking Note', 'bit-integrations'), required: true }
  ],
  mark_payment_complete: [
    BookingIdField,
    { key: 'transaction_id', label: __('Transaction ID', 'bit-integrations'), required: false }
  ],
  delete_booking: [BookingIdField],
  add_room_to_booking: [BookingIdField, ...StayFields],
  remove_booking_item: [
    BookingIdField,
    { key: 'order_item_id', label: __('Booking Item ID', 'bit-integrations'), required: true }
  ],
  create_coupon: CouponFields(true),
  update_coupon: [
    { key: 'coupon_id', label: __('Coupon ID', 'bit-integrations'), required: true },
    ...optional(CouponFields(false))
  ],
  delete_coupon: [{ key: 'coupon_id', label: __('Coupon ID', 'bit-integrations'), required: true }],
  apply_coupon_to_booking: [BookingIdField],
  remove_coupon_from_booking: [BookingIdField],
  create_room: RoomFields(true),
  update_room: [RoomIdField, ...optional(RoomFields(false))],
  delete_room: [RoomIdField],
  set_room_regular_price: [RoomIdField, ...PriceFields],
  add_seasonal_pricing_plan: [
    RoomIdField,
    { key: 'start_date', label: __('Start Date', 'bit-integrations'), required: true },
    { key: 'end_date', label: __('End Date', 'bit-integrations'), required: true },
    ...PriceFields
  ],
  create_room_type: [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ],
  create_extra: ExtraFields(true),
  update_extra: [
    { key: 'extra_id', label: __('Extra ID', 'bit-integrations'), required: true },
    ...optional(ExtraFields(false))
  ],
  delete_extra: [{ key: 'extra_id', label: __('Extra ID', 'bit-integrations'), required: true }],
  assign_extras_to_room: [RoomIdField],
  add_room_review: [
    RoomIdField,
    { key: 'author_name', label: __('Reviewer Name', 'bit-integrations'), required: true },
    { key: 'author_email', label: __('Reviewer Email', 'bit-integrations'), required: true },
    { key: 'content', label: __('Review Content', 'bit-integrations'), required: true },
    { key: 'title', label: __('Review Title', 'bit-integrations'), required: false }
  ]
}

export const bookingStatusOptions = [
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Processing', 'bit-integrations'), value: 'processing' },
  { label: __('Completed', 'bit-integrations'), value: 'completed' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' }
]

export const customerTitleOptions = [
  { label: __('Mr.', 'bit-integrations'), value: 'mr' },
  { label: __('Ms.', 'bit-integrations'), value: 'ms' },
  { label: __('Mrs.', 'bit-integrations'), value: 'mrs' },
  { label: __('Miss.', 'bit-integrations'), value: 'miss' },
  { label: __('Dr.', 'bit-integrations'), value: 'dr' },
  { label: __('Prof.', 'bit-integrations'), value: 'prof' }
]

export const discountTypeOptions = [
  { label: __('Cart Discount', 'bit-integrations'), value: 'fixed_cart' },
  { label: __('Cart % Discount', 'bit-integrations'), value: 'percent_cart' }
]

const roomStatusOptions = [
  { label: __('Published', 'bit-integrations'), value: 'publish' },
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Pending Review', 'bit-integrations'), value: 'pending' },
  { label: __('Private', 'bit-integrations'), value: 'private' }
]

const extraTypeOptions = [
  { label: __('Trip', 'bit-integrations'), value: 'trip' },
  { label: __('Number', 'bit-integrations'), value: 'number' }
]

const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'yes' },
  { label: __('No', 'bit-integrations'), value: 'no' }
]

const ratingOptions = [
  { label: __('1 Star', 'bit-integrations'), value: '1' },
  { label: __('2 Stars', 'bit-integrations'), value: '2' },
  { label: __('3 Stars', 'bit-integrations'), value: '3' },
  { label: __('4 Stars', 'bit-integrations'), value: '4' },
  { label: __('5 Stars', 'bit-integrations'), value: '5' }
]

const forceDeleteUtility = record => ({
  key: 'force_delete',
  checkbox: true,
  value: 'true',
  title: __('Delete Permanently', 'bit-integrations'),
  subTitle: record
})

const customerTitleUtility = {
  key: 'customer_title',
  options: customerTitleOptions,
  title: __('Customer Title', 'bit-integrations'),
  subTitle: __('Set the title of the customer.', 'bit-integrations')
}

const roomStatusUtility = {
  key: 'room_status',
  options: roomStatusOptions,
  title: __('Room Status', 'bit-integrations'),
  subTitle: __('Set the publish status of the room.', 'bit-integrations')
}

const roomTypesUtility = {
  key: 'room_types',
  optionsKey: 'allRoomTypes',
  multiple: true,
  title: __('Room Types', 'bit-integrations'),
  subTitle: __('Select the room types of the room.', 'bit-integrations')
}

const extraTypeUtility = {
  key: 'extra_type',
  options: extraTypeOptions,
  title: __('Extra Type', 'bit-integrations'),
  subTitle: __('Select how the plugin counts the extra.', 'bit-integrations')
}

// A checkbox is one-way, so update actions use a Yes/No select to switch a flag on or off.
export const utilitiesByAction = {
  create_booking: [
    customerTitleUtility,
    {
      key: 'booking_status',
      options: bookingStatusOptions,
      title: __('Booking Status', 'bit-integrations'),
      subTitle: __('Set the status of the new booking. The default is Pending.', 'bit-integrations')
    },
    {
      key: 'payment_method',
      optionsKey: 'allPaymentMethods',
      title: __('Payment Method', 'bit-integrations'),
      subTitle: __('Set the payment method of the booking.', 'bit-integrations')
    }
  ],
  update_booking_customer: [customerTitleUtility],
  delete_booking: [
    forceDeleteUtility(__('Skip the trash and delete the booking permanently.', 'bit-integrations'))
  ],
  update_coupon: [
    {
      key: 'discount_type',
      options: discountTypeOptions,
      title: __('Discount Type', 'bit-integrations'),
      subTitle: __('Change the discount type of the coupon.', 'bit-integrations')
    }
  ],
  delete_coupon: [
    forceDeleteUtility(__('Skip the trash and delete the coupon permanently.', 'bit-integrations'))
  ],
  create_room: [
    roomStatusUtility,
    roomTypesUtility,
    {
      key: 'featured',
      checkbox: true,
      value: 'true',
      title: __('Featured', 'bit-integrations'),
      subTitle: __('Add the room to the featured list.', 'bit-integrations')
    }
  ],
  update_room: [
    roomStatusUtility,
    roomTypesUtility,
    {
      key: 'featured',
      options: yesNoOptions,
      title: __('Featured', 'bit-integrations'),
      subTitle: __('Add the room to the featured list or remove it.', 'bit-integrations')
    }
  ],
  delete_room: [
    forceDeleteUtility(__('Skip the trash and delete the room permanently.', 'bit-integrations'))
  ],
  create_room_type: [
    {
      key: 'parent_room_type',
      optionsKey: 'allRoomTypes',
      title: __('Parent Room Type', 'bit-integrations'),
      subTitle: __('Put the new room type under a parent room type.', 'bit-integrations')
    }
  ],
  create_extra: [
    extraTypeUtility,
    {
      key: 'required',
      checkbox: true,
      value: 'true',
      title: __('Required', 'bit-integrations'),
      subTitle: __('Add this extra to each booking of a room that has it.', 'bit-integrations')
    }
  ],
  update_extra: [
    extraTypeUtility,
    {
      key: 'required',
      options: yesNoOptions,
      title: __('Required', 'bit-integrations'),
      subTitle: __('Make the extra required or optional.', 'bit-integrations')
    }
  ],
  delete_extra: [
    forceDeleteUtility(__('Skip the trash and delete the extra permanently.', 'bit-integrations'))
  ],
  assign_extras_to_room: [
    {
      key: 'replace_extras',
      checkbox: true,
      value: 'true',
      title: __('Replace Extras', 'bit-integrations'),
      subTitle: __(
        'Replace the current extras of the room. Clear it to add the extras.',
        'bit-integrations'
      )
    }
  ],
  add_room_review: [
    {
      key: 'rating',
      options: ratingOptions,
      title: __('Rating', 'bit-integrations'),
      subTitle: __('Set the star rating of the review.', 'bit-integrations')
    },
    {
      key: 'hold_for_moderation',
      checkbox: true,
      value: 'true',
      title: __('Hold for Moderation', 'bit-integrations'),
      subTitle: __('Save the review as pending. Clear it to approve the review.', 'bit-integrations')
    }
  ]
}

export const needsRoom = ['create_booking', 'add_room_to_booking']

export const needsBookingStatus = ['update_booking_status']

export const needsDiscountType = ['create_coupon']

export const needsCoupon = ['apply_coupon_to_booking']

export const needsExtras = ['assign_extras_to_room']

export const dateFieldActions = [
  'create_booking',
  'add_room_to_booking',
  'create_coupon',
  'update_coupon',
  'add_seasonal_pricing_plan'
]
