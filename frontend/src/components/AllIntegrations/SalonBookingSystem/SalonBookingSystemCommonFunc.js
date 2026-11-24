import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { fieldsByAction } from './staticData'

export const handleInput = (e, salonBookingSystemConf, setSalonBookingSystemConf) => {
  const { name, value } = e.target

  setSalonBookingSystemConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const fetchList =
  (route, dataKey, confKey, successMsg, errorMsg) =>
  (setSalonBookingSystemConf, setIsLoading, notify = true) => {
    setIsLoading?.(true)

    return bitsFetch(null, route)
      .then(result => {
        if (result && result?.success && Array.isArray(result?.data?.[dataKey])) {
          setSalonBookingSystemConf(prevConf =>
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

export const refreshSalonBookingSystemServices = fetchList(
  'refresh_salon_booking_system_services',
  'services',
  'allServices',
  () => __('The services are loaded.', 'bit-integrations'),
  () => __('The services did not load. Try again.', 'bit-integrations')
)

export const refreshSalonBookingSystemAssistants = fetchList(
  'refresh_salon_booking_system_assistants',
  'assistants',
  'allAssistants',
  () => __('The assistants are loaded.', 'bit-integrations'),
  () => __('The assistants did not load. Try again.', 'bit-integrations')
)

export const refreshSalonBookingSystemStatuses = fetchList(
  'refresh_salon_booking_system_statuses',
  'statuses',
  'allStatuses',
  () => __('The statuses are loaded.', 'bit-integrations'),
  () => __('The statuses did not load. Try again.', 'bit-integrations')
)

export const refreshSalonBookingSystemCategories = fetchList(
  'refresh_salon_booking_system_service_categories',
  'categories',
  'allCategories',
  () => __('The categories are loaded.', 'bit-integrations'),
  () => __('The categories did not load. Try again.', 'bit-integrations')
)

export const getActionFields = salonBookingSystemConf =>
  fieldsByAction[salonBookingSystemConf?.mainAction] || []

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        salonBookingSystemField: field.key
      }))
    : [{ formField: '', salonBookingSystemField: '' }]
}

const isBlankRow = mappedField => !mappedField.formField && !mappedField.salonBookingSystemField

export const checkMappedFields = salonBookingSystemConf => {
  const fieldMap = salonBookingSystemConf?.field_map || []
  const invalidRows = fieldMap.filter(
    mappedField =>
      !isBlankRow(mappedField) &&
      (!mappedField.formField ||
        !mappedField.salonBookingSystemField ||
        (mappedField.formField === 'custom' && !mappedField.customValue))
  )

  if (invalidRows.length > 0) {
    return false
  }

  const requiredKeys = (fieldsByAction[salonBookingSystemConf?.mainAction] || [])
    .filter(field => field.required === true)
    .map(field => field.key)

  return requiredKeys.every(key =>
    fieldMap.some(mappedField => mappedField.salonBookingSystemField === key && mappedField.formField)
  )
}

export const getConfError = salonBookingSystemConf => {
  const { mainAction } = salonBookingSystemConf || {}

  if (!mainAction) {
    return __('Select an action to continue.', 'bit-integrations')
  }

  if (mainAction === 'create_booking' && !salonBookingSystemConf?.selectedServices) {
    return __('Select one or more services to continue.', 'bit-integrations')
  }

  if (mainAction === 'change_booking_status' && !salonBookingSystemConf?.selectedStatus) {
    return __('Select a status to continue.', 'bit-integrations')
  }

  if (mainAction === 'send_booking_summary' && !salonBookingSystemConf?.selectedRecipients) {
    return __('Select the recipients to continue.', 'bit-integrations')
  }

  if (mainAction === 'set_attendance_result' && !salonBookingSystemConf?.selectedAttendance) {
    return __('Select an attendance result to continue.', 'bit-integrations')
  }

  if (!checkMappedFields(salonBookingSystemConf)) {
    return __('Map all required fields to continue.', 'bit-integrations')
  }

  return ''
}
