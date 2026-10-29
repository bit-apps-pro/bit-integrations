import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { fieldsByAction, selectsByAction } from './staticData'

const sources = {
  categories: { route: 'eventbrite_get_categories' },
  events: { requires: 'organization_id', route: 'eventbrite_get_events' },
  formats: { route: 'eventbrite_get_formats' },
  organizations: { route: 'eventbrite_get_organizations' },
  subcategories: { requires: 'category_id', route: 'eventbrite_get_subcategories' },
  ticketClasses: { requires: 'event_id', route: 'eventbrite_get_ticket_classes' },
  ticketGroups: { requires: 'organization_id', route: 'eventbrite_get_ticket_groups' },
  venues: { optional: 'organization_id', route: 'eventbrite_get_venues' }
}

const setSourceOptions = (setConf, source, options) =>
  setConf(prev => ({
    ...prev,
    default: { ...(prev.default || {}), [source]: options }
  }))

export const handleInput = (e, eventbriteConf, setEventbriteConf) => {
  const newConf = { ...eventbriteConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setEventbriteConf({ ...newConf })
}

export const fetchSource = (source, conf, setConf, setIsLoading, silent = false) => {
  const { optional, requires, route } = sources[source] || {}

  if (!route) return

  const params = { connection_id: conf?.connection_id }

  if (requires) {
    if (!conf?.[requires]) {
      setSourceOptions(setConf, source, [])
      return
    }
    params[requires] = conf[requires]
  }

  if (optional && conf?.[optional]) {
    params[optional] = conf[optional]
  }

  setIsLoading(true)

  const request = bitsFetch(params, route).then(result => {
    setIsLoading(false)

    if (result?.success) {
      setSourceOptions(setConf, source, result.data || [])
      return __('Options refreshed', 'bit-integrations')
    }

    throw new Error(
      typeof result?.data === 'string'
        ? result.data
        : __('Refresh failed. Please try again', 'bit-integrations')
    )
  })

  if (silent) {
    request.catch(error => toast.error(error.message))
    return
  }

  toast.promise(request, {
    error: error => error.message,
    loading: __('Loading options...', 'bit-integrations'),
    success: message => message
  })
}

export const fetchActionSources = (conf, setConf, setIsLoading) => {
  ;(selectsByAction[conf?.mainAction] || [])
    .filter(select => select.source)
    .forEach(select => fetchSource(select.source, conf, setConf, setIsLoading, true))
}

export const generateMappedField = eventbriteConf => {
  const requiredFlds = (fieldsByAction[eventbriteConf?.mainAction] || []).filter(
    fld => fld.required === true
  )

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ eventbriteField: field.key, formField: '' }))
    : [{ eventbriteField: '', formField: '' }]
}

export const checkMappedFields = eventbriteConf => {
  if (!eventbriteConf?.mainAction) return false

  const missingSelect = (selectsByAction[eventbriteConf.mainAction] || []).some(
    select => select.required && !eventbriteConf[select.key]?.length
  )

  if (missingSelect) return false

  const incompleteRows = (eventbriteConf.field_map || []).filter(
    mappedField =>
      !mappedField.formField ||
      !mappedField.eventbriteField ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )

  return incompleteRows.length === 0
}
