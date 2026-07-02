/* eslint-disable no-console */
/* eslint-disable no-else-return */
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, oneHashCRMConf, setOneHashCRMConf) => {
  const newConf = { ...oneHashCRMConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setOneHashCRMConf({ ...newConf })
}

export const generateMappedField = oneHashCRMConf => {
  const requiredFlds =
    oneHashCRMConf?.oneHashCRMFields &&
    oneHashCRMConf?.oneHashCRMFields.filter(
      fld => fld.required === true && fld.key !== 'owner' && fld.key !== 'pipeline'
    )
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        oneHashCRMFormField: field.key
      }))
    : [{ formField: '', oneHashCRMFormField: '' }]
}

export const checkMappedFields = oneHashCRMConf => {
  const mappedFields = oneHashCRMConf?.field_map
    ? oneHashCRMConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.oneHashCRMFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.oneHashCRMFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
