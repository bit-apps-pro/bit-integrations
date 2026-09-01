import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __, sprintf } from '../../../Utils/i18nwrap'

export const handleInput = (e, roxAppointmentBookingConf, setRoxAppointmentBookingConf) => {
  const { name, value } = e.target

  setRoxAppointmentBookingConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

// Catalog lists behind the config dropdowns. These reference records the admin picks once
// per flow, so they are selects — not field-map rows that vary per run.
const refreshList = (route, dataKey, confKey, label, setRoxAppointmentBookingConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, route)
    .then(result => {
      if (result?.success && result?.data?.[dataKey]) {
        setRoxAppointmentBookingConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf[confKey] = result.data[dataKey]
          })
        )
        setIsLoading(false)
        toast.success(label.fetched)
        return
      }
      setIsLoading(false)
      toast.error(label.failed)
    })
    .catch(() => setIsLoading(false))
}

export const refreshServices = (setRoxAppointmentBookingConf, setIsLoading) =>
  refreshList(
    'refresh_rox_appointment_booking_services',
    'services',
    'allServices',
    {
      fetched: __('All services fetched successfully', 'bit-integrations'),
      failed: __('Services fetch failed. Please try again', 'bit-integrations')
    },
    setRoxAppointmentBookingConf,
    setIsLoading
  )

export const refreshAgents = (setRoxAppointmentBookingConf, setIsLoading) =>
  refreshList(
    'refresh_rox_appointment_booking_agents',
    'agents',
    'allAgents',
    {
      fetched: __('All agents fetched successfully', 'bit-integrations'),
      failed: __('Agents fetch failed. Please try again', 'bit-integrations')
    },
    setRoxAppointmentBookingConf,
    setIsLoading
  )

export const refreshCategories = (setRoxAppointmentBookingConf, setIsLoading) =>
  refreshList(
    'refresh_rox_appointment_booking_categories',
    'categories',
    'allCategories',
    {
      fetched: __('All categories fetched successfully', 'bit-integrations'),
      failed: __('Categories fetch failed. Please try again', 'bit-integrations')
    },
    setRoxAppointmentBookingConf,
    setIsLoading
  )

export const refreshLocations = (setRoxAppointmentBookingConf, setIsLoading) =>
  refreshList(
    'refresh_rox_appointment_booking_locations',
    'locations',
    'allLocations',
    {
      fetched: __('All locations fetched successfully', 'bit-integrations'),
      failed: __('Locations fetch failed. Please try again', 'bit-integrations')
    },
    setRoxAppointmentBookingConf,
    setIsLoading
  )

export const checkMappedFields = roxAppointmentBookingConf => {
  const mappedFields = roxAppointmentBookingConf?.field_map
    ? roxAppointmentBookingConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.roxAppointmentBookingField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  if (mappedFields.length > 0) {
    return false
  }

  return true
}

export const generateMappedField = (fields, eitherGroups = []) => {
  const rows = fields
    .filter(fld => fld.required === true)
    .map(field => ({ formField: '', roxAppointmentBookingField: field.key }))

  // An either-group is mandatory but satisfied by any one of its keys, so it carries no
  // required flag. Seed a row with the group's first key (the id) so the requirement is
  // visible up front; the user can switch that row to the natural key in the dropdown.
  eitherGroups.forEach(group => {
    if (group.length === 0) return
    if (rows.some(row => group.includes(row.roxAppointmentBookingField))) return

    rows.push({ formField: '', roxAppointmentBookingField: group[0] })
  })

  return rows.length > 0 ? rows : [{ formField: '', roxAppointmentBookingField: '' }]
}

// Everything IntegLayout owns that the field map cannot express: the required status
// enums, and the id/natural-key pairs where either one satisfies the requirement.
export const checkRequiredSelect = (roxAppointmentBookingConf, requiredEitherFields) => {
  const { mainAction } = roxAppointmentBookingConf || {}

  if (mainAction === 'update_service_status' && !roxAppointmentBookingConf?.selectedServiceStatus) {
    return __('Please select a service status to continue.', 'bit-integrations')
  }

  if (
    mainAction === 'update_appointment_status' &&
    !roxAppointmentBookingConf?.selectedAppointmentStatus
  ) {
    return __('Please select an appointment status to continue.', 'bit-integrations')
  }

  if (mainAction === 'update_order_status' && !roxAppointmentBookingConf?.selectedOrderStatus) {
    return __('Please select an order status to continue.', 'bit-integrations')
  }

  if (mainAction === 'update_payment_status' && !roxAppointmentBookingConf?.selectedPaymentStatus) {
    return __('Please select a payment status to continue.', 'bit-integrations')
  }

  if (mainAction === 'create_appointment' && !roxAppointmentBookingConf?.selectedService) {
    return __('Please select a service to continue.', 'bit-integrations')
  }

  const mappedKeys = (roxAppointmentBookingConf?.field_map || [])
    .filter(row => row.formField && (row.formField !== 'custom' || row.customValue))
    .map(row => row.roxAppointmentBookingField)

  const pairs = requiredEitherFields?.[mainAction] || []
  const unsatisfied = pairs.find(keys => !keys.some(key => mappedKeys.includes(key)))

  if (unsatisfied) {
    return sprintf(
      __('Please map one of these fields to continue: %s', 'bit-integrations'),
      unsatisfied.join(', ')
    )
  }

  return ''
}
