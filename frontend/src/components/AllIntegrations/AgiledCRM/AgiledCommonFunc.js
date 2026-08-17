/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, agiledConf, setAgiledConf) => {
  const newConf = { ...agiledConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setAgiledConf({ ...newConf })
}

export const generateMappedField = agiledConf => {
  let allRequiredFields = []
  if (agiledConf.actionName === 'account') {
    allRequiredFields = agiledConf?.accountFields
  } else if (agiledConf.actionName === 'contact') {
    allRequiredFields = agiledConf?.contactFields
  } else {
    allRequiredFields = agiledConf?.dealFields
  }
  const requiredFlds = allRequiredFields?.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', agiledFormField: field.key }))
    : [{ formField: '', agiledFormField: '' }]
}

export const checkMappedFields = agiledConf => {
  const mappedFields = agiledConf?.field_map
    ? agiledConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.agiledFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.agiledFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const getAllOwners = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, owners: true })

  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { auth_token: confTmp.auth_token, brand: confTmp.brand }

  bitsFetch(requestParams, 'agiled_fetch_all_owners').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.owners = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, owners: false })

      toast.success(__('Owners fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, owners: false })
    toast.error(__('Owners fetching failed', 'bit-integrations'))
  })
}

export const getAllAccounts = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, accounts: true })

  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { auth_token: confTmp.auth_token, brand: confTmp.brand }

  bitsFetch(requestParams, 'agiled_fetch_all_accounts').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.accounts = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, accounts: false })

      toast.success(__('Accounts fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, accounts: false })
    toast.error(__('Accounts fetching failed', 'bit-integrations'))
  })
}

export const getAllSources = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, sources: true })

  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { auth_token: confTmp.auth_token, brand: confTmp.brand }

  bitsFetch(requestParams, 'agiled_fetch_all_sources').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.sources = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, sources: false })

      toast.success(__('Sources fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, sources: false })
    toast.error(__('Sources fetching failed', 'bit-integrations'))
  })
}

export const getAllStatuses = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, statuses: true })

  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { auth_token: confTmp.auth_token, brand: confTmp.brand }

  bitsFetch(requestParams, 'agiled_fetch_all_statuses').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.statuses = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, statuses: false })

      toast.success(__('Status fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, statuses: false })
    toast.error(__('Status fetching failed', 'bit-integrations'))
  })
}

export const getAllLifeCycleStage = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, lifeCycleStages: true })

  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { auth_token: confTmp.auth_token, brand: confTmp.brand }

  bitsFetch(requestParams, 'agiled_fetch_all_lifeCycleStages').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.lifeCycleStages = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, lifeCycleStages: false })

      toast.success(__('Life cycle stages fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, lifeCycleStages: false })
    toast.error(__('Life cycle stages fetching failed', 'bit-integrations'))
  })
}

export const getAllCRMPipelines = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, CRMPipelines: true })

  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { auth_token: confTmp.auth_token, brand: confTmp.brand }

  bitsFetch(requestParams, 'agiled_fetch_all_CRMPipelines').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.CRMPipelines = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, CRMPipelines: false })

      toast.success(__('Pipelines fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, CRMPipelines: false })
    toast.error(__('Pipelines fetching failed', 'bit-integrations'))
  })
}

export const getAllCRMPipelineStages = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, CRMPipelineStages: true })

  const requestParams = confTmp.connection_id
    ? {
        connection_id: confTmp.connection_id,
        selectedCRMPipeline: confTmp.selectedCRMPipeline
      }
    : {
        auth_token: confTmp.auth_token,
        brand: confTmp.brand,
        selectedCRMPipeline: confTmp.selectedCRMPipeline
      }

  bitsFetch(requestParams, 'agiled_fetch_all_CRMPipelineStages').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.CRMPipelineStages = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, CRMPipelineStages: false })

      toast.success(__('Pipeline stages fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, CRMPipelineStages: false })
    toast.error(__('Pipeline stages fetching failed', 'bit-integrations'))
  })
}
