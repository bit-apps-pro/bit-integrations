import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { fieldsByAction, supportsCustomFields } from './staticData'

const buildAuthRequestParams = conf => ({ connection_id: conf?.connection_id })

export const handleInput = (e, flodeskConf, setFlodeskConf) => {
  const newConf = { ...flodeskConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setFlodeskConf({ ...newConf })
}

const fetchList = (conf, setConf, setIsLoading, route, defaultKey, { loading, success, failed }) => {
  setIsLoading(true)

  const request = bitsFetch(buildAuthRequestParams(conf), route)
    .then(result => {
      if (!result?.success) {
        throw new Error(typeof result?.data === 'string' && result.data ? result.data : failed)
      }

      setConf(prev => ({
        ...prev,
        default: { ...(prev.default || {}), [defaultKey]: result.data || [] }
      }))

      return success
    })
    .finally(() => setIsLoading(false))

  toast.promise(request, {
    success: data => data,
    error: err => err?.message || failed,
    loading
  })
}

export const getSegments = (conf, setConf, setIsLoading) =>
  fetchList(conf, setConf, setIsLoading, 'flodesk_get_segments', 'segments', {
    failed: __('Segment refresh failed. please try again', 'bit-integrations'),
    loading: __('Loading segments...', 'bit-integrations'),
    success: __('Segments refreshed successfully', 'bit-integrations')
  })

export const getWorkflows = (conf, setConf, setIsLoading) =>
  fetchList(conf, setConf, setIsLoading, 'flodesk_get_workflows', 'workflows', {
    failed: __('Workflow refresh failed. please try again', 'bit-integrations'),
    loading: __('Loading workflows...', 'bit-integrations'),
    success: __('Workflows refreshed successfully', 'bit-integrations')
  })

export const getSegmentColors = (conf, setConf, setIsLoading) =>
  fetchList(conf, setConf, setIsLoading, 'flodesk_get_segment_colors', 'colors', {
    failed: __('Colour refresh failed. please try again', 'bit-integrations'),
    loading: __('Loading colours...', 'bit-integrations'),
    success: __('Colours refreshed successfully', 'bit-integrations')
  })

export const getCustomFields = (conf, setConf, setIsLoading) =>
  fetchList(conf, setConf, setIsLoading, 'flodesk_get_custom_fields', 'customFields', {
    failed: __('Custom field refresh failed. please try again', 'bit-integrations'),
    loading: __('Loading custom fields...', 'bit-integrations'),
    success: __('Custom fields refreshed successfully', 'bit-integrations')
  })

export const mappableFields = flodeskConf => {
  const action = flodeskConf?.mainAction
  const staticFields = fieldsByAction[action] || []

  if (!supportsCustomFields.includes(action)) return staticFields

  const custom = (flodeskConf?.default?.customFields || []).map(field => ({
    key: field.fieldKey,
    label: field.fieldLabel,
    required: false
  }))

  return [...staticFields, ...custom]
}

export const generateMappedField = flodeskConf => {
  const requiredFlds = mappableFields(flodeskConf).filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', flodeskField: field.key }))
    : [{ formField: '', flodeskField: '' }]
}

export const checkMappedFields = flodeskConf => {
  if (!flodeskConf?.mainAction) return false

  const requiredKeys = (fieldsByAction[flodeskConf.mainAction] || [])
    .filter(fld => fld.required)
    .map(fld => fld.key)

  const mapped = flodeskConf?.field_map || []
  const isIncomplete = mapped.filter(
    field =>
      !field.flodeskField ||
      (!field.formField && !field.customValue) ||
      (field.formField === 'custom' && !field.customValue)
  )

  if (isIncomplete.length > 0) return false

  return requiredKeys.every(key => mapped.some(field => field.flodeskField === key))
}
