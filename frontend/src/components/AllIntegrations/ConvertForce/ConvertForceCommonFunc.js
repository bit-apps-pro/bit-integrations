import { create } from 'mutative'

export const handleInput = (e, convertForceConf, setConvertForceConf) => {
  const { name, value } = e.target

  setConvertForceConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = convertForceConf => {
  const mappedFields = convertForceConf?.field_map
    ? convertForceConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.convertForceField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  return mappedFields.length === 0
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        convertForceField: field.key
      }))
    : [{ formField: '', convertForceField: '' }]
}
