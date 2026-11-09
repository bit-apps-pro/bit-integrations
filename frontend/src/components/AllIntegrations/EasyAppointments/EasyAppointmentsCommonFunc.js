import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { appointmentFormActions, fieldsByAction, requiredScheduleActions } from './staticData'

export const handleInput = (e, easyAppointmentsConf, setEasyAppointmentsConf) => {
  const { name, value } = e.target

  setEasyAppointmentsConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const fetchList =
  (route, dataKey, confKey, successMsg, errorMsg) =>
  (setEasyAppointmentsConf, setIsLoading, notify = true) => {
    setIsLoading?.(true)

    return bitsFetch(null, route)
      .then(result => {
        if (result && result?.success && Array.isArray(result?.data?.[dataKey])) {
          setEasyAppointmentsConf(prevConf =>
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

export const refreshEasyAppointmentsLocations = fetchList(
  'refresh_easy_appointments_locations',
  'locations',
  'allLocations',
  () => __('The locations are loaded.', 'bit-integrations'),
  () => __('The locations did not load. Try again.', 'bit-integrations')
)

export const refreshEasyAppointmentsServices = fetchList(
  'refresh_easy_appointments_services',
  'services',
  'allServices',
  () => __('The services are loaded.', 'bit-integrations'),
  () => __('The services did not load. Try again.', 'bit-integrations')
)

export const refreshEasyAppointmentsEmployees = fetchList(
  'refresh_easy_appointments_employees',
  'employees',
  'allEmployees',
  () => __('The employees are loaded.', 'bit-integrations'),
  () => __('The employees did not load. Try again.', 'bit-integrations')
)

export const refreshEasyAppointmentsStatuses = fetchList(
  'refresh_easy_appointments_statuses',
  'statuses',
  'allStatuses',
  () => __('The statuses are loaded.', 'bit-integrations'),
  () => __('The statuses did not load. Try again.', 'bit-integrations')
)

export const refreshEasyAppointmentsUsers = fetchList(
  'refresh_easy_appointments_users',
  'users',
  'allUsers',
  () => __('The users are loaded.', 'bit-integrations'),
  () => __('The users did not load. Try again.', 'bit-integrations')
)

export const refreshEasyAppointmentsCustomFields = fetchList(
  'refresh_easy_appointments_custom_fields',
  'customFields',
  'allCustomFields',
  () => __('The custom fields are loaded.', 'bit-integrations'),
  () => __('The custom fields did not load. Try again.', 'bit-integrations')
)

export const getActionFields = easyAppointmentsConf => {
  const { mainAction, allCustomFields } = easyAppointmentsConf || {}
  const fields = fieldsByAction[mainAction] || []

  if (!appointmentFormActions.includes(mainAction)) {
    return fields
  }

  return [
    ...fields,
    ...(allCustomFields || []).map(field => ({
      key: field.key,
      label: field.label,
      required: false
    }))
  ]
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        easyAppointmentsField: field.key
      }))
    : [{ formField: '', easyAppointmentsField: '' }]
}

const isBlankRow = mappedField => !mappedField.formField && !mappedField.easyAppointmentsField

export const checkMappedFields = easyAppointmentsConf => {
  const fieldMap = easyAppointmentsConf?.field_map || []
  const invalidRows = fieldMap.filter(
    mappedField =>
      !isBlankRow(mappedField) &&
      (!mappedField.formField ||
        !mappedField.easyAppointmentsField ||
        (mappedField.formField === 'custom' && !mappedField.customValue))
  )

  if (invalidRows.length > 0) {
    return false
  }

  const requiredKeys = (fieldsByAction[easyAppointmentsConf?.mainAction] || [])
    .filter(field => field.required === true)
    .map(field => field.key)

  return requiredKeys.every(key =>
    fieldMap.some(mappedField => mappedField.easyAppointmentsField === key && mappedField.formField)
  )
}

export const getConfError = easyAppointmentsConf => {
  const { mainAction } = easyAppointmentsConf || {}

  if (!mainAction) {
    return __('Select an action to continue.', 'bit-integrations')
  }

  if (requiredScheduleActions.includes(mainAction)) {
    if (!easyAppointmentsConf?.selectedLocation) {
      return __('Select a location to continue.', 'bit-integrations')
    }

    if (!easyAppointmentsConf?.selectedService) {
      return __('Select a service to continue.', 'bit-integrations')
    }

    if (!easyAppointmentsConf?.selectedEmployee) {
      return __('Select an employee to continue.', 'bit-integrations')
    }
  }

  if (mainAction === 'change_appointment_status' && !easyAppointmentsConf?.selectedStatus) {
    return __('Select a status to continue.', 'bit-integrations')
  }

  if (mainAction === 'create_connection' && !easyAppointmentsConf?.selectedDays) {
    return __('Select one or more days to continue.', 'bit-integrations')
  }

  if (!checkMappedFields(easyAppointmentsConf)) {
    return __('Map all required fields to continue.', 'bit-integrations')
  }

  return ''
}
