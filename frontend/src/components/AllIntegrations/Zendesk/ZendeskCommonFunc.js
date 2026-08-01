/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, zendeskConf, setZendeskConf) => {
  const newConf = { ...zendeskConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setZendeskConf({ ...newConf })
}

export const generateMappedField = zendeskConf => {
  let allRequiredFields = []
  if (zendeskConf.actionName === 'organization') {
    allRequiredFields = zendeskConf?.organizationFields
  } else if (zendeskConf.actionName === 'contact') {
    allRequiredFields = zendeskConf?.contactFields
  } else if (zendeskConf.actionName === 'lead') {
    allRequiredFields = zendeskConf?.leadFields
  } else if (zendeskConf.actionName === 'deal') {
    allRequiredFields = zendeskConf?.dealFields
  }
  const requiredFlds = allRequiredFields?.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        zendeskFormField: field.key
      }))
    : [{ formField: '', zendeskFormField: '' }]
}

export const checkMappedFields = zendeskConf => {
  const mappedFields = zendeskConf?.field_map
    ? zendeskConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.zendeskFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.zendeskFormField === 'customFieldKey' && !mappedField.customFieldKey)
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
        api_key: confTmp.api_key
      }

export const getCustomFields = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, customFields: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action: confTmp.actionName
  }

  bitsFetch(requestParams, 'zendesk_fetch_custom_fields').then(result => {
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

export const getAllLeads = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, leads: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'zendesk_fetch_all_leads').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.leads = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, leads: false })

      toast.success(__('Leads fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, leads: false })
    toast.error(__('Leads fetching failed', 'bit-integrations'))
  })
}

export const getAllParentOrganizations = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, parentOrganizations: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'zendesk_fetch_all_parentOrganizations').then(result => {
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

export const getAllTeams = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, teams: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'zendesk_fetch_all_teams').then(result => {
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

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'zendesk_fetch_all_currencies').then(result => {
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

export const getAllStages = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, stages: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action_name: confTmp.actionName
  }

  bitsFetch(requestParams, 'zendesk_fetch_all_stages').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.stages = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, stages: false })

      toast.success(__('Stages fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, stages: false })
    toast.error(__('Stages fetching failed', 'bit-integrations'))
  })
}

export const getAllCRMCompanies = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, CRMCompanies: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action_name: confTmp.actionName
  }

  bitsFetch(requestParams, 'zendesk_fetch_all_CRMCompanies').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.CRMCompanies = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, CRMCompanies: false })
      if (confTmp.actionName === 'lead') {
        toast.success(__('Companies fetched successfully', 'bit-integrations'))
      } else {
        toast.success(__('Contacts fetched successfully', 'bit-integrations'))
      }

      return
    }
    setLoading({ ...setLoading, CRMCompanies: false })
    if (confTmp.actionName === 'lead') {
      toast.error(__('Companies fetching failed', 'bit-integrations'))
    } else {
      toast.error(__('Contacts fetching failed', 'bit-integrations'))
    }
  })
}

export const getAllCRMContacts = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, CRMContacts: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action_name: confTmp.actionName
  }

  bitsFetch(requestParams, 'zendesk_fetch_all_CRMContacts').then(result => {
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

export const getAllCRMSources = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, CRMSources: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action_name: confTmp.actionName
  }

  bitsFetch(requestParams, 'zendesk_fetch_all_CRMSources').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.CRMSources = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, CRMSources: false })

      toast.success(__('Sources fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, CRMSources: false })
    toast.error(__('Sources fetching failed', 'bit-integrations'))
  })
}
