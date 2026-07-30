/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
import toast from 'react-hot-toast'
import { sprintf, __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { create } from 'mutative'

export const handleInput = (e, hubspotConf, setHubspotConf, setIsLoading) => {
  const newConf = { ...hubspotConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setHubspotConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf.connection_id ? { connection_id: conf.connection_id } : { api_key: conf.api_key }

export const checkMappedFields = hubspotConf => {
  const mappedFields = hubspotConf?.field_map
    ? hubspotConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.hubspotField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const generateMappedField = hubspotConf => {
  const requiredFlds = hubspotConf?.hubSpotFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', hubspotField: field.key }))
    : [{ formField: '', hubspotField: '' }]
}

export const getAllPipelines = (confTmp, setConf, setLoading, type, loading) => {
  setLoading({ ...setLoading, pipelines: true })
  const requestParams = { ...buildAuthRequestParams(confTmp), type }

  bitsFetch(requestParams, 'hubspot_pipeline').then(result => {
    if (result.data) {
      setConf(prevConf =>
        create(prevConf, draftConf => {
          if (!draftConf.default) draftConf.default = {}

          draftConf.default.pipelines = result.data
          draftConf.actionName = type

          getFields(draftConf, setConf, setLoading, type, loading)
        })
      )

      setLoading({ ...setLoading, pipelines: false })
      toast.success(__('Pipelines fetched successfully', 'bit-integrations'))
      return
    } else {
      setLoading({ ...setLoading, pipelines: false })
      toast.error(__('Pipelines fetching failed', 'bit-integrations'))
    }
  })
}

export const getAllOwners = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, owners: true, hubSpotFields: true })
  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'hubspot_owners').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        if (!newConf.default) newConf.default = {}
        newConf.default.owners = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, owners: false, hubSpotFields: true })

      toast.success(__('Owners fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, owners: false, hubSpotFields: true })
    toast.error(__('Owners fetching failed', 'bit-integrations'))
  })
}

export const getAllContacts = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, contacts: true, hubSpotFields: true })
  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'hubspot_contacts').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        if (!newConf.default) newConf.default = {}
        newConf.default.contacts = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, contacts: false, hubSpotFields: true })

      toast.success(__('Contacts fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, contacts: false, hubSpotFields: true })
    toast.error(__('contacts fetching failed', 'bit-integrations'))
  })
}

export const getAllCompany = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, companies: true, hubSpotFields: true })
  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'hubspot_company').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        if (!newConf.default) newConf.default = {}
        newConf.default.companies = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, companies: false, hubSpotFields: true })

      toast.success(__('Companies fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, companies: false, hubSpotFields: true })
    toast.error(__('Companies fetching failed', 'bit-integrations'))
  })
}

export const getAllIndustry = (confTmp, setConf, setLoading) => {
  setLoading(prevLoading => ({ ...prevLoading, industry: true }))
  const requestParams = { ...buildAuthRequestParams(confTmp), type: 'company' }

  bitsFetch(requestParams, 'hubspot_industry').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.industries = result.data
      }
      setConf(newConf)
      setLoading(prevLoading => ({ ...prevLoading, industry: false }))

      toast.success(__('industry fetched successfully', 'bit-integrations'))
      return
    }
    setLoading(prevLoading => ({ ...prevLoading, industry: false }))
    toast.error(__('industry fetching failed', 'bit-integrations'))
  })
}

export const getFields = (confTmp, setConf, setLoading, type, loading, refreshCustomFields = false) => {
  if (refreshCustomFields) {
    setLoading({ ...loading, customFieldsRefresh: true })
  } else {
    setLoading({ ...setLoading, customFields: true })
  }
  const requestParams = { ...buildAuthRequestParams(confTmp), type }

  bitsFetch(requestParams, 'getFields').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.hubSpotFields = result.data
            draftConf.actionName = type
            draftConf.field_map = generateMappedField(draftConf)
          })
        )
      }

      setLoading({ ...setLoading, customFields: false })
      setLoading({ ...setLoading, hubSpotFields: true })

      toast.success(__('Fields fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, customFields: false })
    toast.error(__('Fields fetching failed', 'bit-integrations'))
  })
}
