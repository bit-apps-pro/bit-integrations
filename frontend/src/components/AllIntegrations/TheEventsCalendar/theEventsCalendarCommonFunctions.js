/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'
import { TASK_LIST_VALUES } from './theEventsCalendarConstants'

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

  return { staticFields: [], fieldMap: [] }
}
