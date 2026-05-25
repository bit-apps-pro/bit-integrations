import { create } from 'mutative'

export const handleInput = (e, bookingPressConf, setBookingPressConf) => {
  const { name, value } = e.target
  setBookingPressConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = bookingPressConf => {
  const mappedFields = bookingPressConf?.field_map
    ? bookingPressConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.bookingPressField ||
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
        bookingPressField: field.key,
      }))
    : [{ formField: '', bookingPressField: '' }]
}
