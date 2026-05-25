import { create } from 'mutative'

export const handleInput = (e, wpcafeConf, setWpcafeConf) => {
  const newConf = create(wpcafeConf, draftConf => {
    draftConf[e.target.name] = e.target.value
  })
  setWpcafeConf(newConf)
}

export const generateMappedField = allFields => {
  const requiredFlds = allFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', wpcafeField: field.key }))
    : [{ formField: '', wpcafeField: '' }]
}

export const checkMappedFields = wpcafeConf => {
  const mappedFields = wpcafeConf?.field_map
    ? wpcafeConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.wpcafeField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

