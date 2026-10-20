import { __ } from '../../../Utils/i18nwrap'

export const TASK_LIST_VALUES = {
  NEW_ATTENDEE: 'newAttendee'
}

export const TASK_LIST = [
  { label: __('Register New Attendee', 'bit-integrations'), value: TASK_LIST_VALUES.NEW_ATTENDEE },
  { label: __('Create Event', 'bit-integrations'), value: 'create_event', is_pro: true },
  { label: __('Update Event', 'bit-integrations'), value: 'update_event', is_pro: true },
  { label: __('Delete Event', 'bit-integrations'), value: 'delete_event', is_pro: true },
  { label: __('Update Event Status', 'bit-integrations'), value: 'update_event_status', is_pro: true },
  { label: __('Duplicate Event', 'bit-integrations'), value: 'duplicate_event', is_pro: true },
  {
    label: __('Create Recurring Event', 'bit-integrations'),
    value: 'create_recurring_event',
    is_pro: true
  },
  { label: __('Create Venue', 'bit-integrations'), value: 'create_venue', is_pro: true },
  { label: __('Update Venue', 'bit-integrations'), value: 'update_venue', is_pro: true },
  { label: __('Delete Venue', 'bit-integrations'), value: 'delete_venue', is_pro: true },
  { label: __('Create Organizer', 'bit-integrations'), value: 'create_organizer', is_pro: true },
  { label: __('Update Organizer', 'bit-integrations'), value: 'update_organizer', is_pro: true },
  { label: __('Delete Organizer', 'bit-integrations'), value: 'delete_organizer', is_pro: true },
  {
    label: __('Create Event Category', 'bit-integrations'),
    value: 'create_event_category',
    is_pro: true
  },
  { label: __('Create Series', 'bit-integrations'), value: 'create_series', is_pro: true },
  { label: __('Add Event to Series', 'bit-integrations'), value: 'add_event_to_series', is_pro: true }
]

const field = (key, label, required = false) => ({ key, label, required })

const eventIdField = field('event_id', __('Event ID', 'bit-integrations'), true)
const venueIdField = field('venue_id', __('Venue ID', 'bit-integrations'), true)
const organizerIdField = field('organizer_id', __('Organizer ID', 'bit-integrations'), true)

const eventDetailFields = [
  field('description', __('Description', 'bit-integrations')),
  field('excerpt', __('Excerpt', 'bit-integrations')),
  field('cost', __('Cost', 'bit-integrations')),
  field('currency_symbol', __('Currency Symbol', 'bit-integrations')),
  field('event_website', __('Event Website', 'bit-integrations')),
  field('featured_image', __('Featured Image (URL or attachment ID)', 'bit-integrations')),
  field('tags', __('Tags (separated by commas)', 'bit-integrations'))
]

const venueDetailFields = [
  field('description', __('Description', 'bit-integrations')),
  field('address', __('Address', 'bit-integrations')),
  field('city', __('City', 'bit-integrations')),
  field('state', __('State or Province', 'bit-integrations')),
  field('zip', __('Postal Code', 'bit-integrations')),
  field('country', __('Country', 'bit-integrations')),
  field('phone', __('Phone', 'bit-integrations')),
  field('website', __('Website', 'bit-integrations'))
]

const organizerDetailFields = [
  field('description', __('Description', 'bit-integrations')),
  field('phone', __('Phone', 'bit-integrations')),
  field('website', __('Website', 'bit-integrations')),
  field('email', __('Email', 'bit-integrations'))
]

const startDateLabel = __('Start Date (YYYY-MM-DD HH:MM)', 'bit-integrations')
const endDateLabel = __('End Date (YYYY-MM-DD HH:MM)', 'bit-integrations')

