/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'
import { fieldSets, requiredSelects, TASK_LIST_VALUES } from './theEventsCalendarConstants'

export const handleInput = (e, theEventsCalendarConf, setTheEventsCalendarConf) => {
  const newConf = create(theEventsCalendarConf, draftConf => {
    const { name } = e.target
    if (e.target.value !== '') {
      draftConf[name] = e.target.value
    } else {
      delete draftConf[name]
    }
  })

  setTheEventsCalendarConf(newConf)
}

export const checkMappedFields = theEventsCalendarConf => {
  const mappedFields = theEventsCalendarConf?.field_map
    ? theEventsCalendarConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.theEventsCalendarField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const requiredSelectMissing = theEventsCalendarConf => {
  const missingSelect = (requiredSelects[theEventsCalendarConf?.selectedTask] || []).find(
    ({ confKey }) => !theEventsCalendarConf?.[confKey]
  )

  return missingSelect ? missingSelect.error : ''
}

export const getAllEvents = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, events: true })

  bitsFetch({}, 'get_the_events_calendar_events').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.events = result.data
      setConf(newConf)
      setLoading({ ...loading, events: false })
      toast.success(__('Events fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, events: false })
    toast.error(result?.data ? result.data : __('Something went wrong!', 'bit-integrations'))
  })
}

const lists = {
  events: {
    route: 'refresh_the_events_calendar_events',
    confKey: 'allEvents',
    success: __('The events are fetched.', 'bit-integrations'),
    error: __('The Events Calendar did not send the events. Try again.', 'bit-integrations')
  },
  venues: {
    route: 'refresh_the_events_calendar_venues',
    confKey: 'allVenues',
    success: __('The venues are fetched.', 'bit-integrations'),
    error: __('The Events Calendar did not send the venues. Try again.', 'bit-integrations')
  },
  organizers: {
    route: 'refresh_the_events_calendar_organizers',
    confKey: 'allOrganizers',
    success: __('The organizers are fetched.', 'bit-integrations'),
    error: __('The Events Calendar did not send the organizers. Try again.', 'bit-integrations')
  },
  categories: {
    route: 'refresh_the_events_calendar_categories',
    confKey: 'allCategories',
    success: __('The event categories are fetched.', 'bit-integrations'),
    error: __('The Events Calendar did not send the event categories. Try again.', 'bit-integrations')
  },
  series: {
    route: 'refresh_the_events_calendar_series',
    confKey: 'allSeries',
    success: __('The series are fetched.', 'bit-integrations'),
    error: __('The Events Calendar did not send the series. Try again.', 'bit-integrations')
  },
  timezones: {
    route: 'refresh_the_events_calendar_timezones',
    confKey: 'allTimezones',
    success: __('The time zones are fetched.', 'bit-integrations'),
    error: __('The time zones did not load. Try again.', 'bit-integrations')
  }
}

export const listConfKey = listName => lists[listName]?.confKey

export const withoutFetchedLists = conf =>
  create(conf, draftConf => {
    Object.values(lists).forEach(({ confKey }) => {
      delete draftConf[confKey]
    })
  })

const startListLoading = setLoading =>
  setLoading(prevLoading => ({ ...prevLoading, lists: (prevLoading.lists || 0) + 1 }))

const stopListLoading = setLoading =>
  setLoading(prevLoading => ({ ...prevLoading, lists: Math.max((prevLoading.lists || 0) - 1, 0) }))

const fetchList = listName =>
  bitsFetch(null, lists[listName].route)
    .then(result => ({ listName, result }))
    .catch(() => ({ listName, result: null }))

const storeList = (setTheEventsCalendarConf, listName, result) => {
  const list = lists[listName]
  const options = result?.success ? result.data?.[listName] : null

  if (!options) {
    toast.error(typeof result?.data === 'string' ? result.data : list.error)
    return false
  }

  setTheEventsCalendarConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[list.confKey] = options
    })
  )

  return true
}

export const refreshTheEventsCalendarList = (listName, setTheEventsCalendarConf, setLoading) => {
  startListLoading(setLoading)
  fetchList(listName).then(({ result }) => {
    stopListLoading(setLoading)

    if (storeList(setTheEventsCalendarConf, listName, result)) {
      toast.success(lists[listName].success)
    }
  })
}

export const refreshTheEventsCalendarLists = (listNames, setTheEventsCalendarConf, setLoading) => {
  if (!listNames.length) {
    return
  }

  startListLoading(setLoading)
  Promise.all(
    listNames.map(listName =>
      fetchList(listName).then(({ result }) => storeList(setTheEventsCalendarConf, listName, result))
    )
  ).then(() => stopListLoading(setLoading))
}

export const theEventsCalendarStaticFields = selectedTask => {
  if (selectedTask === TASK_LIST_VALUES.NEW_ATTENDEE) {
    return {
      staticFields: [
        { key: 'name', label: __('Full Name', 'bit-integrations'), required: true },
        { key: 'email', label: __('Email', 'bit-integrations'), required: true },
        { key: 'number_of_guests', label: __('Number of Guests', 'bit-integrations'), required: true }
      ],
      fieldMap: [
        { formField: '', theEventsCalendarField: 'name' },
        { formField: '', theEventsCalendarField: 'email' },
        { formField: '', theEventsCalendarField: 'number_of_guests' }
      ]
    }
  }

  const staticFields = fieldSets[selectedTask] || []
  const requiredFields = staticFields.filter(({ required }) => required)

  return {
    staticFields,
    fieldMap: requiredFields.length
      ? requiredFields.map(({ key }) => ({ formField: '', theEventsCalendarField: key }))
      : [{ formField: '', theEventsCalendarField: '' }]
  }
}
