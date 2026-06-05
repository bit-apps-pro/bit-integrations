import { create } from 'mutative'

export const handleInput = (e, secureCustomFieldsConf, setSecureCustomFieldsConf) => {
  const { name, value } = e.target

  setSecureCustomFieldsConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = secureCustomFieldsConf => {
  const mappedFields = secureCustomFieldsConf?.field_map
    ? secureCustomFieldsConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.secureCustomFieldsField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        secureCustomFieldsField: field.key
      }))
    : [{ formField: '', secureCustomFieldsField: '' }]
}
