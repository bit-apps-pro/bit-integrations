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

const hasAuthParams = conf =>
  Boolean(conf?.connection_id || (conf?.subdomain && conf?.email && conf?.apiToken))

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        subdomain: conf?.subdomain,
        email: conf?.email,
        apiToken: conf?.apiToken
      }

export const fetchUtilityOptions = (confTmp, setConf, setLoading, route, listKey) => {
  if (!hasAuthParams(confTmp)) {
    toast.error(__('Please authorize first', 'bit-integrations'))
    return
  }

  setLoading(prev => ({ ...prev, [listKey]: true }))

  const requestParams = buildAuthRequestParams(confTmp)

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
