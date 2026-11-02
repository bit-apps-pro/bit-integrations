import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { fieldsByAction, needsStatus, needsTables } from './staticData'

export const handleInput = (e, restaurantReservationsConf, setRestaurantReservationsConf) => {
  const { name, value } = e.target

  setRestaurantReservationsConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const fetchList =
  (route, dataKey, confKey, successMsg, errorMsg) => (setRestaurantReservationsConf, setIsLoading) => {
    setIsLoading(true)
    bitsFetch(null, route)
      .then(result => {
        if (result && result?.success && Array.isArray(result?.data?.[dataKey])) {
          setRestaurantReservationsConf(prevConf =>
            create(prevConf, draftConf => {
              draftConf[confKey] = result.data[dataKey]
            })
          )

          setIsLoading(false)
          toast.success(successMsg())
          return
        }
        setIsLoading(false)
        toast.error(errorMsg())
      })
      .catch(() => setIsLoading(false))
  }

export const refreshRestaurantReservationsStatuses = fetchList(
  'refresh_restaurant_reservations_statuses',
  'statuses',
  'allStatuses',
  () => __('The statuses are loaded.', 'bit-integrations'),
  () => __('The statuses did not load. Try again.', 'bit-integrations')
)

export const refreshRestaurantReservationsLocations = fetchList(
  'refresh_restaurant_reservations_locations',
  'locations',
  'allLocations',
  () => __('The locations are loaded.', 'bit-integrations'),
  () => __('The locations did not load. Try again.', 'bit-integrations')
)

export const refreshRestaurantReservationsTables = fetchList(
  'refresh_restaurant_reservations_tables',
  'tables',
  'allTables',
  () => __('The tables are loaded.', 'bit-integrations'),
  () => __('The tables did not load. Try again.', 'bit-integrations')
)

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        restaurantReservationsField: field.key
      }))
    : [{ formField: '', restaurantReservationsField: '' }]
}

const isBlankRow = mappedField => !mappedField.formField && !mappedField.restaurantReservationsField

export const checkMappedFields = restaurantReservationsConf => {
  const fieldMap = restaurantReservationsConf?.field_map || []
  const invalidRows = fieldMap.filter(
    mappedField =>
      !isBlankRow(mappedField) &&
      (!mappedField.formField ||
        !mappedField.restaurantReservationsField ||
        (mappedField.formField === 'custom' && !mappedField.customValue))
  )

  if (invalidRows.length > 0) {
    return false
  }

  const requiredKeys = (fieldsByAction[restaurantReservationsConf?.mainAction] || [])
    .filter(field => field.required === true)
    .map(field => field.key)

  return requiredKeys.every(key =>
    fieldMap.some(
      mappedField => mappedField.restaurantReservationsField === key && mappedField.formField
    )
  )
}

export const getConfError = restaurantReservationsConf => {
  const { mainAction } = restaurantReservationsConf || {}

  if (!mainAction) {
    return __('Select an action to continue.', 'bit-integrations')
  }

  if (needsStatus.includes(mainAction) && !restaurantReservationsConf?.selectedStatus) {
    return __('Select a status to continue.', 'bit-integrations')
  }

  if (needsTables.includes(mainAction) && !restaurantReservationsConf?.selectedTables) {
    return __('Select one or more tables to continue.', 'bit-integrations')
  }

  if (!checkMappedFields(restaurantReservationsConf)) {
    return __('Map all required fields to continue.', 'bit-integrations')
  }

  return ''
}
