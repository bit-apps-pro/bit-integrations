export const handleInput = (e, smailyConf, setSmailyConf) => {
  const newConf = { ...smailyConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setSmailyConf({ ...newConf })
}

export const generateMappedField = smailyConf => {
  const requiredFlds = smailyConf?.staticFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', smailyFormField: field.key }))
    : [{ formField: '', smailyFormField: '' }]
}

export const checkMappedFields = smailyConf => {
  const mappedFields = smailyConf?.field_map
    ? smailyConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.smailyFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.smailyFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
