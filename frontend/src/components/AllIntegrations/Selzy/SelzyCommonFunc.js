/* eslint-disable no-unused-expressions */
/* eslint-disable no-else-return */

import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { saveActionConf, saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'

export const handleInput = (e, conf, setConf, error, setError) => {
  const newConf = { ...conf }
  const inputError = { ...error }
  inputError[e.target.name] = ''
  newConf[e.target.name] = e.target.value
  setError(inputError)
  setConf(newConf)
}

export const handleAuthorize = (conf, setConf, setError, setAuthorized, loading, setLoading) => {
  if (!conf.authKey) {
    setError({ authKey: !conf.authKey ? __("API Key can't be empty") : '' })
    return
  }
  setError({})
  setLoading({ ...loading, auth: true })

  const requestParams = { authKey: conf.authKey }

  bitsFetch(requestParams, 'selzy_handle_authorize').then(result => {
    if (result.success && result.data) {
      const newConf = { ...conf }
      if (result.data) {
        if (!newConf.default) {
          newConf.default = {}
        }
        const data = result.data.result?.map(v => ({
          ...v,
          id: String(v.id)
        }))
        newConf.default.lists = data
      }
      getAllCustomFields(newConf, setConf, loading, setLoading)
      setConf(newConf)
      setAuthorized(true)
      setLoading({ ...loading, auth: false })
      toast.success(__('Authorized Successfully'))
      return
    }
    setLoading({ ...loading, auth: false })
    toast.error(__('Authorized failed'))
  })
}

export const getAllLists = async (conf, setConf, loading, setLoading) => {
  setLoading({ ...loading, list: true })
  const requestParams = { authKey: conf.authKey }
  const result = await bitsFetch(requestParams, 'selzy_handle_authorize')
  if (result.success) {
    const data = result.data.result?.map(v => ({ ...v, id: String(v.id) }))
    const newConf = { ...conf }
    if (data) {
      if (!newConf.default) {
        newConf.default = {}
      }
      newConf.default.lists = data
      setConf(newConf)
      setLoading({ ...loading, list: false })
      toast.success(__('List refresh successfully'))
      return
    }
  }
  setLoading({ ...loading, list: false })
  toast.success(__('List refresh failed'))
}

export const getAllTags = async (conf, setConf, loading, setLoading) => {
  setLoading && setLoading({ ...loading, tag: true })
  const requestParams = { authKey: conf.authKey }
  const result = await bitsFetch(requestParams, 'selzy_get_all_tags')
  if (result.success) {
    const data = result.data.result
    const newConf = { ...conf }
    if (data) {
      if (!newConf.default) {
        newConf.default = {}
      }
      newConf.default.tags = data
      setConf(newConf)
      if (setLoading) {
        setLoading({ ...loading, tag: false })
        toast.success(__('Tag refresh successfully'))
      }
    }
    return true
  }
  if (setLoading) {
    setLoading({ ...loading, tag: false })
    toast.success(__('Tag refresh failed'))
  }
  return false
}

export const getAllCustomFields = async (conf, setConf, loading, setLoading) => {
  setLoading && setLoading({ ...loading, customFields: true })
  const requestParams = { authKey: conf.authKey }
  const result = await bitsFetch(requestParams, 'selzy_get_all_custom_fields')
  if (result.success) {
    const newConf = { ...conf }
    if (result.data) {
      if (!newConf.default) {
        newConf.default = {}
      }
      newConf.default.customFields = result.data
      setConf(newConf)
      if (setLoading) {
        setLoading({ ...loading, customFields: false })
        toast.success(__('Custom fileds fetched successfully'))
      }
    }
    return true
  }
  if (setLoading) {
    setLoading({ ...loading, customFields: false })
    toast.success(__('Custom fileds fetching failed'))
  }
  return false
}

export const generateMappedField = selzyConf => {
  const requiredFlds = selzyConf?.selzyFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        selzyFormField: field.key
      }))
    : [{ formField: '', selzyFormField: '' }]
}

const checkMappedFields = selzyConf => {
  const mappedFields = selzyConf?.field_map
    ? selzyConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.selzyFormField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const nextPage = (conf, setStep, pageNo) => {
  setTimeout(() => {
    document.getElementById('btcd-settings-wrp').scrollTop = 0
  }, 300)

  if (!checkMappedFields(conf)) {
    toast.error(__('Please map mandatory fields', 'bit-integrations'))
    return
  }
  conf.field_map.length > 0 && setStep(pageNo)
}

export const saveConfig = (flow, setFlow, allIntegURL, conf, navigate, setLoading) => {
  setLoading(true)
  const resp = saveIntegConfig(flow, setFlow, allIntegURL, conf, navigate, '', '', setLoading)
  resp.then(res => {
    if (res.success) {
      toast.success(res.data?.msg)
      navigate(allIntegURL)
    } else {
      toast.error(res.data || res)
    }
  })
}

export const saveUpdateConfig = (flow, allIntegURL, conf, navigate, edit, setIsLoading) => {
  if (!checkMappedFields(conf)) {
    toast.error(__('Please map mandatory fields', 'bit-integrations'))
    return
  }
  if (checkMappedFields(conf) === 'required') {
    toast.error(__('You must select email or phone in Selzy fields', 'bit-integrations'))
    return
  }
  saveActionConf({ flow, allIntegURL, conf, navigate, edit, setIsLoading })
}
