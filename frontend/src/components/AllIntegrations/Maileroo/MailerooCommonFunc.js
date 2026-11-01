import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { customKeysByAction, fieldsByAction, selectsByAction } from './staticData'

const sources = {
  dedicatedIps: 'maileroo_get_dedicated_ips',
  domains: 'maileroo_get_domains',
  templates: 'maileroo_get_templates'
}

const setSourceOptions = (setConf, source, options) =>
  setConf(prev => ({
    ...prev,
    default: { ...(prev.default || {}), [source]: options }
  }))

export const handleInput = (e, mailerooConf, setMailerooConf) => {
  const newConf = { ...mailerooConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setMailerooConf({ ...newConf })
}

export const fetchSource = (source, conf, setConf, setIsLoading, silent = false) => {
  const route = sources[source]

  if (!route) return

  setIsLoading(true)

  const request = bitsFetch({ connection_id: conf?.connection_id }, route).then(result => {
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
  const actionSources = (selectsByAction[conf?.mainAction] || [])
    .map(select => select.source)
    .filter(Boolean)

  ;[...new Set(actionSources)].forEach(source => fetchSource(source, conf, setConf, setIsLoading, true))
}

export const getActionFields = mailerooConf =>
  (fieldsByAction[mailerooConf?.mainAction] || []).filter(
    fld => !fld.when || Object.entries(fld.when).every(([key, value]) => mailerooConf?.[key] === value)
  )

export const getCustomKeys = mailerooConf => customKeysByAction[mailerooConf?.mainAction] || []

export const syncMappedFields = mailerooConf => {
  const actionFields = getActionFields(mailerooConf)
  const requiredKeys = actionFields.filter(fld => fld.required).map(fld => fld.key)
  const allowedKeys = [
    '',
    ...actionFields.map(fld => fld.key),
    ...getCustomKeys(mailerooConf).map(customKey => customKey.key)
  ]
  const fieldMap = mailerooConf?.field_map || []

  const requiredRows = requiredKeys.map(
    key => fieldMap.find(row => row.mailerooField === key) || { formField: '', mailerooField: key }
  )
  const optionalRows = fieldMap.filter(
    row => !requiredKeys.includes(row.mailerooField) && allowedKeys.includes(row.mailerooField ?? '')
  )
  const rows = [...requiredRows, ...optionalRows]

  if (rows.length === 0 && allowedKeys.length > 1) {
    return [{ formField: '', mailerooField: '' }]
  }

  return rows
}

export const generateMappedField = mailerooConf => syncMappedFields({ ...mailerooConf, field_map: [] })

export const checkMappedFields = mailerooConf => {
  if (!mailerooConf?.mainAction) return false

  const missingSelect = (selectsByAction[mailerooConf.mainAction] || []).some(
    select => select.required && !mailerooConf[select.key]?.length
  )

  if (missingSelect) return false

  const fieldMap = mailerooConf.field_map || []
  const customKeys = getCustomKeys(mailerooConf).map(customKey => customKey.key)
  const mappedKeys = fieldMap.map(row => row.mailerooField)
  const missingRequired = getActionFields(mailerooConf).some(
    fld => fld.required && !mappedKeys.includes(fld.key)
  )

  if (missingRequired) return false

  const incompleteRows = fieldMap.filter(
    mappedField =>
      !mappedField.formField ||
      !mappedField.mailerooField ||
      (customKeys.includes(mappedField.mailerooField) && !mappedField.customFieldKey?.trim()) ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )

  return incompleteRows.length === 0
}
