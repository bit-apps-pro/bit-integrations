/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, mailRelayConf, setMailRelayConf) => {
  const newConf = { ...mailRelayConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setMailRelayConf({ ...newConf })
}

export const generateMappedField = mailRelayConf => {
  const requiredFlds = mailRelayConf?.staticFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', mailRelayFormField: field.key }))
    : [{ formField: '', mailRelayFormField: '' }]
}

export const checkMappedFields = mailRelayConf => {
  const mappedFields = mailRelayConf?.field_map
    ? mailRelayConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.mailRelayFormField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        auth_token: conf?.auth_token || conf?.api_key,
        domain: conf?.domain
      }

export const refreshCustomFields = (confTmp, setConf, loading, setLoading, setSnackbar = null) => {
  setLoading({ ...loading, customFields: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'mailRelay_fetch_custom_fields').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.customFields = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, customFields: false })
      toast.success(__('Custom fields fetched successfully', 'bit-integrations'))
      if (typeof setSnackbar === 'function') {
        setSnackbar({ show: true, msg: __('Custom fields fetched successfully', 'bit-integrations') })
      }
      return
    }

    setLoading({ ...loading, customFields: false })
    toast.error(__('Custom fields fetch failed', 'bit-integrations'))
    if (typeof setSnackbar === 'function') {
      setSnackbar({ show: true, msg: __('Custom fields fetch failed', 'bit-integrations') })
    }
  })
}

export const getAllGroups = (confTmp, setConf, loading, setLoading, setSnackbar = null) => {
  setLoading({ ...loading, groups: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'mailRelay_fetch_all_groups').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.groups = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, groups: false })

      toast.success(__('Groups fetch successfully', 'bit-integrations'))
      if (typeof setSnackbar === 'function') {
        setSnackbar({ show: true, msg: __('Groups fetch successfully', 'bit-integrations') })
      }
      return
    }
    setLoading({ ...loading, groups: false })
    toast.error(__('Groups fetch failed', 'bit-integrations'))
    if (typeof setSnackbar === 'function') {
      setSnackbar({ show: true, msg: __('Groups fetch failed', 'bit-integrations') })
    }
  })
}
