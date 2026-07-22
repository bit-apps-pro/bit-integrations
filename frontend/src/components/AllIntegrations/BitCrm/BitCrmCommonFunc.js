import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, bitCrmConf, setBitCrmConf) => {
  const { name, value } = e.target

  setBitCrmConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

// Generic fetcher for every dropdown: hits `route`, stashes options in conf[listKey].
export const refreshBitCrmList = (route, listKey, setBitCrmConf, setIsLoading) => {
  setIsLoading(listKey)
  bitsFetch(null, route)
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

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', bitCrmField: field.key }))
    : [{ formField: '', bitCrmField: '' }]
}
