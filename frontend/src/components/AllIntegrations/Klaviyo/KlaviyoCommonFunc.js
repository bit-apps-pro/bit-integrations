/* eslint-disable no-unused-expressions */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { saveActionConf, saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'

export const editHandleInput = (e, conf, setConf) => {
  const newConf = { ...conf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf.connection_id ? { connection_id: conf.connection_id } : { authKey: conf.authKey }

export const getAllLists = (conf, setConf, loading, setLoading) => {
  if (typeof setLoading === 'function') {
    setLoading({ ...(loading || {}), list: true })
  }

  const requestParams = buildAuthRequestParams(conf)

  bitsFetch(requestParams, 'klaviyo_lists').then(result => {
    if (result && result.success) {
      const newConf = { ...conf }
      if (result.data) {
        if (!newConf.default) {
          newConf.default = {}
        }
        newConf.default.lists = result.data
      }
      setConf(newConf)
      if (typeof setLoading === 'function') {
        setLoading({ ...(loading || {}), list: false })
      }

      toast.success(__('List refresh successfully', 'bit-integrations'))
      return
    }
    if (typeof setLoading === 'function') {
      setLoading({ ...(loading || {}), list: false })
    }
    toast.error(__('List refresh failed', 'bit-integrations'))
  })
}

export const generateMappedField = klaviyoConf => {
  const requiredFlds = klaviyoConf?.klaviyoFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        klaviyoFormField: field.key
      }))
    : [{ formField: '', klaviyoFormField: '' }]
}

const checkMappedFields = klaviyoConf => {
  const mappedFields = klaviyoConf?.field_map
    ? klaviyoConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.klaviyoFormField ||
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

export const saveConfig = (flow, setFlow, allIntegURL, conf, navigate, setIsLoading) => {
  setIsLoading(true)
  const resp = saveIntegConfig(flow, setFlow, allIntegURL, conf, navigate, '', '', setIsLoading)
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
    toast.error(__('You must select email or phone in klaviyo fields', 'bit-integrations'))
    return
  }
  saveActionConf({ flow, allIntegURL, conf, navigate, edit, setIsLoading })
}

export const addFieldMap = (i, confTmp, setConf, type) => {
  const newConf = { ...confTmp }
  if (!newConf[type]) {
    newConf[type] = []
  }

  newConf[type].splice(i, 0, {})
  setConf({ ...newConf })
}

export const delFieldMap = (i, confTmp, setConf, type) => {
  const newConf = { ...confTmp }
  if (newConf[type].length > 1) {
    newConf[type].splice(i, 1)
  }

  setConf({ ...newConf })
}
