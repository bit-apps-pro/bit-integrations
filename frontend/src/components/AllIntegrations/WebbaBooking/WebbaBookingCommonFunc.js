import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, webbaBookingConf, setWebbaBookingConf) => {
  const { name, value } = e.target

  setWebbaBookingConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const refreshList = (
  route,
  dataKey,
  confKey,
  successMsg,
  errorMsg,
  setWebbaBookingConf,
  setIsLoading
) => {
  setIsLoading(true)
  bitsFetch(null, route)
    .then(result => {
      if (result && result?.success && result?.data?.[dataKey]) {
        setWebbaBookingConf(prevConf =>
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

export const refreshWebbaServices = (setWebbaBookingConf, setIsLoading) =>
  refreshList(
    'refresh_webba_booking_services',
    'services',
    'allServices',
    __('All services fetched successfully', 'bit-integrations'),
    __('Webba Booking services fetch failed. Please try again', 'bit-integrations'),
    setWebbaBookingConf,
    setIsLoading
  )

export const refreshWebbaStaff = (setWebbaBookingConf, setIsLoading) =>
  refreshList(
    'refresh_webba_booking_staff',
    'staff',
    'allStaff',
    __('All staff members fetched successfully', 'bit-integrations'),
    __('Webba Booking staff fetch failed. Please try again', 'bit-integrations'),
    setWebbaBookingConf,
    setIsLoading
  )

export const refreshWebbaCategories = (setWebbaBookingConf, setIsLoading) =>
  refreshList(
    'refresh_webba_booking_categories',
    'categories',
    'allCategories',
    __('All categories fetched successfully', 'bit-integrations'),
    __('Webba Booking categories fetch failed. Please try again', 'bit-integrations'),
    setWebbaBookingConf,
    setIsLoading
  )

export const refreshWebbaLocations = (setWebbaBookingConf, setIsLoading) =>
  refreshList(
    'refresh_webba_booking_locations',
    'locations',
    'allLocations',
    __('All locations fetched successfully', 'bit-integrations'),
    __('Webba Booking locations fetch failed. Please try again', 'bit-integrations'),
    setWebbaBookingConf,
    setIsLoading
  )

export const refreshWebbaStatuses = (setWebbaBookingConf, setIsLoading) =>
  refreshList(
    'refresh_webba_booking_statuses',
    'statuses',
    'allStatuses',
    __('All statuses fetched successfully', 'bit-integrations'),
    __('Webba Booking statuses fetch failed. Please try again', 'bit-integrations'),
    setWebbaBookingConf,
    setIsLoading
  )

export const refreshWebbaBookings = (setWebbaBookingConf, setIsLoading) =>
  refreshList(
    'refresh_webba_booking_bookings',
    'bookings',
    'allBookings',
    __('All bookings fetched successfully', 'bit-integrations'),
    __('Webba Booking bookings fetch failed. Please try again', 'bit-integrations'),
    setWebbaBookingConf,
    setIsLoading
  )

export const refreshWebbaCoupons = (setWebbaBookingConf, setIsLoading) =>
  refreshList(
    'refresh_webba_booking_coupons',
    'coupons',
    'allCoupons',
    __('All coupons fetched successfully', 'bit-integrations'),
    __('Webba Booking coupons fetch failed. Please try again', 'bit-integrations'),
    setWebbaBookingConf,
    setIsLoading
  )

export const checkMappedFields = webbaBookingConf => {
  const fieldMap = webbaBookingConf?.field_map || []

  // A partially-filled row is always invalid: one side set without the other,
  // or a custom value left blank.
  const hasIncompleteRow = fieldMap.some(
    mappedField =>
      (mappedField.formField && !mappedField.webbaBookingField) ||
      (!mappedField.formField && mappedField.webbaBookingField) ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )
  if (hasIncompleteRow) {
    return false
  }

  // Every required Webba field must be mapped. Fully-empty rows are allowed so
  // that actions whose fields are all optional (e.g. cancel_booking) can be saved.
  const requiredKeys = (webbaBookingConf?.webbaBookingFields || [])
    .filter(fld => fld.required === true)
    .map(fld => fld.key)
  const mappedKeys = fieldMap
    .filter(mappedField => mappedField.formField && mappedField.webbaBookingField)
    .map(mappedField => mappedField.webbaBookingField)

  return requiredKeys.every(key => mappedKeys.includes(key))
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        webbaBookingField: field.key
      }))
    : [{ formField: '', webbaBookingField: '' }]
}