export const fieldSets = {
  create_event: [
    field('title', __('Event Title', 'bit-integrations'), true),
    field('start_date', startDateLabel, true),
    field('end_date', endDateLabel, true),
    ...eventDetailFields
  ],
  update_event: [
    eventIdField,
    field('title', __('Event Title', 'bit-integrations')),
    field('start_date', startDateLabel),
    field('end_date', endDateLabel),
    ...eventDetailFields
  ],
  delete_event: [eventIdField],
  update_event_status: [eventIdField, field('status_reason', __('Status Reason', 'bit-integrations'))],
  duplicate_event: [eventIdField, field('title', __('New Title', 'bit-integrations'))],
  create_recurring_event: [
    field('title', __('Event Title', 'bit-integrations'), true),
    field('start_date', __('First Start Date (YYYY-MM-DD HH:MM)', 'bit-integrations'), true),
    field('end_date', __('First End Date (YYYY-MM-DD HH:MM)', 'bit-integrations'), true),
    field('interval', __('Repeat Every (number)', 'bit-integrations')),
    field('occurrence_count', __('Number of Occurrences', 'bit-integrations')),
    field('recurrence_end_date', __('Last Date (YYYY-MM-DD)', 'bit-integrations')),
    ...eventDetailFields
  ],
  create_venue: [field('name', __('Venue Name', 'bit-integrations'), true), ...venueDetailFields],
  update_venue: [
    venueIdField,
    field('name', __('Venue Name', 'bit-integrations')),
    ...venueDetailFields
  ],
  delete_venue: [venueIdField],
  create_organizer: [
    field('name', __('Organizer Name', 'bit-integrations'), true),
    ...organizerDetailFields
  ],
  update_organizer: [
    organizerIdField,
    field('name', __('Organizer Name', 'bit-integrations')),
    ...organizerDetailFields
  ],
  delete_organizer: [organizerIdField],
  create_event_category: [
    field('name', __('Category Name', 'bit-integrations'), true),
    field('slug', __('Slug', 'bit-integrations')),
    field('description', __('Description', 'bit-integrations'))
  ],
  create_series: [
    field('title', __('Series Title', 'bit-integrations'), true),
    field('description', __('Description', 'bit-integrations'))
  ],
  add_event_to_series: [eventIdField]
}

export const eventStatusOptions = [
  { label: __('Scheduled', 'bit-integrations'), value: 'scheduled' },
  { label: __('Canceled', 'bit-integrations'), value: 'canceled' },
  { label: __('Postponed', 'bit-integrations'), value: 'postponed' }
]

export const frequencyOptions = [
  { label: __('Daily', 'bit-integrations'), value: 'daily' },
  { label: __('Weekly', 'bit-integrations'), value: 'weekly' },
  { label: __('Monthly', 'bit-integrations'), value: 'monthly' },
  { label: __('Yearly', 'bit-integrations'), value: 'yearly' }
]

export const recurrenceEndOptions = [
  { label: __('Never', 'bit-integrations'), value: 'never' },
  { label: __('After a number of occurrences', 'bit-integrations'), value: 'count' },
  { label: __('On a date', 'bit-integrations'), value: 'until' }
]

const postStatusOptions = [
  { label: __('Published', 'bit-integrations'), value: 'publish' },
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Pending Review', 'bit-integrations'), value: 'pending' },
  { label: __('Private', 'bit-integrations'), value: 'private' }
]

