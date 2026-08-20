import { create } from 'mutative'

export const handleInput = (e, eventsManagerConf, setEventsManagerConf) => {
  const { name, value } = e.target

  setEventsManagerConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const generateMappedField = (fields = []) => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        eventsManagerField: field.key
      }))
    : [{ formField: '', eventsManagerField: '' }]
}

export const checkMappedFields = eventsManagerConf => {
  const fieldMap = eventsManagerConf?.field_map || []

  return !fieldMap.some(
    mappedField =>
      !mappedField.formField ||
      !mappedField.eventsManagerField ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )
}

