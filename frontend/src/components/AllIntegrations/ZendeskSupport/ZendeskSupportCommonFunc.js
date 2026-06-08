/* eslint-disable no-console */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { ZendeskSupportStaticData } from './staticData'

export const handleInput = (e, conf, setConf) => {
  const newConf = { ...conf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setConf({ ...newConf })
}

export const generateMappedField = conf => {
  const allFields = ZendeskSupportStaticData[conf.actionName] || []
  const requiredFlds = allFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', zendeskSupportField: field.key }))
    : [{ formField: '', zendeskSupportField: '' }]
}

export const checkMappedFields = conf => {
  if (!conf?.actionName) {
    return false
  }
  const mappedFields = conf?.field_map
    ? conf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.zendeskSupportField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  return mappedFields.length === 0
}

export const fetchUtilityOptions = (confTmp, setConf, setLoading, route, listKey) => {
  if (!confTmp.subdomain || !confTmp.email || !confTmp.apiToken) {
    toast.error(__('Please authorize first', 'bit-integrations'))
    return
  }

  setLoading(prev => ({ ...prev, [listKey]: true }))

  const requestParams = {
    subdomain: confTmp.subdomain,
    email: confTmp.email,
    apiToken: confTmp.apiToken
  }

  bitsFetch(requestParams, route).then(result => {
    if (result && result.success) {
      setConf(prev => ({ ...prev, [listKey]: result.data || [] }))
      setLoading(prev => ({ ...prev, [listKey]: false }))
      toast.success(__('Data fetched successfully', 'bit-integrations'))
      return
    }
    setLoading(prev => ({ ...prev, [listKey]: false }))
    toast.error(__('Data fetching failed', 'bit-integrations'))
  })
}

export const zendeskSupportAuthorize = (
  confTmp,
  setConf,
  setError,
  setIsAuthorized,
  loading,
  setLoading
) => {
  if (!confTmp.subdomain || !confTmp.email || !confTmp.apiToken) {
    setError({
      subdomain: !confTmp.subdomain ? __("Subdomain can't be empty", 'bit-integrations') : '',
      email: !confTmp.email ? __("Email can't be empty", 'bit-integrations') : '',
      apiToken: !confTmp.apiToken ? __("API Token can't be empty", 'bit-integrations') : ''
    })
    return
  }

  setError({})
  setLoading({ ...loading, auth: true })

  const requestParams = {
    subdomain: confTmp.subdomain,
    email: confTmp.email,
    apiToken: confTmp.apiToken
  }

  bitsFetch(requestParams, 'zendesk_support_authorize').then(result => {
    if (result && result.success) {
      setIsAuthorized(true)
      setLoading({ ...loading, auth: false })
      toast.success(__('Authorized Successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, auth: false })
    toast.error(__('Authorization failed, please enter valid credentials', 'bit-integrations'))
  })
}
