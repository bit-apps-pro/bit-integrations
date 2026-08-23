import { create } from 'mutative'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const hasMappedBookingId = bookingCalendarConf =>
  bookingCalendarConf?.field_map?.some(
    field =>
      field.bookingCalendarField === 'booking_id' &&
      field.formField &&
      (field.formField !== 'custom' || field.customValue)
  )

export const handleInput = (e, bookingCalendarConf, setBookingCalendarConf) => {
  const { name, value } = e.target
  setBookingCalendarConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = bookingCalendarConf => {
  const unmapped = bookingCalendarConf?.field_map
    ? bookingCalendarConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.bookingCalendarField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  if (unmapped.length > 0) return false
  if (
    bookingCalendarConf?.mainAction === 'update_booking' &&
    !bookingCalendarConf?.bookingId &&
    !hasMappedBookingId(bookingCalendarConf)
  ) {
    return false
  }

  return true
}

export const getBookingCalendarValidationMsg = bookingCalendarConf => {
  if (
    bookingCalendarConf?.mainAction === 'update_booking' &&
    !bookingCalendarConf?.bookingId &&
    !hasMappedBookingId(bookingCalendarConf)
  ) {
    return __('Please select or map a booking to continue.', 'bit-integrations')
  }

  const unmapped = bookingCalendarConf?.field_map?.filter(
    f => !f.formField || !f.bookingCalendarField || (f.formField === 'custom' && !f.customValue)
  )

  if (unmapped?.length > 0) {
    return __('Please map all required fields to continue.', 'bit-integrations')
  }

  return null
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        bookingCalendarField: field.key
      }))
    : [{ formField: '', bookingCalendarField: '' }]
}

export const refreshBookingCalendarBookings = (setBookingCalendarConf, setDataLoading) => {
  setDataLoading(prev => ({ ...prev, bookings: true }))
  bitsFetch({}, 'refresh_booking_calendar_bookings')
    .then(res => {
      if (res?.success && res.data?.bookings) {
        setBookingCalendarConf(prev =>
          create(prev, draft => {
            draft.allBookings = res.data.bookings
          })
        )
      }
    })
    .finally(() => setDataLoading(prev => ({ ...prev, bookings: false })))
}

export const refreshBookingCalendarResources = (setBookingCalendarConf, setDataLoading) => {
  setDataLoading(prev => ({ ...prev, resources: true }))
  bitsFetch({}, 'refresh_booking_calendar_resources')
    .then(res => {
      if (res?.success && res.data?.resources) {
        setBookingCalendarConf(prev =>
          create(prev, draft => {
            draft.allResources = res.data.resources
          })
        )
      }
    })
    .finally(() => setDataLoading(prev => ({ ...prev, resources: false })))
}
