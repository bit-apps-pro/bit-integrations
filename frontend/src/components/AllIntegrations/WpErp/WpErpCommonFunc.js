import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __, sprintf } from '../../../Utils/i18nwrap'

export const handleInput = (e, wpErpConf, setWpErpConf) => {
  const { name, value } = e.target

  setWpErpConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = wpErpConf => {
  if (!wpErpConf?.mainAction) return false

  const mappedFields = wpErpConf?.field_map
    ? wpErpConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.wpErpField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  return mappedFields.length === 0
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', wpErpField: field.key }))
    : [{ formField: '', wpErpField: '' }]
}

const refreshGeneric = (endpoint, dataKey, setWpErpConf, setIsLoading, draftKey, label) => {
  setIsLoading(true)
  bitsFetch(null, endpoint)
    .then(result => {
      if (result?.success && result?.data?.[dataKey]) {
        setWpErpConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf[draftKey] = result.data[dataKey]
          })
        )
        setIsLoading(false)
        toast.success(sprintf(__(`%s fetched successfully`, 'bit-integrations'), label))
        return
      }
      setIsLoading(false)
      toast.error(sprintf(__(`%s fetch failed. Please try again`, 'bit-integrations'), label))
    })
    .catch(() => setIsLoading(false))
}

export const refreshContactGroups = (setWpErpConf, setIsLoading) =>
  refreshGeneric('refresh_wp_erp_contact_groups', 'groups', setWpErpConf, setIsLoading, 'allContactGroups', 'Contact groups')

export const refreshLifeStages = (setWpErpConf, setIsLoading) =>
  refreshGeneric('refresh_wp_erp_life_stages', 'stages', setWpErpConf, setIsLoading, 'allLifeStages', 'Life stages')

export const refreshDepartments = (setWpErpConf, setIsLoading) =>
  refreshGeneric('refresh_wp_erp_departments', 'departments', setWpErpConf, setIsLoading, 'allDepartments', 'Departments')

export const refreshDesignations = (setWpErpConf, setIsLoading) =>
  refreshGeneric('refresh_wp_erp_designations', 'designations', setWpErpConf, setIsLoading, 'allDesignations', 'Designations')
