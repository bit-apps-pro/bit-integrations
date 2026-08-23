/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { __, sprintf } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, restrictConf, setRestrictConf) => {
  const newConf = { ...restrictConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setRestrictConf({ ...newConf })
}

export const getAllLevels = (restrictConf, setRestrictConf, setIsLoading) => {
  setIsLoading(true)
  const loadPostTypes = bitsFetch(null, 'restrict_get_all_levels', null, 'GET').then(result => {
    if (result && result.success) {
      const newConf = { ...restrictConf }
      if (!newConf.default) newConf.default = {}
      if (result.data.levellists) {
        newConf.default.levellists = result.data.levellists
      }
      setRestrictConf({ ...newConf })
      setIsLoading(false)
      return __('Levels refreshed successfully', 'bit-integrations')
    } else {
      setIsLoading(false)
      return __('Levels refresh failed. please try again', 'bit-integrations')
    }
  })
  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading Levels...')
  })
}

export const generateMappedField = restrictConf => {
  const restrictFlds =
    restrictConf?.actionName === 'add-member-level' ? restrictConf?.levelFields : [] || []
  const requiredFlds = restrictFlds?.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', restrictField: field.key }))
    : [{ formField: '', restrictField: '' }]
}

export const checkMappedFields = restrictConf => {
  if (restrictConf?.actionName === 'remove-member-level') {
    return true
  }
  const mappedFields = restrictConf?.field_map
    ? restrictConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.restrictField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