const currencyPositionOptions = [
  { label: __('Before the cost', 'bit-integrations'), value: 'prefix' },
  { label: __('After the cost', 'bit-integrations'), value: 'postfix' }
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

export const requiredSelects = {
  update_event_status: [
    {
      confKey: 'eventStatus',
      label: __('Event Status:', 'bit-integrations'),
      options: eventStatusOptions,
      error: __('Select an event status to continue.', 'bit-integrations')
    }
  ],
  create_recurring_event: [
    {
      confKey: 'frequency',
      label: __('Repeat:', 'bit-integrations'),
      options: frequencyOptions,
      error: __('Select how often the event repeats to continue.', 'bit-integrations')
    },
    {
      confKey: 'recurrenceEnd',
      label: __('Ends:', 'bit-integrations'),
      options: recurrenceEndOptions,
      error: __('Select when the recurrence ends to continue.', 'bit-integrations')
    }
  ],
  add_event_to_series: [
    {
      confKey: 'seriesId',
      label: __('Series:', 'bit-integrations'),
      list: 'series',
      error: __('Select a series to continue.', 'bit-integrations')
    }
  ]
}

export const actionNotes = {
  duplicate_event: __('This action needs The Events Calendar Pro.', 'bit-integrations'),
  create_recurring_event: __(
    'This action needs The Events Calendar Pro. Map Number of Occurrences or Last Date to match the Ends value.',
    'bit-integrations'
  ),
  create_series: __('This action needs The Events Calendar Pro.', 'bit-integrations'),
  add_event_to_series: __('This action needs The Events Calendar Pro.', 'bit-integrations')
}

const selectUtility = (key, title, subTitle, source) => ({ id: key, key, title, subTitle, ...source })

const multiSelectUtility = (key, title, subTitle, source) => ({
  ...selectUtility(key, title, subTitle, source),
  multi: true
})

const checkboxUtility = (id, key, title, subTitle, value = 'true') => ({
  checkbox: true,
  id,
  key,
  subTitle,
  title,
  value
})

const statusUtility = subTitle =>
  selectUtility('status', __('Post Status', 'bit-integrations'), subTitle, {
    options: postStatusOptions
  })

const eventSelectUtilities = [
  selectUtility(
    'venue_id',
    __('Venue', 'bit-integrations'),
    __('Select the event venue.', 'bit-integrations'),
    {
      list: 'venues'
    }
  ),
  multiSelectUtility(
    'organizer_ids',
    __('Organizers', 'bit-integrations'),
    __('Select one or more event organizers.', 'bit-integrations'),
    { list: 'organizers' }
  ),
  multiSelectUtility(
    'category_ids',
    __('Event Categories', 'bit-integrations'),
    __('Select one or more event categories.', 'bit-integrations'),
    { list: 'categories' }
  ),
  selectUtility(
    'timezone',
    __('Time Zone', 'bit-integrations'),
    __(
      'Select the event time zone. The site time zone applies when you select none.',
      'bit-integrations'
    ),
    { list: 'timezones' }
  ),
  selectUtility(
    'currency_position',
    __('Currency Symbol Position', 'bit-integrations'),
    __('Select where the currency symbol shows.', 'bit-integrations'),
    { options: currencyPositionOptions }
  )
]

const createEventUtilities = [
  statusUtility(__('Set the post status. A new event is published by default.', 'bit-integrations')),
  ...eventSelectUtilities,
  checkboxUtility(
    'all_day',
    'all_day',
    __('All-Day Event', 'bit-integrations'),
    __('Hide the start and end times.', 'bit-integrations')
  ),
  checkboxUtility(
    'featured',
    'featured',
    __('Featured Event', 'bit-integrations'),
    __('Show the event as featured.', 'bit-integrations')
  ),
  checkboxUtility(
    'hide_map',
    'show_map',
    __('Hide Map', 'bit-integrations'),
    __('Hide the venue map on the event page.', 'bit-integrations'),
    'false'
  ),
  checkboxUtility(
    'hide_map_link',
    'show_map_link',
    __('Hide Map Link', 'bit-integrations'),
    __('Hide the link to the venue map.', 'bit-integrations'),
    'false'
  ),
  checkboxUtility(
    'hide_from_upcoming',
    'hide_from_upcoming',
    __('Hide From Event Listings', 'bit-integrations'),
    __('Hide the event from event listings.', 'bit-integrations')
  )
]

const pairedCheckboxes = (key, onTitle, onSubTitle, offTitle, offSubTitle) => [
  checkboxUtility(`${key}_on`, key, onTitle, onSubTitle, 'true'),
  checkboxUtility(`${key}_off`, key, offTitle, offSubTitle, 'false')
]

const mapCheckboxPairs = [
  ...pairedCheckboxes(
    'show_map',
    __('Show Map', 'bit-integrations'),
    __('Show the venue map.', 'bit-integrations'),
    __('Hide Map', 'bit-integrations'),
    __('Hide the venue map.', 'bit-integrations')
  ),
  ...pairedCheckboxes(
    'show_map_link',
    __('Show Map Link', 'bit-integrations'),
    __('Show the link to the venue map.', 'bit-integrations'),
    __('Hide Map Link', 'bit-integrations'),
    __('Hide the link to the venue map.', 'bit-integrations')
  )
]

const deleteUtility = subTitle =>
  checkboxUtility(
    'delete_permanently',
    'delete_permanently',
    __('Delete Permanently', 'bit-integrations'),
    subTitle
  )

export const utilitiesByAction = {
  create_event: createEventUtilities,
  update_event: [
    statusUtility(__('Set the post status.', 'bit-integrations')),
    ...eventSelectUtilities,
    ...pairedCheckboxes(
      'all_day',
      __('Make All-Day', 'bit-integrations'),
      __('Hide the start and end times.', 'bit-integrations'),
      __('Remove All-Day', 'bit-integrations'),
      __('Show the start and end times.', 'bit-integrations')
    ),
    ...pairedCheckboxes(
      'featured',
      __('Mark as Featured', 'bit-integrations'),
      __('Show the event as featured.', 'bit-integrations'),
      __('Remove Featured', 'bit-integrations'),
      __('Stop showing the event as featured.', 'bit-integrations')
    ),
    ...mapCheckboxPairs,
    ...pairedCheckboxes(
      'hide_from_upcoming',
      __('Hide From Event Listings', 'bit-integrations'),
      __('Hide the event from event listings.', 'bit-integrations'),
      __('Show in Event Listings', 'bit-integrations'),
      __('Show the event in event listings.', 'bit-integrations')
    )
  ],
  delete_event: [
    deleteUtility(__('Skip the trash and delete the event permanently.', 'bit-integrations'))
  ],
  duplicate_event: [
    statusUtility(__('Set the post status. The copy is a draft by default.', 'bit-integrations'))
  ],
  create_recurring_event: [
    ...createEventUtilities,
    multiSelectUtility(
      'weekdays',
      __('Days of the Week', 'bit-integrations'),
      __('Select the days for a weekly event.', 'bit-integrations'),
      { options: weekdayOptions }
    )
  ],
  create_venue: [
    statusUtility(__('Set the post status. A new venue is published by default.', 'bit-integrations')),
    checkboxUtility(
      'hide_map',
      'show_map',
      __('Hide Map', 'bit-integrations'),
      __('Hide the venue map.', 'bit-integrations'),
      'false'
    ),
    checkboxUtility(
      'hide_map_link',
      'show_map_link',
      __('Hide Map Link', 'bit-integrations'),
      __('Hide the link to the venue map.', 'bit-integrations'),
      'false'
    )
  ],
  update_venue: [statusUtility(__('Set the post status.', 'bit-integrations')), ...mapCheckboxPairs],
  delete_venue: [
    deleteUtility(__('Skip the trash and delete the venue permanently.', 'bit-integrations'))
  ],
  create_organizer: [
    statusUtility(
      __('Set the post status. A new organizer is published by default.', 'bit-integrations')
    )
  ],
  update_organizer: [statusUtility(__('Set the post status.', 'bit-integrations'))],
  delete_organizer: [
    deleteUtility(__('Skip the trash and delete the organizer permanently.', 'bit-integrations'))
  ],
  create_event_category: [
    selectUtility(
      'parent_id',
      __('Parent Category', 'bit-integrations'),
      __('Put the new category under a parent category.', 'bit-integrations'),
      { list: 'categories' }
    )
  ],
  create_series: [
    statusUtility(__('Set the post status. A new series is published by default.', 'bit-integrations')),
    multiSelectUtility(
      'event_ids',
      __('Events', 'bit-integrations'),
      __('Select the events to add to the series.', 'bit-integrations'),
      { list: 'events' }
    )
  ]
}

const eventLists = ['venues', 'organizers', 'categories', 'timezones']

export const listsByAction = {
  create_event: eventLists,
  update_event: eventLists,
  create_recurring_event: eventLists,
  create_event_category: ['categories'],
  create_series: ['events'],
  add_event_to_series: ['series']
}
