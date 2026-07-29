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
  const fields = [...(actionSelects[action] || []), ...(actionDropdowns[action] || [])]
  const missing = fields
    .filter(field => field.required)
    .find(field => isEmptyValue(bitCrmConf?.[field.key]))

  if (!missing) return null

  // A dependent list cannot be filled before the field it hangs off, so blame
  // that one instead of the empty list it leaves behind.
  if (missing.dependsOn && isEmptyValue(bitCrmConf?.[missing.dependsOn])) {
    const dependency = fields.find(field => field.key === missing.dependsOn)
    return dependency?.label ?? missing.label
  }

  return missing.label
}

// Full save/next guard: field map complete AND every required select/dropdown set.
export const isBitCrmConfValid = bitCrmConf =>
  checkMappedFields(bitCrmConf) && !missingRequiredSelect(bitCrmConf)

/**
 * The field map renders its required rows positionally, so a config saved before
 * a field became required would show one Bit CRM field while holding another.
 * Re-key the leading rows onto the current required list, keeping the form field
 * each Bit CRM field was already mapped to, and push the rest below.
 */
export const syncRequiredFieldMap = (fieldMap = [], fields = []) => {
  const requiredKeys = fields.filter(fld => fld.required === true).map(fld => fld.key)
  if (requiredKeys.length === 0) return fieldMap

  const isInPlace = requiredKeys.every((key, i) => fieldMap[i]?.bitCrmField === key)
  if (isInPlace) return fieldMap

  const synced = requiredKeys.map(key => ({
    formField: fieldMap.find(row => row.bitCrmField === key)?.formField ?? '',
    bitCrmField: key
  }))

  const rest = fieldMap.filter(row => row.bitCrmField && !requiredKeys.includes(row.bitCrmField))

  return [...synced, ...rest]
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', bitCrmField: field.key }))
    : [{ formField: '', bitCrmField: '' }]
}
