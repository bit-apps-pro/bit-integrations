import { create } from 'mutative'
import { asgarosForumActionFields } from './staticData'

export const handleInput = (e, asgarosForumConf, setAsgarosForumConf) => {
  const newConf = create(asgarosForumConf, draftConf => {
    draftConf[e.target.name] = e.target.value
  })
  setAsgarosForumConf(newConf)
}

export const getActionFields = action => asgarosForumActionFields[action] || []

export const generateMappedField = allFields => {
  if (!allFields?.length) {
    return []
  }

  const requiredFlds = allFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', asgarosForumField: field.key }))
    : [{ formField: '', asgarosForumField: '' }]
}

export const checkMappedFields = asgarosForumConf => {
  const { mainAction, field_map: fieldMap = [] } = asgarosForumConf || {}

  if (!mainAction) {
    return false
  }

  const requiredFields = getActionFields(mainAction).filter(field => field.required)

  if (!requiredFields.length) {
    return true
  }

  return requiredFields.every(requiredField =>
    fieldMap.some(
      mappedField =>
        mappedField?.asgarosForumField === requiredField.key &&
        mappedField?.formField &&
        (mappedField.formField !== 'custom' || mappedField?.customValue)
    )
  )
}
