import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { needsCalendar, needsLegendItemByCalendar, needsVisibility } from './staticData'

export const handleInput = (e, wpSimpleBookingCalendarConf, setWpSimpleBookingCalendarConf) => {
  const { name, value } = e.target

  setWpSimpleBookingCalendarConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const refreshList = (
  route,
  payload,
  dataKey,
  confKey,
  successMsg,
  errorMsg,
  setWpSimpleBookingCalendarConf,
  setIsLoading
) => {
  setIsLoading(true)
  bitsFetch(payload, route)
    .then(result => {
      if (result && result?.success && result?.data?.[dataKey]) {
        setWpSimpleBookingCalendarConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf[confKey] = result.data[dataKey]
          })
        )

        setIsLoading(false)
        toast.success(successMsg)
        return
      }
      setIsLoading(false)
      toast.error(errorMsg)
    })
    .catch(() => setIsLoading(false))
}

export const refreshCalendars = (setWpSimpleBookingCalendarConf, setIsLoading) =>
  refreshList(
    'refresh_wp_simple_booking_calendar_calendars',
    null,
    'calendars',
    'allCalendars',
    __('All calendars fetched successfully', 'bit-integrations'),
    __('Calendars fetch failed. Please try again', 'bit-integrations'),
    setWpSimpleBookingCalendarConf,
    setIsLoading
  )

export const refreshLegendItems = (setWpSimpleBookingCalendarConf, setIsLoading, calendarId) =>
  refreshList(
    'refresh_wp_simple_booking_calendar_legend_items',
    calendarId ? { calendar_id: calendarId } : null,
    'legendItems',
    'allLegendItems',
    __('All legend items fetched successfully', 'bit-integrations'),
    __('Legend items fetch failed. Please try again', 'bit-integrations'),
    setWpSimpleBookingCalendarConf,
    setIsLoading
  )

export const checkMappedFields = wpSimpleBookingCalendarConf => {
  const fieldMap = wpSimpleBookingCalendarConf?.field_map || []

  const hasIncompleteRow = fieldMap.some(
    mappedField =>
      (mappedField.formField && !mappedField.wpSimpleBookingCalendarField) ||
      (!mappedField.formField && mappedField.wpSimpleBookingCalendarField) ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )
  if (hasIncompleteRow) {
    return false
  }

  const requiredKeys = (wpSimpleBookingCalendarConf?.wpSimpleBookingCalendarFields || [])
    .filter(fld => fld.required === true)
    .map(fld => fld.key)
  const mappedKeys = fieldMap
    .filter(mappedField => mappedField.formField && mappedField.wpSimpleBookingCalendarField)
    .map(mappedField => mappedField.wpSimpleBookingCalendarField)

  return requiredKeys.every(key => mappedKeys.includes(key))
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        wpSimpleBookingCalendarField: field.key
      }))
    : [{ formField: '', wpSimpleBookingCalendarField: '' }]
}

export const validateConf = conf => {
  if (!conf.mainAction) {
    return __('Please select an action to continue.', 'bit-integrations')
  }

  if (needsCalendar.includes(conf.mainAction) && !conf.selectedCalendar) {
    return __('Please select a calendar to continue.', 'bit-integrations')
  }

  if (needsLegendItemByCalendar.includes(conf.mainAction) && !conf.selectedLegendItem) {
    return __('Please select a legend item to continue.', 'bit-integrations')
  }

  if (needsVisibility.includes(conf.mainAction) && !conf.selectedVisibility) {
    return __('Please select the visibility to continue.', 'bit-integrations')
  }

  if (!checkMappedFields(conf)) {
    return __('Please map all required fields to continue.', 'bit-integrations')
  }

  return ''
}
