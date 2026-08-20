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

export const generateMappedField = notificationFields => {
  const requiredFlds = notificationFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        gravitecFormField: field.key
      }))
    : [{ formField: '', gravitecFormField: '' }]
}

export const checkMappedFields = gravitecConf => {
  const mappedFields = gravitecConf?.field_map
    ? gravitecConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.gravitecFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.gravitecFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
