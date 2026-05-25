/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, nutshellCRMConf, setNutshellCRMConf) => {
  const newConf = { ...nutshellCRMConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setNutshellCRMConf({ ...newConf })
}

export const generateMappedField = nutshellCRMConf => {
  const requiredFlds =
    nutshellCRMConf?.nutshellCRMFields &&
    nutshellCRMConf?.nutshellCRMFields.filter(
      fld => fld.required === true && fld.key !== 'owner' && fld.key !== 'pipeline'
    )
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        nutshellCRMFormField: field.key
      }))
    : [{ formField: '', nutshellCRMFormField: '' }]
}

export const checkMappedFields = nutshellCRMConf => {
  const mappedFields = nutshellCRMConf?.field_map
    ? nutshellCRMConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.nutshellCRMFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.nutshellCRMFormField === 'customFieldKey' && !mappedField.customFieldKey)
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
        user_name: confTmp.user_name,
        api_token: confTmp.api_token
      }

export const getAllCompanies = (confTmp, setConf, setLoading) => {
  setLoading(prev => ({ ...prev, companies: true }))

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'nutshellcrm_fetch_all_companies').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.companies = result.data
      }
      setConf(newConf)
      setLoading(prev => ({ ...prev, companies: false }))

      toast.success(__('Companies fetched successfully', 'bit-integrations'))
      return
    }
    setLoading(prev => ({ ...prev, companies: false }))
    toast.error(__('Companies fetching failed', 'bit-integrations'))
  })
}

export const getAllContacts = (confTmp, setConf, setLoading) => {
  setLoading(prev => ({ ...prev, contacts: true }))

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'nutshellcrm_fetch_all_contacts').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.contacts = result.data
      }
      setConf(newConf)
      setLoading(prev => ({ ...prev, contacts: false }))

      toast.success(__('Contacts fetched successfully', 'bit-integrations'))
      return
    }
    setLoading(prev => ({ ...prev, contacts: false }))
    toast.error(__('Contacts fetching failed', 'bit-integrations'))
  })
}

export const getAllSources = (confTmp, setConf, setLoading) => {
  setLoading(prev => ({ ...prev, sources: true }))

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'nutshellcrm_fetch_all_sources').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.sources = result.data
      }
      setConf(newConf)
      setLoading(prev => ({ ...prev, sources: false }))

      toast.success(__('Sources fetched successfully', 'bit-integrations'))
      return
    }
    setLoading(prev => ({ ...prev, sources: false }))
    toast.error(__('Sources fetching failed', 'bit-integrations'))
  })
}
export const getAllTags = (confTmp, setConf, setLoading) => {
  setLoading(prev => ({ ...prev, tags: true }))

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'nutshellcrm_fetch_all_tags').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.tags = result.data
      }
      setConf(newConf)
      setLoading(prev => ({ ...prev, tags: false }))

      toast.success(__('Tags fetched successfully', 'bit-integrations'))
      return
    }
    setLoading(prev => ({ ...prev, tags: false }))
    toast.error(__('Tags fetching failed', 'bit-integrations'))
  })
}

export const getAllProducts = (confTmp, setConf, setLoading) => {
  setLoading(prev => ({ ...prev, products: true }))

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'nutshellcrm_fetch_all_products').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.products = result.data
      }
      setConf(newConf)
      setLoading(prev => ({ ...prev, products: false }))

      toast.success(__('Products fetched successfully', 'bit-integrations'))
      return
    }
    setLoading(prev => ({ ...prev, products: false }))
    toast.error(__('Products fetching failed', 'bit-integrations'))
  })
}

export const getAllCompanyTypes = (confTmp, setConf, setLoading) => {
  setLoading(prev => ({ ...prev, companyTypes: true }))

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'nutshellcrm_fetch_all_companytypes').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.companyTypes = result.data
      }
      setConf(newConf)
      setLoading(prev => ({ ...prev, companyTypes: false }))

      toast.success(__('CompanyTypes fetched successfully', 'bit-integrations'))
      return
    }
    setLoading(prev => ({ ...prev, companyTypes: false }))
    toast.error(__('CompanyTypes fetching failed', 'bit-integrations'))
  })
}
