/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, salesmateConf, setSalesmateConf) => {
  const newConf = { ...salesmateConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setSalesmateConf({ ...newConf })
}

export const generateMappedField = nimbleFields => {
  const requiredFlds = nimbleFields?.filter(fld => fld.required === true)
  return requiredFlds?.length > 0
    ? requiredFlds?.map(field => ({
        formField: '',
        nimbleFormField: field.key
      }))
    : [{ formField: '', nimbleFormField: '' }]
}

export const checkMappedFields = nimbleConf => {
  const mappedFields = nimbleConf?.field_map
    ? nimbleConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.nimbleFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.nimbleFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = confTmp =>
  confTmp?.connection_id
    ? { connection_id: confTmp.connection_id }
    : { api_key: confTmp.api_key }

export const getAllFields = (confTmp, setConf, setLoading, setSnackbar = null) => {
  setLoading(prev => ({ ...prev, allFields: true }))
  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'nimble_fetch_all_fields').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => {
          prevConf.peopleFields = result.data.person
          prevConf.companyFields = result.data.company
          prevConf.xofEmployees = result.data.xofEmployees
          prevConf.ratings = result.data.ratings
          prevConf.leadStatus = result.data.leadStatus
          prevConf.leadSource = result.data.leadSource
          prevConf.leadTypes = result.data.leadTypes
          return prevConf
        })

        setLoading(prev => ({ ...prev, allFields: false }))
        toast.success(__('Fields fetched successfully', 'bit-integrations'))
        if (typeof setSnackbar === 'function') {
          setSnackbar({ show: true, msg: __('Fields fetched successfully', 'bit-integrations') })
        }
        return
      }
      setLoading(prev => ({ ...prev, allFields: false }))
      toast.error(__('Fields Not Found!', 'bit-integrations'))
      if (typeof setSnackbar === 'function') {
        setSnackbar({ show: true, msg: __('Fields Not Found!', 'bit-integrations') })
      }
      return
    }
    setLoading(prev => ({ ...prev, allFields: false }))
    toast.error(__('Fields fetching failed', 'bit-integrations'))
    if (typeof setSnackbar === 'function') {
      setSnackbar({ show: true, msg: __('Fields fetching failed', 'bit-integrations') })
    }
  })
}
