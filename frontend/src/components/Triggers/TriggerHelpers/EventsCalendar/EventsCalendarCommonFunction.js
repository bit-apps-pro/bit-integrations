import toast from 'react-hot-toast'
import bitsFetch from '../../../../Utils/bitsFetch'
import { __ } from '../../../../Utils/i18nwrap'

export const EVENTS_CALENDAR_EVENT_FILTER_TASKS = [
  'events_calendar-1',
  'events_calendar-2',
  'events_calendar-3',
  'events_calendar-4',
  'events_calendar-7',
  'events_calendar-8',
  'events_calendar-9',
  'events_calendar-10',
  'events_calendar-11',
  'events_calendar-12',
  'events_calendar-13'
]

export const EVENTS_CALENDAR_SERIES_FILTER_TASKS = ['events_calendar-20']

export const getEventsCalendarEvents = (data, setFlow) => {
  const loadEvents = bitsFetch(null, 'eventscalendar/get/events', null, 'GET').then(result => {
    if (result && result.data) {
      const tmpFlow = { ...data }
      tmpFlow.flow_details.events = result.data
      setFlow({ ...tmpFlow })
      return __('Events fetched successfully', 'bit-integrations')
    }
    return __('Events fetching failed. please try again', 'bit-integrations')
  })

  toast.promise(loadEvents, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading Events...')
  })
}

export const getEventsCalendarSeries = (data, setFlow) => {
  const loadSeries = bitsFetch(null, 'eventscalendar/get/series', null, 'GET').then(result => {
    if (result && result.data) {
      const tmpFlow = { ...data }
      tmpFlow.flow_details.series = result.data
      setFlow({ ...tmpFlow })
      return __('The series are fetched.', 'bit-integrations')
    }
    return __('The series did not load. Try again.', 'bit-integrations')
  })

  toast.promise(loadSeries, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading the series...', 'bit-integrations')
  })
}
