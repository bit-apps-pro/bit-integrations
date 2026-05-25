/* eslint-disable no-console */
/* eslint-disable no-else-return */

export const handleInput = (e, salesmateConf, setSalesmateConf) => {
  const newConf = { ...salesmateConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setSalesmateConf({ ...newConf })
}

export const generateMappedField = acptFields => {
  const requiredFlds = acptFields.filter(fld => fld?.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        acptFormField: field.key
      }))
    : [{ formField: '', acptFormField: '' }]
}

export const checkMappedFields = acptConf => {
  const mappedFields = acptConf?.field_map
    ? acptConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.acptFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.acptFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
