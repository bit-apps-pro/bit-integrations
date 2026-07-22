import { create } from 'mutative'

export const handleInput = (e, bitCrmConf, setBitCrmConf) => {
  const { name, value } = e.target

  setBitCrmConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = bitCrmConf => {
  const mappedFields = bitCrmConf?.field_map
    ? bitCrmConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.bitCrmField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  return mappedFields.length === 0
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', bitCrmField: field.key }))
    : [{ formField: '', bitCrmField: '' }]
}
