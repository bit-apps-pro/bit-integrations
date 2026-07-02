/* eslint-disable no-else-return */
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (
  e,
  omniSendConf,
  setOmniSendConf,
  setLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  const newConf = { ...omniSendConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setOmniSendConf({ ...newConf })
}

export const generateMappedField = (fields = []) => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        omniSendFormField: field.key
      }))
    : [{ formField: '', omniSendFormField: '' }]
}

export const checkMappedFields = omniSendConf => {
  const mappedFields = omniSendConf?.field_map
    ? omniSendConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.omniSendFormField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
