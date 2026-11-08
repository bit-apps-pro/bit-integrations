import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { needsEvent, needsTimeUnit } from './staticData'

export const handleInput = (e, wpActivityLogConf, setWpActivityLogConf) => {
  const { name, value } = e.target

  setWpActivityLogConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const fetchList =
  (route, dataKey, confKey, successMsg, errorMsg) => (setWpActivityLogConf, setIsLoading) => {
    setIsLoading(true)
    bitsFetch(null, route)
      .then(result => {
        if (result && result?.success && result?.data?.[dataKey]) {
          setWpActivityLogConf(prevConf =>
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

export const refreshWpActivityLogEvents = fetchList(
  'refresh_wp_activity_log_events',
  'events',
  'allEvents',
  () => __('The events are loaded.', 'bit-integrations'),
  () => __('The events did not load. Try again.', 'bit-integrations')
)

export const refreshWpActivityLogUsers = fetchList(
  'refresh_wp_activity_log_users',
  'users',
  'allUsers',
  () => __('The users are loaded.', 'bit-integrations'),
  () => __('The users did not load. Try again.', 'bit-integrations')
)

export const refreshWpActivityLogObjects = fetchList(
  'refresh_wp_activity_log_objects',
  'objects',
  'allObjects',
  () => __('The objects are loaded.', 'bit-integrations'),
  () => __('The objects did not load. Try again.', 'bit-integrations')
)

export const refreshWpActivityLogEventTypes = fetchList(
  'refresh_wp_activity_log_event_types',
  'eventTypes',
  'allEventTypes',
  () => __('The event types are loaded.', 'bit-integrations'),
  () => __('The event types did not load. Try again.', 'bit-integrations')
)

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        wpActivityLogField: field.key
      }))
    : [{ formField: '', wpActivityLogField: '' }]
}

export const refreshWpActivityLogEventFields = (eventId, setWpActivityLogConf, setIsLoading) => {
  if (!eventId) {
    return
  }

  setIsLoading(true)
  bitsFetch({ event_id: eventId }, 'refresh_wp_activity_log_event_fields')
    .then(result => {
      if (result && result?.success && Array.isArray(result?.data?.fields)) {
        setWpActivityLogConf(prevConf =>
          prevConf.selectedEvent !== eventId
            ? prevConf
            : create(prevConf, draftConf => {
                draftConf.wpActivityLogFields = result.data.fields
                draftConf.field_map = generateMappedField(result.data.fields)
              })
        )
        setIsLoading(false)
        return
      }
      setIsLoading(false)
      toast.error(__('The event fields did not load. Try again.', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

const isBlankRow = mappedField => !mappedField.formField && !mappedField.wpActivityLogField

export const checkMappedFields = wpActivityLogConf => {
  const fieldMap = wpActivityLogConf?.field_map || []
  const invalidRows = fieldMap.filter(
    mappedField =>
      !isBlankRow(mappedField) &&
      (!mappedField.formField ||
        !mappedField.wpActivityLogField ||
        (mappedField.formField === 'custom' && !mappedField.customValue))
  )

  if (invalidRows.length > 0) {
    return false
  }

  const requiredKeys = (wpActivityLogConf?.wpActivityLogFields || [])
    .filter(field => field.required === true)
    .map(field => field.key)

  return requiredKeys.every(key =>
    fieldMap.some(mappedField => mappedField.wpActivityLogField === key && mappedField.formField)
  )
}

const deleteFilterUtilities = [
  'selected_user',
  'selected_event',
  'selected_severity',
  'selected_object',
  'selected_event_type'
]

export const getConfError = wpActivityLogConf => {
  const { mainAction } = wpActivityLogConf || {}

  if (!mainAction) {
    return __('Select an action to continue.', 'bit-integrations')
  }

  if (needsEvent.includes(mainAction) && !wpActivityLogConf?.selectedEvent) {
    return __('Select an event to continue.', 'bit-integrations')
  }

  if (needsTimeUnit.includes(mainAction) && !wpActivityLogConf?.selectedTimeUnit) {
    return __('Select a time unit to continue.', 'bit-integrations')
  }

  if (!checkMappedFields(wpActivityLogConf)) {
    return __('Map all required fields to continue.', 'bit-integrations')
  }

  if (mainAction === 'delete_events') {
    const hasUtilityFilter = deleteFilterUtilities.some(key => wpActivityLogConf?.utilities?.[key])
    const hasMappedFilter = (wpActivityLogConf?.field_map || []).some(
      mappedField => mappedField.formField && mappedField.wpActivityLogField
    )

    if (!hasUtilityFilter && !hasMappedFilter) {
      return __('Set at least one filter to continue.', 'bit-integrations')
    }
  }

  return ''
}
