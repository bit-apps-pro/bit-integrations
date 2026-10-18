import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { requiredSelects } from './staticData'

export const handleInput = (e, bookneticConf, setBookneticConf) => {
  const { name, value } = e.target

  setBookneticConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshBookneticOptions = (type, setBookneticConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch({ type }, 'refresh_booknetic_options')
    .then(result => {
      setIsLoading(false)

      if (result?.success && Array.isArray(result?.data?.options)) {
        setBookneticConf(prevConf =>
          create(prevConf, draftConf => {
            if (!draftConf.default) {
              draftConf.default = {}
            }
            draftConf.default[type] = result.data.options
          })
        )
        return
      }

      toast.error(result?.data || __('Booknetic did not send the list. Try again.', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const selectsForAction = (selects, action) => selects.filter(s => s.actions.includes(action))

export const missingRequiredSelect = bookneticConf =>
  selectsForAction(requiredSelects, bookneticConf?.mainAction).find(
    select => !bookneticConf?.[select.key]
  )

export const checkMappedFields = bookneticConf => {
  if (!bookneticConf?.mainAction || missingRequiredSelect(bookneticConf)) {
    return false
  }

  const unmappedFields = bookneticConf?.field_map
    ? bookneticConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.bookneticField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  return unmappedFields.length === 0
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', bookneticField: field.key }))
    : [{ formField: '', bookneticField: '' }]
}
