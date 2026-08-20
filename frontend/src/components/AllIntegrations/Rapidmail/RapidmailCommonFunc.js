/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (
  e,
  rapidmailConf,
  setRapidmailConf,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  const newConf = { ...rapidmailConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setRapidmailConf({ ...newConf })
}

export const getAllRecipient = (rapidmailConf, setRapidmailConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const queryParams = rapidmailConf?.connection_id
    ? { connection_id: rapidmailConf.connection_id }
    : {
        username: rapidmailConf.username,
        password: rapidmailConf.password
      }
  const loadPostTypes = bitsFetch(null, 'rapidmail_get_all_recipients', queryParams, 'GET').then(
    result => {
      if (result && result.success) {
        const newConf = { ...rapidmailConf }
        if (!newConf.default) newConf.default = {}
        if (result.data.recipientlists) {
          newConf.default.recipientlists = result.data.recipientlists
        }
        setRapidmailConf({ ...newConf })
        setIsLoading(false)
        return __('Recipientlist refreshed successfully', 'bit-integrations')
      } else {
        setIsLoading(false)
        return __('Recipientlist refresh failed. please try again', 'bit-integrations')
      }
    }
  )
  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading Recipientslist...')
  })
  // .catch(() => setIsLoading(false))
}

export const generateMappedField = rapidmailConf => {
  const requiredFlds = rapidmailConf?.recipientsFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', rapidmailFormField: field.key }))
    : [{ formField: '', rapidmailFormField: '' }]
}

export const checkMappedFields = rapidmailConf => {
  const mappedFields = rapidmailConf?.field_map
    ? rapidmailConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.rapidmailFormField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
