import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { actionDropdowns, actionSelects } from './staticData'

export const handleInput = (e, bitCrmConf, setBitCrmConf) => {
  const { name, value } = e.target

  setBitCrmConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

// Generic fetcher for every dropdown: hits `route`, stashes options in conf[listKey].
// `payload` carries what a dependent list needs, e.g. the module a record belongs to.
export const refreshBitCrmList = (route, listKey, setBitCrmConf, setIsLoading, payload = null) => {
  setIsLoading(listKey)
  bitsFetch(payload, route)
    .then(result => {
      if (result?.success && Array.isArray(result?.data?.options)) {
        setBitCrmConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf[listKey] = result.data.options
          })
        )
        toast.success(__('List refreshed successfully', 'bit-integrations'))
      } else {
        toast.error(__('Bit CRM list fetch failed. Please try again', 'bit-integrations'))
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = bitCrmConf => {
  const mappedFields = bitCrmConf?.field_map
    ? bitCrmConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.bitCrmField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  return mappedFields.length === 0
}

const isEmptyValue = value =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)

// First required select/dropdown (for the selected action) whose value is unset,
// as its label — or null when every required select/dropdown is filled.
export const missingRequiredSelect = bitCrmConf => {
  const action = bitCrmConf?.mainAction
  const required = [...(actionSelects[action] || []), ...(actionDropdowns[action] || [])].filter(
    field => field.required
  )
  const missing = required.find(field => isEmptyValue(bitCrmConf?.[field.key]))
  return missing ? missing.label : null
}

// Full save/next guard: field map complete AND every required select/dropdown set.
export const isBitCrmConfValid = bitCrmConf =>
  checkMappedFields(bitCrmConf) && !missingRequiredSelect(bitCrmConf)

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', bitCrmField: field.key }))
    : [{ formField: '', bitCrmField: '' }]
}
