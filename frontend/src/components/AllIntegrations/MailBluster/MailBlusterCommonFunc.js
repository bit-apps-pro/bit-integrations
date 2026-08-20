/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, mailBlusterConf, setMailBlusterConf) => {
  const newConf = { ...mailBlusterConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setMailBlusterConf({ ...newConf })
}

export const generateMappedField = mailBlusterConf => {
  const requiredFlds = mailBlusterConf?.staticFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', mailBlusterFormField: field.key }))
    : [{ formField: '', mailBlusterFormField: '' }]
}

export const checkMappedFields = mailBlusterConf => {
  const mappedFields = mailBlusterConf?.field_map
    ? mailBlusterConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.mailBlusterFormField ||
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

export const fetchCustomFields = (
  confTmp,
  setConf,
  setError,
  setIsAuthorized,
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

  if (type === 'refreshCustomFields') {
    setLoading({ ...loading, customFields: true })
  }

  bitsFetch(buildAuthRequestParams(confTmp), 'mailBluster_fetch_custom_fields').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      newConf.customFields = result.data || []
      setConf(newConf)
      setIsAuthorized?.(true)

      if (type === 'authentication') {
        setLoading({ ...loading, auth: false })
        toast.success(__('Authorized Successfully', 'bit-integrations'))
      } else if (type === 'refreshCustomFields') {
        setLoading({ ...loading, customFields: false })
        toast.success(__('Custom fields fetched successfully', 'bit-integrations'))
      }
      return
    }

    setLoading({ ...loading, auth: false, customFields: false })
    toast.error(__('Authorization failed', 'bit-integrations'))
  })
}
