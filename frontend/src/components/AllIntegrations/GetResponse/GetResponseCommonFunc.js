/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (
  e,
  getResponseConf,
  setGetResponseConf,
  setLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  const newConf = { ...getResponseConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setGetResponseConf({ ...newConf })
}

export const generateMappedField = getResponseConf => {
  const requiredFlds = getResponseConf?.contactsFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', getResponseFormField: field.key }))
    : [{ formField: '', getResponseFormField: '' }]
}

export const checkMappedFields = getResponseConf => {
  const mappedFields = getResponseConf?.field_map
    ? getResponseConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.getResponseFormField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id ? { connection_id: confTmp.connection_id } : { auth_token: confTmp.auth_token }

export const fetchCampaigns = (
  confTmp,
  setConf,
  setError,
  setisAuthorized,
  loading,
  setLoading,
  type = 'authentication'
) => {
  if (!confTmp.connection_id && !confTmp.auth_token) {
    setError?.({
      auth_token: !confTmp.auth_token ? __("Api Key can't be empty", 'bit-integrations') : ''
    })
    return
  }

  setError?.({})

  if (type === 'authentication') {
    setLoading({ ...loading, auth: true })
  }

  if (type === 'refreshCampaigns') {
    setLoading({ ...loading, customFields: true })
  }

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'getresponse_fetch_all_list').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.campaigns = result.data
      }
      setConf(newConf)
      setisAuthorized?.(true)

      if (type === 'authentication') {
        setLoading({ ...loading, auth: false })
        toast.success(__('Authorized Successfully', 'bit-integrations'))
      } else if (type === 'refreshCampaigns') {
        setLoading({ ...loading, customFields: false })
        toast.success(__('Campaigns fetched successfully', 'bit-integrations'))
      }
      return
    }

    setLoading({ ...loading, auth: false, customFields: false })
    toast.error(__('Campaigns fetching failed', 'bit-integrations'))
  })
}

export const getAllTags = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, tags: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'getresponse_fetch_all_tags').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.tags = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, tags: false })

      toast.success(__('Tags fetch successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, tags: false })
    toast.error(__('Tags fetch failed', 'bit-integrations'))
  })
}

export const fetchCustomFields = (confTmp, setConf, setLoading, type) => {
  if (type === 'manual') {
    setLoading({ ...setLoading, field: true })
  }

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'getresponse_fetch_custom_fields').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.contactsFields = [...newConf.contactsFields, ...result.data]
      }
      setConf(newConf)
      if (type === 'manual') {
        setLoading({ ...setLoading, field: false })
        toast.success(__('Custom fields fetched successfully', 'bit-integrations'))
      }
      return
    }
    toast.error(__('Custom fields fetch failed', 'bit-integrations'))
  })
}
