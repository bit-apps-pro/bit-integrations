/* eslint-disable no-else-return */

export const handleInput = (e, googleContactsConf, setGoogleContactsConf) => {
  const newConf = { ...googleContactsConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setGoogleContactsConf({ ...newConf })
}

export const checkMappedFields = fieldsMapped => {
  const checkedField = fieldsMapped
    ? fieldsMapped.filter(item => !item.formField || !item.googleContactsFormField)
    : []
  if (checkedField.length > 0) return false
  return true
}

export const generateMappedField = googleContactsConf => {
  const requiredFlds = googleContactsConf?.default.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', googleContactsFormField: field.key }))
    : [{ formField: '', googleContactsFormField: '' }]
}
