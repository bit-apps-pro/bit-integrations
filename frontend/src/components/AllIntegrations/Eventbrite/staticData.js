import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_event', label: __('Create Event', 'bit-integrations'), is_pro: true },
  { name: 'update_event', label: __('Update Event', 'bit-integrations'), is_pro: true },
  { name: 'copy_event', label: __('Copy Event', 'bit-integrations'), is_pro: true },
  { name: 'publish_event', label: __('Publish Event', 'bit-integrations'), is_pro: true },
  { name: 'unpublish_event', label: __('Unpublish Event', 'bit-integrations'), is_pro: true },
  { name: 'cancel_event', label: __('Cancel Event', 'bit-integrations'), is_pro: true },
  { name: 'delete_event', label: __('Delete Event', 'bit-integrations'), is_pro: true },
  {
    name: 'create_event_schedule',
    label: __('Add Dates to Recurring Event', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_display_settings',
    label: __('Update Event Display Settings', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_capacity_tier',
    label: __('Update Event Capacity', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_ticket_buyer_settings',
    label: __('Update Ticket Buyer Settings', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'set_event_description',
    label: __('Set Event Description', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_ticket_class', label: __('Create Ticket Class', 'bit-integrations'), is_pro: true },
  { name: 'update_ticket_class', label: __('Update Ticket Class', 'bit-integrations'), is_pro: true },
  { name: 'create_ticket_group', label: __('Create Ticket Group', 'bit-integrations'), is_pro: true },
  { name: 'update_ticket_group', label: __('Update Ticket Group', 'bit-integrations'), is_pro: true },
  {
    name: 'set_ticket_class_ticket_groups',
    label: __('Set Ticket Groups for Ticket Class', 'bit-integrations'),
    is_pro: true
  },
  { name: 'delete_ticket_group', label: __('Delete Ticket Group', 'bit-integrations'), is_pro: true },
  {
    name: 'create_inventory_tier',
    label: __('Create Inventory Tier', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_inventory_tier',
    label: __('Update Inventory Tier', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_inventory_tier',
    label: __('Delete Inventory Tier', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_custom_question',
    label: __('Create Custom Question', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_custom_question',
    label: __('Delete Custom Question', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_default_question',
    label: __('Add Default Question', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_default_question',
    label: __('Update Default Question', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_default_question',
    label: __('Remove Default Question', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_discount', label: __('Create Discount', 'bit-integrations'), is_pro: true },
  { name: 'update_discount', label: __('Update Discount', 'bit-integrations'), is_pro: true },
  { name: 'delete_discount', label: __('Delete Discount', 'bit-integrations'), is_pro: true },
  { name: 'create_venue', label: __('Create Venue', 'bit-integrations'), is_pro: true },
  { name: 'update_venue', label: __('Update Venue', 'bit-integrations'), is_pro: true },
  { name: 'create_text_override', label: __('Create Text Override', 'bit-integrations'), is_pro: true },
  { name: 'create_seat_map', label: __('Create Seat Map for Event', 'bit-integrations'), is_pro: true },
  { name: 'upload_image', label: __('Upload Image', 'bit-integrations'), is_pro: true }
]

const supportedValues = key =>
  typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf(key)
    : []

const toOptions = values => values.map(value => ({ label: value, value }))

export const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'true' },
  { label: __('No', 'bit-integrations'), value: 'false' }
]

export const timezoneOptions = toOptions([
  'UTC',
  ...supportedValues('timeZone').filter(timezone => timezone !== 'UTC')
])

export const currencyOptions = toOptions(
  supportedValues('currency').length
    ? supportedValues('currency')
    : ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'INR', 'JPY', 'BRL', 'MXN', 'SGD', 'HKD', 'CHF']
)

export const localeOptions = [
  { label: __('German (Austria)', 'bit-integrations'), value: 'de_AT' },
  { label: __('German (Switzerland)', 'bit-integrations'), value: 'de_CH' },
  { label: __('German (Germany)', 'bit-integrations'), value: 'de_DE' },
  { label: __('English (Australia)', 'bit-integrations'), value: 'en_AU' },
  { label: __('English (Canada)', 'bit-integrations'), value: 'en_CA' },
  { label: __('English (Denmark)', 'bit-integrations'), value: 'en_DK' },
  { label: __('English (Finland)', 'bit-integrations'), value: 'en_FI' },
  { label: __('English (United Kingdom)', 'bit-integrations'), value: 'en_GB' },
  { label: __('English (Hong Kong)', 'bit-integrations'), value: 'en_HK' },
  { label: __('English (Ireland)', 'bit-integrations'), value: 'en_IE' },
  { label: __('English (India)', 'bit-integrations'), value: 'en_IN' },
  { label: __('English (New Zealand)', 'bit-integrations'), value: 'en_NZ' },
  { label: __('English (Sweden)', 'bit-integrations'), value: 'en_SE' },
  { label: __('English (United States)', 'bit-integrations'), value: 'en_US' },
  { label: __('Spanish (Argentina)', 'bit-integrations'), value: 'es_AR' },
  { label: __('Spanish (Chile)', 'bit-integrations'), value: 'es_CL' },
  { label: __('Spanish (Colombia)', 'bit-integrations'), value: 'es_CO' },
  { label: __('Spanish (Spain)', 'bit-integrations'), value: 'es_ES' },
  { label: __('French (Belgium)', 'bit-integrations'), value: 'fr_BE' },
  { label: __('French (Canada)', 'bit-integrations'), value: 'fr_CA' },
  { label: __('French (Switzerland)', 'bit-integrations'), value: 'fr_CH' },
  { label: __('French (France)', 'bit-integrations'), value: 'fr_FR' },
  { label: __('Hindi (India)', 'bit-integrations'), value: 'hi_IN' },
  { label: __('Italian (Italy)', 'bit-integrations'), value: 'it_IT' },
  { label: __('Dutch (Belgium)', 'bit-integrations'), value: 'nl_BE' },
  { label: __('Dutch (Netherlands)', 'bit-integrations'), value: 'nl_NL' },
  { label: __('Portuguese (Brazil)', 'bit-integrations'), value: 'pt_BR' },
  { label: __('Portuguese (Portugal)', 'bit-integrations'), value: 'pt_PT' }
]

const ticketTypeOptions = [
  { label: __('Paid', 'bit-integrations'), value: 'paid' },
  { label: __('Free', 'bit-integrations'), value: 'free' },
  { label: __('Donation', 'bit-integrations'), value: 'donation' }
]

const questionTypeOptions = [
  { label: __('Checkbox', 'bit-integrations'), value: 'checkbox' },
  { label: __('Dropdown', 'bit-integrations'), value: 'dropdown' },
  { label: __('Text', 'bit-integrations'), value: 'text' },
  { label: __('Paragraph', 'bit-integrations'), value: 'paragraph' },
  { label: __('Radio', 'bit-integrations'), value: 'radio' },
  { label: __('Waiver', 'bit-integrations'), value: 'waiver' }
]

const cannedQuestionOptions = [
  { label: __('Prefix', 'bit-integrations'), value: 'prefix' },
  { label: __('First name', 'bit-integrations'), value: 'first_name' },
  { label: __('Last name', 'bit-integrations'), value: 'last_name' },
  { label: __('Suffix', 'bit-integrations'), value: 'suffix' },
  { label: __('Email address', 'bit-integrations'), value: 'email' },
  { label: __('Home phone', 'bit-integrations'), value: 'home_phone' },
  { label: __('Cell phone', 'bit-integrations'), value: 'cell_phone' },
  { label: __('Tax and business info', 'bit-integrations'), value: 'tax_info' },
  { label: __('Billing address', 'bit-integrations'), value: 'bill' },
  { label: __('Card info', 'bit-integrations'), value: 'cc' },
  { label: __('Home address', 'bit-integrations'), value: 'home' },
  { label: __('Shipping address', 'bit-integrations'), value: 'ship' },
  { label: __('Job title', 'bit-integrations'), value: 'job_title' },
  { label: __('Company / organization', 'bit-integrations'), value: 'company' },
  { label: __('Work address', 'bit-integrations'), value: 'work' },
  { label: __('Work phone', 'bit-integrations'), value: 'work_phone' },
  { label: __('Website', 'bit-integrations'), value: 'website' },
  { label: __('Blog', 'bit-integrations'), value: 'blog' },
  { label: __('Gender', 'bit-integrations'), value: 'sex' },
  { label: __('Birth date', 'bit-integrations'), value: 'birth_date' },
  { label: __('Age', 'bit-integrations'), value: 'age' }
]

const discountTypeOptions = [
  { label: __('Coded discount (secret code)', 'bit-integrations'), value: 'coded' },
  { label: __('Access code (unlocks hidden tickets)', 'bit-integrations'), value: 'access' },
  { label: __('Public discount', 'bit-integrations'), value: 'public' },
  { label: __('Hold discount', 'bit-integrations'), value: 'hold' }
]

const frequencyOptions = [
  { label: __('Daily', 'bit-integrations'), value: 'DAILY' },
  { label: __('Weekly', 'bit-integrations'), value: 'WEEKLY' },
  { label: __('Monthly', 'bit-integrations'), value: 'MONTHLY' }
]

const weekdayOptions = [
  { label: __('Monday', 'bit-integrations'), value: 'MO' },
  { label: __('Tuesday', 'bit-integrations'), value: 'TU' },
  { label: __('Wednesday', 'bit-integrations'), value: 'WE' },
  { label: __('Thursday', 'bit-integrations'), value: 'TH' },
  { label: __('Friday', 'bit-integrations'), value: 'FR' },
  { label: __('Saturday', 'bit-integrations'), value: 'SA' },
  { label: __('Sunday', 'bit-integrations'), value: 'SU' }
]

const textCodeOptions = [
  { label: __('Tickets not yet on sale', 'bit-integrations'), value: 'tickets_not_yet_on_sale' },
  { label: __('Tickets with sales ended', 'bit-integrations'), value: 'tickets_with_sales_ended' },
  { label: __('Tickets sold out', 'bit-integrations'), value: 'tickets_sold_out' },
  { label: __('Tickets unavailable', 'bit-integrations'), value: 'tickets_unavailable' },
  { label: __('Tickets at the door', 'bit-integrations'), value: 'tickets_at_the_door' },
  { label: __('Event cancelled', 'bit-integrations'), value: 'event_cancelled' },
  { label: __('Event postponed', 'bit-integrations'), value: 'event_postponed' },
  { label: __('Checkout title: tickets', 'bit-integrations'), value: 'checkout_title_tickets' },
  { label: __('Checkout title: add-ons', 'bit-integrations'), value: 'checkout_title_add_ons' },
  { label: __('Checkout title: donations', 'bit-integrations'), value: 'checkout_title_donations' }
]

const imageTypeOptions = [
  { label: __('Event logo', 'bit-integrations'), value: 'image-event-logo' },
  {
    label: __('Event logo (preserve quality)', 'bit-integrations'),
    value: 'image-event-logo-preserve-quality'
  },
  { label: __('View from seat', 'bit-integrations'), value: 'image-event-view-from-seat' },
  { label: __('Organizer logo', 'bit-integrations'), value: 'image-organizer-logo' },
  { label: __('User photo', 'bit-integrations'), value: 'image-user-photo' },
  { label: __('Description image', 'bit-integrations'), value: 'image-structured-content' }
]

const ageRestrictionOptions = [
  { label: __('All ages', 'bit-integrations'), value: 'AGE_RESTRICTION_ALL_AGES' },
  { label: __('12+', 'bit-integrations'), value: 'AGE_RESTRICTION_MIN_TWELVE' },
  { label: __('13+', 'bit-integrations'), value: 'AGE_RESTRICTION_MIN_THIRTEEN' },
  { label: __('14+', 'bit-integrations'), value: 'AGE_RESTRICTION_MIN_FOURTEEN' },
  { label: __('15+', 'bit-integrations'), value: 'AGE_RESTRICTION_MIN_FIFTEEN' },
  { label: __('16+', 'bit-integrations'), value: 'AGE_RESTRICTION_MIN_SIXTEEN' },
  { label: __('17+', 'bit-integrations'), value: 'AGE_RESTRICTION_MIN_SEVENTEEN' },
  { label: __('18+', 'bit-integrations'), value: 'AGE_RESTRICTION_MIN_EIGHTEEN' },
  { label: __('19+', 'bit-integrations'), value: 'AGE_RESTRICTION_MIN_NINETEEN' },
  { label: __('21+', 'bit-integrations'), value: 'AGE_RESTRICTION_MIN_TWENTY_ONE' },
  {
    label: __('Under 21 with guardian', 'bit-integrations'),
    value: 'AGE_RESTRICTION_UNDER_TWENTY_ONE_WITH_GUARDIAN'
  },
  {
    label: __('Under 18 with guardian', 'bit-integrations'),
    value: 'AGE_RESTRICTION_UNDER_EIGHTEEN_WITH_GUARDIAN'
  }
]

const ticketGroupStatusOptions = [
  { label: __('Live', 'bit-integrations'), value: 'live' },
  { label: __('Archived', 'bit-integrations'), value: 'archived' }
]

const salesChannelOptions = [
  { label: __('Online', 'bit-integrations'), value: 'online' },
  { label: __('At the door', 'bit-integrations'), value: 'atd' }
]

const deliveryMethodOptions = [
  { label: __('Electronic', 'bit-integrations'), value: 'electronic' },
  { label: __('Will call', 'bit-integrations'), value: 'will_call' },
  { label: __('Standard shipping', 'bit-integrations'), value: 'standard_shipping' },
  { label: __('Third party shipping', 'bit-integrations'), value: 'third_party_shipping' }
]

const respondentOptions = [
  { label: __('Ticket buyer', 'bit-integrations'), value: 'ticket_buyer' },
  { label: __('Each attendee', 'bit-integrations'), value: 'attendee' }
]

const terminologyOptions = [
  { label: __('Tickets', 'bit-integrations'), value: 'tickets_vertical' },
  { label: __('Endurance (races)', 'bit-integrations'), value: 'endurance_vertical' }
]

const alignmentOptions = [
  { label: __('Left', 'bit-integrations'), value: 'left' },
  { label: __('Center', 'bit-integrations'), value: 'center' },
  { label: __('Right', 'bit-integrations'), value: 'right' }
]

const purposeOptions = [
  { label: __('Event listing description', 'bit-integrations'), value: 'listing' },
  { label: __('Online event page', 'bit-integrations'), value: 'digital_content' }
]

const accessTypeOptions = [
  { label: __('Public', 'bit-integrations'), value: 'public' },
  { label: __('Private (ticket holders)', 'bit-integrations'), value: 'private' }
]

const eventIdField = {
  key: 'event_id',
  label: __('Event ID', 'bit-integrations'),
  required: true
}

const eventDetailFields = [
  { key: 'summary', label: __('Summary (up to 140 characters)', 'bit-integrations'), required: false },
  { key: 'capacity', label: __('Capacity', 'bit-integrations'), required: false },
  { key: 'password', label: __('Password', 'bit-integrations'), required: false },
  { key: 'organizer_id', label: __('Organizer ID', 'bit-integrations'), required: false },
  { key: 'logo_id', label: __('Logo Image ID', 'bit-integrations'), required: false }
]

const ticketClassFields = [
  { key: 'cost', label: __('Price (e.g. 45.00)', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'capacity', label: __('Quantity', 'bit-integrations'), required: false },
  { key: 'minimum_quantity', label: __('Minimum Per Order', 'bit-integrations'), required: false },
  { key: 'maximum_quantity', label: __('Maximum Per Order', 'bit-integrations'), required: false },
  {
    key: 'sales_start',
    label: __('Sales Start (e.g. 2026-12-01 09:00)', 'bit-integrations'),
    required: false
  },
  {
    key: 'sales_end',
    label: __('Sales End (e.g. 2026-12-01 09:00)', 'bit-integrations'),
    required: false
  },
  {
    key: 'order_confirmation_message',
    label: __('Order Confirmation Message', 'bit-integrations'),
    required: false
  },
  { key: 'sorting', label: __('Sort Order', 'bit-integrations'), required: false }
]

const discountFields = [
  { key: 'amount_off', label: __('Amount Off (e.g. 5.00)', 'bit-integrations'), required: false },
  { key: 'percent_off', label: __('Percent Off (e.g. 10)', 'bit-integrations'), required: false },
  {
    key: 'quantity_available',
    label: __('Usage Limit (0 means unlimited)', 'bit-integrations'),
    required: false
  },
  {
    key: 'start_date',
    label: __('Valid From (event time, e.g. 2026-12-01 09:00)', 'bit-integrations'),
    required: false
  },
  {
    key: 'end_date',
    label: __('Valid Until (event time, e.g. 2026-12-10 18:00)', 'bit-integrations'),
    required: false
  },
  {
    key: 'start_date_relative',
    label: __('Valid From (seconds before the event starts)', 'bit-integrations'),
    required: false
  },
  {
    key: 'end_date_relative',
    label: __('Valid Until (seconds before the event starts)', 'bit-integrations'),
    required: false
  }
]

const venueFields = [
  { key: 'address_1', label: __('Address Line 1', 'bit-integrations'), required: false },
  { key: 'address_2', label: __('Address Line 2', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'region', label: __('State / Region', 'bit-integrations'), required: false },
  { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country (2-letter code, e.g. US)', 'bit-integrations'), required: false },
  { key: 'latitude', label: __('Latitude', 'bit-integrations'), required: false },
  { key: 'longitude', label: __('Longitude', 'bit-integrations'), required: false },
  { key: 'capacity', label: __('Capacity', 'bit-integrations'), required: false },
  { key: 'google_place_id', label: __('Google Place ID', 'bit-integrations'), required: false },
  { key: 'organizer_id', label: __('Organizer ID', 'bit-integrations'), required: false }
]

const inventoryTierFields = [
  { key: 'sort_order', label: __('Sort Order', 'bit-integrations'), required: false },
  { key: 'color', label: __('Color (hex, e.g. #FF8000)', 'bit-integrations'), required: false },
  { key: 'image_id', label: __('Image ID', 'bit-integrations'), required: false }
]

export const fieldsByAction = {
  create_event: [
    { key: 'name', label: __('Event Name', 'bit-integrations'), required: true },
    {
      key: 'start',
      label: __('Start Date & Time (e.g. 2026-12-01 19:00)', 'bit-integrations'),
      required: true
    },
    {
      key: 'end',
      label: __('End Date & Time (e.g. 2026-12-01 22:00)', 'bit-integrations'),
      required: true
    },
    ...eventDetailFields
  ],
  update_event: [
    eventIdField,
    { key: 'name', label: __('Event Name', 'bit-integrations'), required: false },
    {
      key: 'start',
      label: __('Start Date & Time (e.g. 2026-12-01 19:00)', 'bit-integrations'),
      required: false
    },
    {
      key: 'end',
      label: __('End Date & Time (e.g. 2026-12-01 22:00)', 'bit-integrations'),
      required: false
    },
    ...eventDetailFields
  ],
  copy_event: [
    { key: 'event_id', label: __('Event ID to Copy', 'bit-integrations'), required: true },
    { key: 'name', label: __('New Event Name', 'bit-integrations'), required: false },
    { key: 'summary', label: __('New Summary', 'bit-integrations'), required: false },
    {
      key: 'start',
      label: __('New Start Date & Time (e.g. 2026-12-01 19:00)', 'bit-integrations'),
      required: false
    },
    {
      key: 'end',
      label: __('New End Date & Time (e.g. 2026-12-01 22:00)', 'bit-integrations'),
      required: false
    }
  ],
  publish_event: [eventIdField],
  unpublish_event: [eventIdField],
  cancel_event: [eventIdField],
  delete_event: [eventIdField],
  create_event_schedule: [
    {
      key: 'series_id',
      label: __('Recurring Event (Series Parent) ID', 'bit-integrations'),
      required: true
    },
    {
      key: 'start_date',
      label: __('First Date & Time (e.g. 2026-12-08 18:00)', 'bit-integrations'),
      required: true
    },
    { key: 'duration_minutes', label: __('Duration (minutes)', 'bit-integrations'), required: true },
    { key: 'interval', label: __('Repeat Every (default 1)', 'bit-integrations'), required: false },
    { key: 'count', label: __('Number of Dates', 'bit-integrations'), required: false },
    {
      key: 'until',
      label: __('Repeat Until (e.g. 2027-03-31)', 'bit-integrations'),
      required: false
    },
    {
      key: 'recurrence_rule',
      label: __('Custom Recurrence Rule (advanced, replaces the fields above)', 'bit-integrations'),
      required: false
    }
  ],
  update_display_settings: [eventIdField],
  update_capacity_tier: [
    eventIdField,
    { key: 'capacity_total', label: __('Total Capacity', 'bit-integrations'), required: false },
    { key: 'hold_name', label: __('Hold Name', 'bit-integrations'), required: false },
    { key: 'hold_quantity', label: __('Hold Quantity', 'bit-integrations'), required: false },
    {
      key: 'hold_id',
      label: __('Hold ID (to update an existing hold)', 'bit-integrations'),
      required: false
    }
  ],
  update_ticket_buyer_settings: [
    eventIdField,
    {
      key: 'confirmation_message',
      label: __('Confirmation Message (HTML)', 'bit-integrations'),
      required: false
    },
    {
      key: 'instructions',
      label: __('Ticket Instructions (HTML)', 'bit-integrations'),
      required: false
    },
    {
      key: 'sales_ended_message',
      label: __('Sales Ended Message (HTML)', 'bit-integrations'),
      required: false
    },
    { key: 'redirect_url', label: __('Redirect URL', 'bit-integrations'), required: false },
    { key: 'survey_name', label: __('Registration Page Title', 'bit-integrations'), required: false },
    {
      key: 'survey_info',
      label: __('Registration Page Message (HTML)', 'bit-integrations'),
      required: false
    },
    {
      key: 'survey_time_limit',
      label: __('Registration Time Limit (minutes)', 'bit-integrations'),
      required: false
    },
    {
      key: 'survey_ticket_classes',
      label: __('Collect Information For (ticket class IDs, comma separated)', 'bit-integrations'),
      required: false
    }
  ],
  set_event_description: [
    eventIdField,
    { key: 'description', label: __('Description (HTML)', 'bit-integrations'), required: false },
    { key: 'image_id', label: __('Image ID', 'bit-integrations'), required: false },
    { key: 'video_url', label: __('Video URL', 'bit-integrations'), required: false }
  ],
  create_ticket_class: [
    eventIdField,
    { key: 'name', label: __('Ticket Name', 'bit-integrations'), required: true },
    ...ticketClassFields,
    { key: 'inventory_tier_id', label: __('Inventory Tier ID', 'bit-integrations'), required: false }
  ],
  update_ticket_class: [
    eventIdField,
    { key: 'ticket_class_id', label: __('Ticket Class ID', 'bit-integrations'), required: true },
    { key: 'name', label: __('Ticket Name', 'bit-integrations'), required: false },
    ...ticketClassFields
  ],
  create_ticket_group: [
    { key: 'name', label: __('Group Name', 'bit-integrations'), required: true },
    { key: 'event_id', label: __('Event ID', 'bit-integrations'), required: false },
    {
      key: 'ticket_class_ids',
      label: __('Ticket Class IDs of that event (comma separated)', 'bit-integrations'),
      required: false
    }
  ],
  update_ticket_group: [
    { key: 'ticket_group_id', label: __('Ticket Group ID', 'bit-integrations'), required: true },
    { key: 'name', label: __('Group Name', 'bit-integrations'), required: false },
    { key: 'event_id', label: __('Event ID', 'bit-integrations'), required: false },
    {
      key: 'ticket_class_ids',
      label: __('Ticket Class IDs of that event (comma separated)', 'bit-integrations'),
      required: false
    }
  ],
  set_ticket_class_ticket_groups: [
    eventIdField,
    { key: 'ticket_class_id', label: __('Ticket Class ID', 'bit-integrations'), required: true }
  ],
  delete_ticket_group: [
    { key: 'ticket_group_id', label: __('Ticket Group ID', 'bit-integrations'), required: true }
  ],
  create_inventory_tier: [
    eventIdField,
    { key: 'name', label: __('Tier Name', 'bit-integrations'), required: true },
    { key: 'quantity_total', label: __('Quantity', 'bit-integrations'), required: true },
    ...inventoryTierFields,
    { key: 'seatmap_number', label: __('Seat Map Number', 'bit-integrations'), required: false },
    { key: 'tier', label: __('Tier Level', 'bit-integrations'), required: false }
  ],
  update_inventory_tier: [
    eventIdField,
    { key: 'inventory_tier_id', label: __('Inventory Tier ID', 'bit-integrations'), required: true },
    { key: 'name', label: __('Tier Name', 'bit-integrations'), required: false },
    { key: 'quantity_total', label: __('Quantity', 'bit-integrations'), required: false },
    { key: 'capacity_total', label: __('Capacity', 'bit-integrations'), required: false },
    ...inventoryTierFields
  ],
  delete_inventory_tier: [
    eventIdField,
    { key: 'inventory_tier_id', label: __('Inventory Tier ID', 'bit-integrations'), required: true }
  ],
  create_custom_question: [
    eventIdField,
    { key: 'question', label: __('Question', 'bit-integrations'), required: true },
    {
      key: 'choices',
      label: __('Choices (comma separated, for checkbox, dropdown and radio)', 'bit-integrations'),
      required: false
    },
    {
      key: 'waiver',
      label: __('Waiver Text (waiver questions only)', 'bit-integrations'),
      required: false
    },
    {
      key: 'ticket_class_ids',
      label: __('Ask Only For Ticket Class IDs (comma separated)', 'bit-integrations'),
      required: false
    },
    { key: 'parent_id', label: __('Parent Question ID', 'bit-integrations'), required: false },
    { key: 'parent_choice_id', label: __('Parent Choice ID', 'bit-integrations'), required: false }
  ],
  delete_custom_question: [
    eventIdField,
    { key: 'question_id', label: __('Question ID', 'bit-integrations'), required: true }
  ],
  create_default_question: [eventIdField],
  update_default_question: [eventIdField],
  delete_default_question: [eventIdField],
  create_discount: [
    { key: 'code', label: __('Code (or public discount name)', 'bit-integrations'), required: true },
    ...discountFields,
    { key: 'hold_ids', label: __('Hold IDs (comma separated)', 'bit-integrations'), required: false }
  ],
  update_discount: [
    { key: 'discount_id', label: __('Discount ID', 'bit-integrations'), required: true },
    { key: 'code', label: __('Code', 'bit-integrations'), required: false },
    ...discountFields,
    {
      key: 'ticket_class_ids',
      label: __('Ticket Class IDs (comma separated)', 'bit-integrations'),
      required: false
    }
  ],
  delete_discount: [
    { key: 'discount_id', label: __('Discount ID', 'bit-integrations'), required: true }
  ],
  create_venue: [
    { key: 'name', label: __('Venue Name', 'bit-integrations'), required: true },
    ...venueFields
  ],
  update_venue: [
    { key: 'venue_id', label: __('Venue ID', 'bit-integrations'), required: true },
    { key: 'name', label: __('Venue Name', 'bit-integrations'), required: false },
    ...venueFields
  ],
  create_text_override: [
    { key: 'message', label: __('Custom Message', 'bit-integrations'), required: true },
    {
      key: 'event_id',
      label: __('Event ID (override one event only)', 'bit-integrations'),
      required: false
    }
  ],
  create_seat_map: [
    eventIdField,
    { key: 'source_seatmap_id', label: __('Seat Map ID to Copy', 'bit-integrations'), required: true }
  ],
  upload_image: [
    { key: 'image_url', label: __('Image URL', 'bit-integrations'), required: true },
    { key: 'crop_x', label: __('Crop Left (px)', 'bit-integrations'), required: false },
    { key: 'crop_y', label: __('Crop Top (px)', 'bit-integrations'), required: false },
    { key: 'crop_width', label: __('Crop Width (px)', 'bit-integrations'), required: false },
    { key: 'crop_height', label: __('Crop Height (px)', 'bit-integrations'), required: false }
  ]
}

const organizationSelect = {
  key: 'organization_id',
  label: __('Organization', 'bit-integrations'),
  source: 'organizations',
  required: true
}

const venueSelect = {
  key: 'venue_id',
  label: __('Venue', 'bit-integrations'),
  source: 'venues',
  dependsOn: 'organization_id'
}

const categorySelects = [
  { key: 'category_id', label: __('Category', 'bit-integrations'), source: 'categories' },
  {
    key: 'subcategory_id',
    label: __('Subcategory', 'bit-integrations'),
    source: 'subcategories',
    dependsOn: 'category_id'
  },
  { key: 'format_id', label: __('Format', 'bit-integrations'), source: 'formats' }
]

const cannedTypeSelect = {
  key: 'canned_type',
  label: __('Default Question', 'bit-integrations'),
  options: cannedQuestionOptions,
  required: true
}

export const selectsByAction = {
  create_event: [
    organizationSelect,
    {
      key: 'timezone',
      label: __('Time Zone', 'bit-integrations'),
      options: timezoneOptions,
      required: true
    },
    {
      key: 'currency',
      label: __('Currency', 'bit-integrations'),
      options: currencyOptions,
      required: true
    },
    venueSelect,
    ...categorySelects
  ],
  update_event: [venueSelect, ...categorySelects],
  create_event_schedule: [
    {
      key: 'frequency',
      label: __('Repeat', 'bit-integrations'),
      options: frequencyOptions,
      required: true
    }
  ],
  create_ticket_class: [
    {
      key: 'ticket_type',
      label: __('Ticket Type', 'bit-integrations'),
      options: ticketTypeOptions,
      required: true
    }
  ],
  create_ticket_group: [organizationSelect],
  set_ticket_class_ticket_groups: [
    organizationSelect,
    {
      key: 'ticket_group_ids',
      label: __('Ticket Groups (empty removes it from all)', 'bit-integrations'),
      source: 'ticketGroups',
      dependsOn: 'organization_id',
      multi: true
    }
  ],
  create_custom_question: [
    {
      key: 'question_type',
      label: __('Answer Type', 'bit-integrations'),
      options: questionTypeOptions,
      required: true
    }
  ],
  create_default_question: [cannedTypeSelect],
  update_default_question: [
    cannedTypeSelect,
    {
      key: 'is_required',
      label: __('Required', 'bit-integrations'),
      options: yesNoOptions,
      required: true
    }
  ],
  delete_default_question: [cannedTypeSelect],
  create_discount: [
    organizationSelect,
    {
      key: 'discount_type',
      label: __('Discount Type', 'bit-integrations'),
      options: discountTypeOptions,
      required: true
    },
    {
      key: 'event_id',
      label: __('Event (empty for every event)', 'bit-integrations'),
      source: 'events',
      dependsOn: 'organization_id'
    },
    {
      key: 'ticket_class_ids',
      label: __('Ticket Classes', 'bit-integrations'),
      source: 'ticketClasses',
      dependsOn: 'event_id',
      multi: true
    },
    {
      key: 'ticket_group_id',
      label: __('Ticket Group', 'bit-integrations'),
      source: 'ticketGroups',
      dependsOn: 'organization_id'
    }
  ],
  create_venue: [organizationSelect],
  create_text_override: [
    organizationSelect,
    {
      key: 'text_code',
      label: __('Text to Override', 'bit-integrations'),
      options: textCodeOptions,
      required: true
    },
    {
      key: 'venue_id',
      label: __('Venue (override one venue only)', 'bit-integrations'),
      source: 'venues',
      dependsOn: 'organization_id'
    }
  ],
  upload_image: [
    {
      key: 'image_type',
      label: __('Image Type', 'bit-integrations'),
      options: imageTypeOptions,
      required: true
    }
  ]
}

const checkboxUtility = (key, title, subTitle, value = 'true') => ({
  checkbox: true,
  key,
  subTitle,
  title,
  value
})

const eventFlagUtilities = [
  checkboxUtility(
    'online_event',
    __('Online Event', 'bit-integrations'),
    __('Online events have no venue', 'bit-integrations')
  ),
  checkboxUtility(
    'listed',
    __('Unlisted', 'bit-integrations'),
    __('Hide the event from Eventbrite search', 'bit-integrations'),
    'false'
  ),
  checkboxUtility(
    'shareable',
    __('Show Share Buttons', 'bit-integrations'),
    __('Show social sharing buttons', 'bit-integrations')
  ),
  checkboxUtility(
    'invite_only',
    __('Invite Only', 'bit-integrations'),
    __('Only invited people can register', 'bit-integrations')
  ),
  checkboxUtility(
    'show_remaining',
    __('Show Remaining Tickets', 'bit-integrations'),
    __('Show how many tickets are left', 'bit-integrations')
  ),
  checkboxUtility(
    'is_reserved_seating',
    __('Reserved Seating', 'bit-integrations'),
    __('Use a seat map for this event', 'bit-integrations')
  ),
  checkboxUtility(
    'is_series',
    __('Recurring Event', 'bit-integrations'),
    __('Create a series parent, then add dates', 'bit-integrations')
  ),
  checkboxUtility(
    'hide_start_date',
    __('Hide Start Date', 'bit-integrations'),
    __('Hide the start date on the event page', 'bit-integrations')
  ),
  checkboxUtility(
    'hide_end_date',
    __('Hide End Date', 'bit-integrations'),
    __('Hide the end date on the event page', 'bit-integrations')
  )
]

const timezoneUtility = {
  key: 'timezone',
  options: timezoneOptions,
  subTitle: __('Time zone of the dates you map', 'bit-integrations'),
  title: __('Time Zone', 'bit-integrations')
}

const ticketClassUtilities = [
  checkboxUtility(
    'hidden',
    __('Hidden', 'bit-integrations'),
    __('Hide this ticket from buyers', 'bit-integrations')
  ),
  checkboxUtility(
    'auto_hide',
    __('Hide When Not On Sale', 'bit-integrations'),
    __('Hide outside the sales window', 'bit-integrations')
  ),
  checkboxUtility(
    'include_fee',
    __('Absorb Fees', 'bit-integrations'),
    __('Include fees in the price', 'bit-integrations')
  ),
  checkboxUtility(
    'hide_description',
    __('Hide Description', 'bit-integrations'),
    __('Hide the ticket description', 'bit-integrations')
  ),
  {
    key: 'sales_channels',
    multi: true,
    options: salesChannelOptions,
    subTitle: __('Where the ticket is sold', 'bit-integrations'),
    title: __('Sales Channels', 'bit-integrations')
  },
  {
    key: 'delivery_methods',
    multi: true,
    options: deliveryMethodOptions,
    subTitle: __('How the ticket is delivered', 'bit-integrations'),
    title: __('Delivery Methods', 'bit-integrations')
  }
]

const ticketGroupStatusUtility = {
  key: 'status',
  options: ticketGroupStatusOptions,
  subTitle: __('Live or archived', 'bit-integrations'),
  title: __('Status', 'bit-integrations')
}

const ageRestrictionUtility = {
  key: 'age_restriction',
  options: ageRestrictionOptions,
  subTitle: __('Minimum age to attend', 'bit-integrations'),
  title: __('Age Restriction', 'bit-integrations')
}

const localeUtility = {
  key: 'locale',
  options: localeOptions,
  subTitle: __('Language of the event page', 'bit-integrations'),
  title: __('Locale', 'bit-integrations')
}

export const utilitiesByAction = {
  create_event: [...eventFlagUtilities, localeUtility],
  update_event: [
    timezoneUtility,
    {
      key: 'currency',
      options: currencyOptions,
      subTitle: __('Currency of the event', 'bit-integrations'),
      title: __('Currency', 'bit-integrations')
    },
    ...eventFlagUtilities
  ],
  copy_event: [timezoneUtility],
  create_event_schedule: [
    {
      key: 'weekdays',
      multi: true,
      options: weekdayOptions,
      subTitle: __('Weekly dates fall on these days', 'bit-integrations'),
      title: __('On Days', 'bit-integrations')
    }
  ],
  update_display_settings: [
    {
      key: 'terminology',
      options: terminologyOptions,
      subTitle: __('Wording used on the event page', 'bit-integrations'),
      title: __('Terminology', 'bit-integrations')
    },
    checkboxUtility(
      'show_start_date',
      __('Hide Start Date', 'bit-integrations'),
      __('Hide the start date on the event page', 'bit-integrations'),
      'false'
    ),
    checkboxUtility(
      'show_end_date',
      __('Hide End Date', 'bit-integrations'),
      __('Hide the end date on the event page', 'bit-integrations'),
      'false'
    ),
    checkboxUtility(
      'show_start_end_time',
      __('Hide Times', 'bit-integrations'),
      __('Hide the start and end time', 'bit-integrations'),
      'false'
    ),
    checkboxUtility(
      'show_timezone',
      __('Hide Time Zone', 'bit-integrations'),
      __('Hide the event time zone', 'bit-integrations'),
      'false'
    ),
    checkboxUtility(
      'show_map',
      __('Hide Map', 'bit-integrations'),
      __('Hide the venue map', 'bit-integrations'),
      'false'
    ),
    checkboxUtility(
      'show_remaining',
      __('Show Remaining Tickets', 'bit-integrations'),
      __('Show how many tickets are left', 'bit-integrations')
    ),
    checkboxUtility(
      'show_organizer_facebook',
      __('Show Organizer Facebook', 'bit-integrations'),
      __('Link the organizer Facebook page', 'bit-integrations')
    ),
    checkboxUtility(
      'show_organizer_twitter',
      __('Show Organizer X (Twitter)', 'bit-integrations'),
      __('Link the organizer X profile', 'bit-integrations')
    ),
    checkboxUtility(
      'show_facebook_friends_going',
      __('Show Friends Going', 'bit-integrations'),
      __('Show Facebook friends who are going', 'bit-integrations')
    )
  ],
  update_ticket_buyer_settings: [
    checkboxUtility(
      'refund_request_enabled',
      __('Turn Off Refund Requests', 'bit-integrations'),
      __("Buyers can't request refunds", 'bit-integrations'),
      'false'
    ),
    checkboxUtility(
      'allow_attendee_update',
      __('Lock Attendee Info', 'bit-integrations'),
      __("Attendees can't edit their details", 'bit-integrations'),
      'false'
    ),
    {
      key: 'survey_respondent',
      options: respondentOptions,
      subTitle: __('Who answers the order questions', 'bit-integrations'),
      title: __('Collect Information From', 'bit-integrations')
    }
  ],
  set_event_description: [
    {
      key: 'alignment',
      options: alignmentOptions,
      subTitle: __('Alignment of the description text', 'bit-integrations'),
      title: __('Text Alignment', 'bit-integrations')
    },
    {
      key: 'purpose',
      options: purposeOptions,
      subTitle: __('Listing page or online event page', 'bit-integrations'),
      title: __('Page', 'bit-integrations')
    },
    checkboxUtility(
      'publish',
      __('Save as Draft', 'bit-integrations'),
      __("Don't publish the new description yet", 'bit-integrations'),
      'false'
    ),
    {
      key: 'access_type',
      options: accessTypeOptions,
      subTitle: __('Who can see the online event page', 'bit-integrations'),
      title: __('Page Access', 'bit-integrations')
    }
  ],
  create_ticket_class: ticketClassUtilities,
  update_ticket_class: ticketClassUtilities,
  create_ticket_group: [ticketGroupStatusUtility],
  update_ticket_group: [ticketGroupStatusUtility],
  create_inventory_tier: [
    checkboxUtility(
      'count_against_event_capacity',
      __('Add-on Tier', 'bit-integrations'),
      __("Doesn't count against event capacity", 'bit-integrations'),
      'false'
    )
  ],
  create_custom_question: [
    checkboxUtility(
      'is_required',
      __('Required', 'bit-integrations'),
      __('Buyers must answer it', 'bit-integrations')
    ),
    checkboxUtility(
      'display_answer_on_order',
      __('Show Answer On Order', 'bit-integrations'),
      __('Show the answer on the order', 'bit-integrations')
    )
  ],
  create_default_question: [
    checkboxUtility(
      'is_required',
      __('Required', 'bit-integrations'),
      __('Names, billing, card and tax info are always required', 'bit-integrations')
    )
  ],
  create_venue: [ageRestrictionUtility],
  update_venue: [ageRestrictionUtility],
  create_text_override: [localeUtility]
}

export const selectKeys = [
  ...new Set(
    Object.values(selectsByAction)
      .flat()
      .map(({ key }) => key)
  )
]
