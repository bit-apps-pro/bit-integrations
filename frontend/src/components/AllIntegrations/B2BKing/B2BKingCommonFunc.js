import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, b2bKingConf, setB2BKingConf) => {
  const { name, value } = e.target
  setB2BKingConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshB2BKingGroups = (setB2BKingConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_b2bking_groups')
    .then(result => {
      if (result?.success && result?.data?.groups) {
        setB2BKingConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allGroups = result.data.groups
          })
        )
        setIsLoading(false)
        toast.success(__('All groups fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('B2BKing groups fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = b2bKingConf => {
  const mappedFields = b2bKingConf?.field_map
    ? b2bKingConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.b2bKingField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  return mappedFields.length === 0
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', b2bKingField: field.key }))
    : [{ formField: '', b2bKingField: '' }]
}
