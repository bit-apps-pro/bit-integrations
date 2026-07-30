export const handleInput = (e, slackConf, setSlackConf) => {
  const newConf = { ...slackConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setSlackConf({ ...newConf })
}

export const checkMappedFields = fieldsMapped => {
  const checkedField = fieldsMapped
    ? fieldsMapped?.filter(item => !item.formField || !item.SureCartFormField)
    : []
  if (checkedField.length > 0) return false
  return true
}

export const generateMappedField = sureCartConf => {
  const requiredFlds = sureCartConf?.customerFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', SureCartFormField: field.key }))
    : [{ formField: '', SureCartFormField: '' }]
}
