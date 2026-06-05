import { create } from 'mutative'
import { dynamicActions } from './staticData'

export const handleInput = (e, secureCustomFieldsConf, setSecureCustomFieldsConf) => {
  const { name, value } = e.target

  setSecureCustomFieldsConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = secureCustomFieldsConf => {
  const mainAction = secureCustomFieldsConf?.mainAction

  if (dynamicActions.includes(mainAction)) {
    if (!secureCustomFieldsConf?.postId) {
      return false
    }

    const nameKey = mainAction === 'update_group_field_value' ? 'groupName' : 'repeaterName'
    if (!secureCustomFieldsConf?.[nameKey]) {
      return false
    }

    const isRepeaterAction = mainAction === 'update_repeater_field_value'
    const fieldMap = secureCustomFieldsConf?.field_map || []
    const invalid = fieldMap.filter(
      mappedField =>
        !mappedField.subFieldName ||
        !mappedField.formField ||
        (mappedField.formField === 'custom' && !mappedField.customValue) ||
        (isRepeaterAction &&
          (mappedField.rowIndex === '' ||
            mappedField.rowIndex === undefined ||
            mappedField.rowIndex === null))
    )

    return fieldMap.length > 0 && invalid.length === 0
  }

  const mappedFields = secureCustomFieldsConf?.field_map
    ? secureCustomFieldsConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.secureCustomFieldsField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        secureCustomFieldsField: field.key
      }))
    : [{ formField: '', secureCustomFieldsField: '' }]
}
