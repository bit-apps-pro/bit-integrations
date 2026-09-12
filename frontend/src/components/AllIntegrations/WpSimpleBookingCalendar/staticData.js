import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_calendar', label: __('Create Calendar', 'bit-integrations'), is_pro: true },
  { name: 'update_calendar', label: __('Update Calendar', 'bit-integrations'), is_pro: true },
  { name: 'trash_calendar', label: __('Trash Calendar', 'bit-integrations'), is_pro: true },
  { name: 'restore_calendar', label: __('Restore Calendar', 'bit-integrations'), is_pro: true },
  { name: 'delete_calendar', label: __('Delete Calendar', 'bit-integrations'), is_pro: true },
  { name: 'create_event', label: __('Create Event (Book Date)', 'bit-integrations'), is_pro: true },
  { name: 'book_date_range', label: __('Book Date Range', 'bit-integrations'), is_pro: true },
  { name: 'update_event', label: __('Update Event', 'bit-integrations'), is_pro: true },
  { name: 'delete_event', label: __('Delete Event', 'bit-integrations'), is_pro: true },
  {
    name: 'delete_event_by_date',
    label: __('Delete Event by Date', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_legend_item', label: __('Create Legend Item', 'bit-integrations'), is_pro: true },
  { name: 'update_legend_item', label: __('Update Legend Item', 'bit-integrations'), is_pro: true },
  { name: 'delete_legend_item', label: __('Delete Legend Item', 'bit-integrations'), is_pro: true },
  {
    name: 'set_default_legend_item',
    label: __('Set Default Legend Item', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'set_legend_item_visibility',
    label: __('Set Legend Item Visibility', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_calendar_meta',
    label: __('Update Calendar Meta', 'bit-integrations'),
    is_pro: true
  },
  { name: 'update_event_meta', label: __('Update Event Meta', 'bit-integrations'), is_pro: true },
  {
    name: 'update_legend_item_meta',
    label: __('Update Legend Item Meta', 'bit-integrations'),
    is_pro: true
  }
]

const calendarId = { key: 'calendar_id', label: __('Calendar ID', 'bit-integrations'), required: true }
const eventId = { key: 'event_id', label: __('Event ID', 'bit-integrations'), required: true }
const legendItemId = {
  key: 'legend_item_id',
  label: __('Legend Item ID', 'bit-integrations'),
  required: true
}
const description = {
  key: 'description',
  label: __('Description', 'bit-integrations'),
  required: false
}
const tooltip = { key: 'tooltip', label: __('Tooltip', 'bit-integrations'), required: false }
const metaKey = { key: 'meta_key', label: __('Meta Key', 'bit-integrations'), required: true }
const metaValue = { key: 'meta_value', label: __('Meta Value', 'bit-integrations'), required: false }
const legendName = { key: 'name', label: __('Legend Item Name', 'bit-integrations'), required: false }
const legendColor = { key: 'color', label: __('Color (hex)', 'bit-integrations'), required: false }
const legendColorText = {
  key: 'color_text',
  label: __('Text Color (hex)', 'bit-integrations'),
  required: false
}

export const WpSimpleBookingCalendarStaticData = {
  create_calendar: [{ key: 'name', label: __('Calendar Name', 'bit-integrations'), required: true }],
  update_calendar: [
    calendarId,
    { key: 'name', label: __('Calendar Name', 'bit-integrations'), required: true }
  ],
  trash_calendar: [calendarId],
  restore_calendar: [calendarId],
  delete_calendar: [calendarId],
  create_event: [
    { key: 'date', label: __('Date (YYYY-MM-DD)', 'bit-integrations'), required: true },
    description,
    tooltip
  ],
  book_date_range: [
    { key: 'start_date', label: __('Start Date (YYYY-MM-DD)', 'bit-integrations'), required: true },
    { key: 'end_date', label: __('End Date (YYYY-MM-DD)', 'bit-integrations'), required: true },
    description,
    tooltip
  ],
  update_event: [eventId, description, tooltip],
  delete_event: [eventId],
  delete_event_by_date: [
    calendarId,
    { key: 'date', label: __('Date (YYYY-MM-DD)', 'bit-integrations'), required: true }
  ],
  create_legend_item: [
    { ...legendName, required: true },
    { ...legendColor, required: true },
    legendColorText
  ],
  update_legend_item: [legendItemId, legendName, legendColor, legendColorText],
  delete_legend_item: [legendItemId],
  set_default_legend_item: [legendItemId],
  set_legend_item_visibility: [legendItemId],
  update_calendar_meta: [calendarId, metaKey, metaValue],
  update_event_meta: [eventId, metaKey, metaValue],
  update_legend_item_meta: [legendItemId, metaKey, metaValue]
}

export const visibilityOptions = [
  { label: __('Visible', 'bit-integrations'), value: '1' },
  { label: __('Hidden', 'bit-integrations'), value: '0' }
]

export const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: '1' },
  { label: __('No', 'bit-integrations'), value: '0' }
]

// Actions whose target calendar is a config choice (the record being created lives in it).
export const needsCalendar = ['create_event', 'book_date_range', 'create_legend_item']
// Legend item scoped to the selected calendar (required).
export const needsLegendItemByCalendar = ['create_event', 'book_date_range']
// Optional legend item picked from every calendar.
export const needsAnyLegendItem = ['update_event']
export const needsCopyCalendar = ['create_calendar']
export const needsVisibility = ['set_legend_item_visibility']
export const needsLegendDefaults = ['create_legend_item']
