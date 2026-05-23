/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, slackConf, setSlackConf) => {
  const newConf = { ...slackConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setSlackConf({ ...newConf })
}

export const handleAuthorize = (
  confTmp,
  setConf,
  setError,
  setIsAuthorized,
  setIsLoading,
  setSnackbar
) => {
  if (!confTmp.api_key) {
    setError({ api_key: !confTmp.api_key ? __("Api Key can't be empty", 'bit-integrations') : '' })
    return
  }
  setError({})
  setIsLoading(true)
  const auth_url = window.location.origin
  const tokenRequestParams = { api_key: confTmp.api_key, auth_url }

  bitsFetch(tokenRequestParams, 'sureCart_authorization').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      setConf(newConf)
      setIsAuthorized(true)
      setIsLoading(false)
      toast.success(__('Authorized Successfully', 'bit-integrations'))
      return
    }
    toast.error(__('Authorization Failed', 'bit-integrations'))
    setIsLoading(false)
  })
}

export const checkMappedFields = fieldsMapped => {
  const checkedField = fieldsMapped
    ? fieldsMapped?.filter(item => !item.formField || !item.SureCartFormField)
    : []
  if (checkedField.length > 0) return false
  return true
}

export const generateMappedField = sureCartConf => {
  const requiredFlds = sureCartConf?.customerFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', SureCartFormField: field.key }))
    : [{ formField: '', SureCartFormField: '' }]
}
