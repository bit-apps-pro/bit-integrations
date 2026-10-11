import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { fieldsByAction, selectsByAction } from './staticData'

const sources = {
  channels: { route: 'pushbullet_get_channels' },
  devices: { route: 'pushbullet_get_devices' },
  smsDevices: { params: { sms_only: 1 }, route: 'pushbullet_get_devices' }
}

const setSourceOptions = (setConf, source, options) =>
  setConf(prev => ({
    ...prev,
    default: { ...(prev.default || {}), [source]: options }
  }))

export const handleInput = (e, pushbulletConf, setPushbulletConf) => {
  const newConf = { ...pushbulletConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setPushbulletConf({ ...newConf })
}

export const fetchSource = (source, conf, setConf, setIsLoading, silent = false) => {
  const { params, route } = sources[source] || {}

  if (!route) return

  setIsLoading(true)

  const request = bitsFetch({ connection_id: conf?.connection_id, ...params }, route).then(result => {
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

export const generateMappedField = pushbulletConf => {
  const actionFields = fieldsByAction[pushbulletConf?.mainAction] || []
  const requiredFlds = actionFields.filter(fld => fld.required === true)

  if (requiredFlds.length > 0) {
    return requiredFlds.map(field => ({ formField: '', pushbulletField: field.key }))
  }

  return actionFields.length > 0 ? [{ formField: '', pushbulletField: '' }] : []
}

export const checkMappedFields = pushbulletConf => {
  if (!pushbulletConf?.mainAction) return false

  const missingSelect = (selectsByAction[pushbulletConf.mainAction] || []).some(
    select => select.required && !pushbulletConf[select.key]?.length
  )

  if (missingSelect) return false

  const incompleteRows = (pushbulletConf.field_map || []).filter(
    mappedField =>
      !mappedField.formField ||
      !mappedField.pushbulletField ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )

  return incompleteRows.length === 0
}
