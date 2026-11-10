import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { fieldsByAction } from './staticData'

export const handleInput = (e, motoPressHotelBookingConf, setMotoPressHotelBookingConf) => {
  const { name, value } = e.target

  setMotoPressHotelBookingConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const fetchList =
  (route, dataKey, confKey, successMsg, errorMsg) =>
  (setMotoPressHotelBookingConf, setIsLoading, notify = true, payload = null) => {
    setIsLoading?.(true)

    return bitsFetch(payload, route)
      .then(result => {
        if (result && result?.success && Array.isArray(result?.data?.[dataKey])) {
          setMotoPressHotelBookingConf(prevConf =>
            create(prevConf, draftConf => {
              const isOutdated =
                payload?.accommodationTypeId !== undefined &&
                String(payload.accommodationTypeId) !== String(draftConf.selectedAccommodationType ?? 0)

              if (!isOutdated) {
                draftConf[confKey] = result.data[dataKey]
              }
            })
          )

          if (notify) {
            toast.success(successMsg())
          }
          return
        }
        toast.error(errorMsg())
      })
      .catch(() => toast.error(errorMsg()))
      .finally(() => setIsLoading?.(false))
  }

export const refreshMotoPressHotelBookingAccommodationTypes = fetchList(
  'refresh_motopress_hotel_booking_accommodation_types',
  'accommodationTypes',
  'allAccommodationTypes',
  () => __('The accommodation types are loaded.', 'bit-integrations'),
  () => __('The accommodation types did not load. Try again.', 'bit-integrations')
)

export const refreshMotoPressHotelBookingAccommodations = fetchList(
  'refresh_motopress_hotel_booking_accommodations',
  'accommodations',
  'allAccommodations',
  () => __('The accommodations are loaded.', 'bit-integrations'),
  () => __('The accommodations did not load. Try again.', 'bit-integrations')
)

export const refreshMotoPressHotelBookingRates = fetchList(
  'refresh_motopress_hotel_booking_rates',
  'rates',
  'allRates',
  () => __('The rates are loaded.', 'bit-integrations'),
  () => __('The rates did not load. Try again.', 'bit-integrations')
)

export const refreshMotoPressHotelBookingCountries = fetchList(
  'refresh_motopress_hotel_booking_countries',
  'countries',
  'allCountries',
  () => __('The countries are loaded.', 'bit-integrations'),
  () => __('The countries did not load. Try again.', 'bit-integrations')
)

export const refreshMotoPressHotelBookingGateways = fetchList(
  'refresh_motopress_hotel_booking_gateways',
  'gateways',
  'allGateways',
  () => __('The payment gateways are loaded.', 'bit-integrations'),
  () => __('The payment gateways did not load. Try again.', 'bit-integrations')
)

export const refreshMotoPressHotelBookingNoteAuthors = fetchList(
  'refresh_motopress_hotel_booking_note_authors',
  'authors',
  'allNoteAuthors',
  () => __('The note authors are loaded.', 'bit-integrations'),
  () => __('The note authors did not load. Try again.', 'bit-integrations')
)

export const getActionFields = motoPressHotelBookingConf =>
  fieldsByAction[motoPressHotelBookingConf?.mainAction] || []

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        motoPressHotelBookingField: field.key
      }))
    : [{ formField: '', motoPressHotelBookingField: '' }]
}

const isBlankRow = mappedField => !mappedField.formField && !mappedField.motoPressHotelBookingField

export const checkMappedFields = motoPressHotelBookingConf => {
  const fieldMap = motoPressHotelBookingConf?.field_map || []
  const invalidRows = fieldMap.filter(
    mappedField =>
      !isBlankRow(mappedField) &&
      (!mappedField.formField ||
        !mappedField.motoPressHotelBookingField ||
        (mappedField.formField === 'custom' && !mappedField.customValue))
  )

  if (invalidRows.length > 0) {
    return false
  }

  const requiredKeys = (fieldsByAction[motoPressHotelBookingConf?.mainAction] || [])
    .filter(field => field.required === true)
    .map(field => field.key)

  return requiredKeys.every(key =>
    fieldMap.some(mappedField => mappedField.motoPressHotelBookingField === key && mappedField.formField)
  )
}

export const getConfError = motoPressHotelBookingConf => {
  const { mainAction } = motoPressHotelBookingConf || {}

  if (!mainAction) {
    return __('Select an action to continue.', 'bit-integrations')
  }

  if (
    ['create_booking', 'create_accommodation'].includes(mainAction) &&
    !motoPressHotelBookingConf?.selectedAccommodationType
  ) {
    return __('Select an accommodation type to continue.', 'bit-integrations')
  }

  if (
    ['change_booking_status', 'change_payment_status'].includes(mainAction) &&
    !motoPressHotelBookingConf?.selectedStatus
  ) {
    return __('Select a status to continue.', 'bit-integrations')
  }

  const mappedKeys = (motoPressHotelBookingConf?.field_map || [])
    .filter(mappedField => mappedField.formField)
    .map(mappedField => mappedField.motoPressHotelBookingField)

  if (
    ['update_booking_customer', 'update_customer'].includes(mainAction) &&
    mappedKeys.length < 2 &&
    !motoPressHotelBookingConf?.selectedCountry
  ) {
    return __('Map at least one field to change to continue.', 'bit-integrations')
  }

  if (!checkMappedFields(motoPressHotelBookingConf)) {
    return __('Map all required fields to continue.', 'bit-integrations')
  }

  return ''
}
