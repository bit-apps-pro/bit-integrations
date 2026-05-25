/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, capsulecrmConf, setCapsuleCRMConf) => {
  const newConf = { ...capsulecrmConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setCapsuleCRMConf({ ...newConf })
}

export const generateMappedField = capsulecrmConf => {
  let allRequiredFields = []
  if (capsulecrmConf.actionName === 'organisation') {
    allRequiredFields = capsulecrmConf?.organisationFields
  } else if (capsulecrmConf.actionName === 'person') {
    allRequiredFields = capsulecrmConf?.personFields
  } else if (capsulecrmConf.actionName === 'opportunity') {
    allRequiredFields = capsulecrmConf?.opportunityFields
  } else if (capsulecrmConf.actionName === 'project') {
    allRequiredFields = capsulecrmConf?.projectFields
  }
  const requiredFlds = allRequiredFields?.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        capsulecrmFormField: field.key
      }))
    : [{ formField: '', capsulecrmFormField: '' }]
}

export const checkMappedFields = capsulecrmConf => {
  const mappedFields = capsulecrmConf?.field_map
    ? capsulecrmConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.capsulecrmFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.capsulecrmFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : {
        api_key: confTmp.api_key,
        api_url: confTmp.api_url
      }

export const getCustomFields = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, customFields: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action: confTmp.actionName
  }

  bitsFetch(requestParams, 'capsulecrm_fetch_custom_fields').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.customFields = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, customFields: false })
      if (!result.data) {
        toast.error(__('No custom fields found', 'bit-integrations'))
      } else {
        toast.success(__('Custom fields also fetched successfully', 'bit-integrations'))
      }
      return
    }
    setLoading({ ...setLoading, customFields: false })
    toast.error(__('Custom fields fetching failed', 'bit-integrations'))
  })
}

export const getAllOpportunities = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, opportunities: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'capsulecrm_fetch_all_opportunities').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.opportunities = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, opportunities: false })

      toast.success(__('Opportunities fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, opportunities: false })
    toast.error(__('Opportunities fetching failed', 'bit-integrations'))
  })
}

export const getAllOwners = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, owners: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'capsulecrm_fetch_all_owners').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.owners = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, owners: false })

      toast.success(__('Owners fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, owners: false })
    toast.error(__('Owners fetching failed', 'bit-integrations'))
  })
}

export const getAllTeams = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, teams: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'capsulecrm_fetch_all_teams').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.teams = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, teams: false })

      toast.success(__('Teams fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, teams: false })
    toast.error(__('Teams fetching failed', 'bit-integrations'))
  })
}

export const getAllCurrencies = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, currencies: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action_name: confTmp.actionName
  }

  bitsFetch(requestParams, 'capsulecrm_fetch_all_currencies').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.currencies = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, currencies: false })

      toast.success(__('Currencies fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, currencies: false })
    toast.error(__('Currencies fetching failed', 'bit-integrations'))
  })
}

export const getAllCRMParties = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, CRMParties: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action_name: confTmp.actionName
  }

  bitsFetch(requestParams, 'capsulecrm_fetch_all_CRMParties').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.CRMParties = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, CRMParties: false })

      toast.success(__('Parties fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, CRMParties: false })
    toast.error(__('Parties fetching failed', 'bit-integrations'))
  })
}

export const getAllCRMMilestones = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, CRMMilestones: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'capsulecrm_fetch_all_CRMMilestones').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.CRMMilestones = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, CRMMilestones: false })

      toast.success(__('Milestones fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, CRMMilestones: false })
    toast.error(__('Milestones fetching failed', 'bit-integrations'))
  })
}
