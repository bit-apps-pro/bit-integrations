/* eslint-disable no-unused-expressions */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { saveIntegConfig, saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'

export const handleInput = (e, conf, setConf, error, setError) => {
  const newConf = { ...conf }
  const inputError = { ...error }
  inputError[e.target.name] = ''
  newConf[e.target.name] = e.target.value
  setError(inputError)
  setConf(newConf)
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : { api_key: conf?.api_key || conf?.authKey }

export const getAllLists = async (conf, setConf, loading, setLoading, setSnackbar = null) => {
  setLoading && setLoading({ ...loading, list: true })
  const requestParams = buildAuthRequestParams(conf)
  const result = await bitsFetch(requestParams, 'mailercloud_get_all_lists')
  if (result.success) {
    const { data } = result.data
    const newConf = { ...conf }
    if (data) {
      if (!newConf.default) {
        newConf.default = {}
      }
      newConf.default.lists = data
      setConf(newConf)
      if (setLoading) {
        setLoading({ ...loading, list: false })
        toast.success(__('Tag refresh successfully'))
        if (typeof setSnackbar === 'function') {
          setSnackbar({ show: true, msg: __('Tag refresh successfully') })
        }
      }
    }
    return true
  }
  if (setLoading) {
    setLoading({ ...loading, list: false })
    toast.success(__('Tag refresh failed'))
    if (typeof setSnackbar === 'function') {
      setSnackbar({ show: true, msg: __('Tag refresh failed') })
    }
  }
  return false
}

export const getAllFields = async (conf, setConf, loading, setLoading, setSnackbar = null) => {
  setLoading && setLoading({ ...loading, field: true })
  const requestParams = buildAuthRequestParams(conf)
  const result = await bitsFetch(requestParams, 'mailercloud_get_all_fields')
  if (result.success) {
    const { data } = result
    const newConf = { ...conf }
    if (data) {
      if (!newConf.default) {
        newConf.default = {}
      }
      newConf.default.fields = data
      setConf(newConf)
      if (setLoading) {
        setLoading({ ...loading, field: false })
        toast.success(__('Tag refresh successfully'))
        if (typeof setSnackbar === 'function') {
          setSnackbar({ show: true, msg: __('Tag refresh successfully') })
        }
      }
    }
    return true
  }
  if (setLoading) {
    setLoading({ ...loading, field: false })
    toast.success(__('Tag refresh failed'))
    if (typeof setSnackbar === 'function') {
      setSnackbar({ show: true, msg: __('Tag refresh failed') })
    }
  }
  return false
}

export const generateMappedField = mailercloudConf => {
  const requiredFlds = mailercloudConf?.default?.fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        mailercloudFormField: field.key
      }))
    : [{ formField: '', mailercloudFormField: '' }]
}

const checkMappedFields = mailercloudConf => {
  const mappedFields = mailercloudConf?.field_map
    ? mailercloudConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.mailercloudFormField ||
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
  saveActionConf({ flow, allIntegURL, conf, navigate, edit, setIsLoading })
}
