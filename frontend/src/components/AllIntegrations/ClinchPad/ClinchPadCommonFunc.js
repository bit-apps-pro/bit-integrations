/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { api_key: confTmp.api_key }

export const handleInput = (e, clinchPadConf, setClinchPadConf) => {
  const newConf = { ...clinchPadConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setClinchPadConf({ ...newConf })
}

export const generateMappedField = clinchPadConf => {
  let allRequiredFields = []
  if (clinchPadConf.actionName === 'organization') {
    allRequiredFields = clinchPadConf?.organizationFields
  } else if (clinchPadConf.actionName === 'contact') {
    allRequiredFields = clinchPadConf?.contactFields
  } else if (clinchPadConf.actionName === 'lead') {
    allRequiredFields = clinchPadConf?.leadFields
  }
  const requiredFlds = allRequiredFields?.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        clinchPadFormField: field.key
      }))
    : [{ formField: '', clinchPadFormField: '' }]
}

export const checkMappedFields = clinchPadConf => {
  const mappedFields = clinchPadConf?.field_map
    ? clinchPadConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.clinchPadFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.clinchPadFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const getAllParentOrganizations = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, parentOrganizations: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'clinchPad_fetch_all_parentOrganizations').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.parentOrganizations = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, parentOrganizations: false })

      toast.success(__('ParentOrganizations fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, parentOrganizations: false })
    toast.error(__('ParentOrganizations fetching failed', 'bit-integrations'))
  })
}

export const getAllCRMPipelines = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, CRMPipelines: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action_name: confTmp.actionName
  }

  bitsFetch(requestParams, 'clinchPad_fetch_all_CRMPipelines').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.CRMPipelines = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, CRMPipelines: false })
      toast.success(__('Pipelines fetched successfully', 'bit-integrations'))

      return
    }
    setLoading({ ...setLoading, CRMPipelines: false })
    toast.error(__('Pipelines fetching failed', 'bit-integrations'))
  })
}

export const getAllCRMContacts = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, CRMContacts: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action_name: confTmp.actionName
  }

  bitsFetch(requestParams, 'clinchPad_fetch_all_CRMContacts').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.CRMContacts = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, CRMContacts: false })
      toast.success(__('Contacts fetched successfully', 'bit-integrations'))

      return
    }
    setLoading({ ...setLoading, CRMContacts: false })
    toast.error(__('Contacts fetching failed', 'bit-integrations'))
  })
}
