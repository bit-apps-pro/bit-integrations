import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, ivyFormsConf, setIvyFormsConf) => {
  const { name, value } = e.target
  setIvyFormsConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshIvyFormsForms = (setIvyFormsConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_ivy_forms_forms')
    .then(result => {
      if (result?.success && result?.data?.forms) {
        setIvyFormsConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allForms = result.data.forms
          })
        )
        toast.success(__('IvyForms forms fetched successfully', 'bit-integrations'))
      } else {
        toast.error(__('IvyForms forms fetch failed. Please try again', 'bit-integrations'))
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshIvyFormsFields = (formId, setIvyFormsConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch({ formId }, 'refresh_ivy_forms_fields')
    .then(result => {
      if (result?.success && result?.data?.fields) {
        const fields = formatFields(result.data.fields)
        setIvyFormsConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allFields = fields
            draftConf.field_map = generateMappedField(fields)
          })
        )
      } else {
        toast.error(__('IvyForms fields fetch failed. Please try again', 'bit-integrations'))
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = ivyFormsConf => {
  const mappedFields = ivyFormsConf?.field_map
    ? ivyFormsConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.ivyFormsField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) return false
  if (!ivyFormsConf?.formId || !ivyFormsConf?.mainAction) return false

  return true
}

export const formatFields = fields => (Array.isArray(fields) ? fields : Object.values(fields || {}))

export const isRequiredField = field => field?.required === true || field?.required === 1 || field?.required === '1'

export const generateMappedField = (fields = []) => {
  const requiredFlds = formatFields(fields).filter(isRequiredField)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', ivyFormsField: field.value }))
    : [{ formField: '', ivyFormsField: '' }]
}
