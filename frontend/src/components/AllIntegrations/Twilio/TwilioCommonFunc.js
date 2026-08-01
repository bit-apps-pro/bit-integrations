export const handleInput = (
  e,
  twilioConf,
  setTwilioConf,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  const newConf = { ...twilioConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setTwilioConf({ ...newConf })
}

export const checkMappedFields = twilioConf => {
  const mappedFields = twilioConf?.field_map
    ? twilioConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.twilioField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
