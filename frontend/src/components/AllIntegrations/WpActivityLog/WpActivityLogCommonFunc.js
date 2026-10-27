import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

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
  () => __('All events fetched successfully', 'bit-integrations'),
  () => __('WP Activity Log events fetch failed. Please try again', 'bit-integrations')
)

export const refreshWpActivityLogUsers = fetchList(
  'refresh_wp_activity_log_users',
  'users',
  'allUsers',
  () => __('All users fetched successfully', 'bit-integrations'),
  () => __('WP Activity Log users fetch failed. Please try again', 'bit-integrations')
)

export const refreshWpActivityLogObjects = fetchList(
  'refresh_wp_activity_log_objects',
  'objects',
  'allObjects',
  () => __('All objects fetched successfully', 'bit-integrations'),
  () => __('WP Activity Log objects fetch failed. Please try again', 'bit-integrations')
)

export const refreshWpActivityLogEventTypes = fetchList(
  'refresh_wp_activity_log_event_types',
  'eventTypes',
  'allEventTypes',
  () => __('All event types fetched successfully', 'bit-integrations'),
  () => __('WP Activity Log event types fetch failed. Please try again', 'bit-integrations')
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
          create(prevConf, draftConf => {
            draftConf.wpActivityLogFields = result.data.fields
            draftConf.field_map = generateMappedField(result.data.fields)
          })
        )
        setIsLoading(false)
        return
      }
      setIsLoading(false)
      toast.error(__('Event data fields fetch failed. Please try again', 'bit-integrations'))
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
