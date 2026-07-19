import { create } from 'mutative'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, clickWhaleConf, setClickWhaleConf) => {
  const { name, value } = e.target

  setClickWhaleConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = clickWhaleConf => {
  const mappedFields = clickWhaleConf?.field_map
    ? clickWhaleConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.clickWhaleField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

/**
 * Validate what the field map cannot express.
 *
 * ClickWhale has no fetched dropdowns, so this only guards the action itself —
 * but it is shared by the create wizard and the edit screen so both paths agree.
 *
 * @param {object} clickWhaleConf
 *
 * @returns {string} error message, or '' when the config is valid
 */
export const validateClickWhaleConf = clickWhaleConf => {
  if (!clickWhaleConf?.mainAction) {
    return __('Please select an action to continue.', 'bit-integrations')
  }

  return ''
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        clickWhaleField: field.key
      }))
    : [{ formField: '', clickWhaleField: '' }]
}
