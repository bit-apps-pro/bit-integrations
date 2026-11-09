import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { fieldsByAction } from './staticData'

export const handleInput = (e, motoPressAppointmentBookingConf, setMotoPressAppointmentBookingConf) => {
  const { name, value } = e.target

  setMotoPressAppointmentBookingConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const fetchList =
  (route, dataKey, confKey, successMsg, errorMsg) =>
  (setMotoPressAppointmentBookingConf, setIsLoading, notify = true) => {
    setIsLoading?.(true)

    return bitsFetch(null, route)
      .then(result => {
        if (result && result?.success && Array.isArray(result?.data?.[dataKey])) {
          setMotoPressAppointmentBookingConf(prevConf =>
            create(prevConf, draftConf => {
              draftConf[confKey] = result.data[dataKey]
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

export const refreshMotoPressAppointmentBookingServices = fetchList(
  'refresh_motopress_appointment_booking_services',
  'services',
  'allServices',
  () => __('The services are loaded.', 'bit-integrations'),
  () => __('The services did not load. Try again.', 'bit-integrations')
)

export const refreshMotoPressAppointmentBookingEmployees = fetchList(
  'refresh_motopress_appointment_booking_employees',
  'employees',
  'allEmployees',
  () => __('The employees are loaded.', 'bit-integrations'),
  () => __('The employees did not load. Try again.', 'bit-integrations')
)

export const refreshMotoPressAppointmentBookingLocations = fetchList(
  'refresh_motopress_appointment_booking_locations',
  'locations',
  'allLocations',
  () => __('The locations are loaded.', 'bit-integrations'),
  () => __('The locations did not load. Try again.', 'bit-integrations')
)

export const refreshMotoPressAppointmentBookingGateways = fetchList(
  'refresh_motopress_appointment_booking_gateways',
  'gateways',
  'allGateways',
  () => __('The payment gateways are loaded.', 'bit-integrations'),
  () => __('The payment gateways did not load. Try again.', 'bit-integrations')
)

export const refreshMotoPressAppointmentBookingCurrencies = fetchList(
  'refresh_motopress_appointment_booking_currencies',
  'currencies',
  'allCurrencies',
  () => __('The currencies are loaded.', 'bit-integrations'),
  () => __('The currencies did not load. Try again.', 'bit-integrations')
)

export const refreshMotoPressAppointmentBookingUsers = fetchList(
  'refresh_motopress_appointment_booking_users',
  'users',
  'allUsers',
  () => __('The users are loaded.', 'bit-integrations'),
  () => __('The users did not load. Try again.', 'bit-integrations')
)

export const getActionFields = motoPressAppointmentBookingConf =>
  fieldsByAction[motoPressAppointmentBookingConf?.mainAction] || []

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        motoPressAppointmentBookingField: field.key
      }))
    : [{ formField: '', motoPressAppointmentBookingField: '' }]
}

const isBlankRow = mappedField => !mappedField.formField && !mappedField.motoPressAppointmentBookingField

export const checkMappedFields = motoPressAppointmentBookingConf => {
  const fieldMap = motoPressAppointmentBookingConf?.field_map || []
  const invalidRows = fieldMap.filter(
    mappedField =>
      !isBlankRow(mappedField) &&
      (!mappedField.formField ||
        !mappedField.motoPressAppointmentBookingField ||
        (mappedField.formField === 'custom' && !mappedField.customValue))
  )

  if (invalidRows.length > 0) {
    return false
  }

  const requiredKeys = (fieldsByAction[motoPressAppointmentBookingConf?.mainAction] || [])
    .filter(field => field.required === true)
    .map(field => field.key)

  return requiredKeys.every(key =>
    fieldMap.some(
      mappedField => mappedField.motoPressAppointmentBookingField === key && mappedField.formField
    )
  )
}

export const getConfError = motoPressAppointmentBookingConf => {
  const { mainAction } = motoPressAppointmentBookingConf || {}

  if (!mainAction) {
    return __('Select an action to continue.', 'bit-integrations')
  }

  if (mainAction === 'create_booking' && !motoPressAppointmentBookingConf?.selectedService) {
    return __('Select a service to continue.', 'bit-integrations')
  }

  if (
    ['change_booking_status', 'change_payment_status'].includes(mainAction) &&
    !motoPressAppointmentBookingConf?.selectedStatus
  ) {
    return __('Select a status to continue.', 'bit-integrations')
  }

  const mappedKeys = (motoPressAppointmentBookingConf?.field_map || [])
    .filter(mappedField => mappedField.formField)
    .map(mappedField => mappedField.motoPressAppointmentBookingField)

  if (
    mainAction === 'create_customer' &&
    !mappedKeys.includes('email') &&
    !mappedKeys.includes('phone')
  ) {
    return __('Map an email or a phone to continue.', 'bit-integrations')
  }

  if (
    ['update_booking', 'update_customer'].includes(mainAction) &&
    mappedKeys.length < 2 &&
    !motoPressAppointmentBookingConf?.selectedUser
  ) {
    return __('Map at least one field to change to continue.', 'bit-integrations')
  }

  if (!checkMappedFields(motoPressAppointmentBookingConf)) {
    return __('Map all required fields to continue.', 'bit-integrations')
  }

  return ''
}
