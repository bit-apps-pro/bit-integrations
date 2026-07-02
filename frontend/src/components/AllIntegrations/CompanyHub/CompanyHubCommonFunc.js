/* eslint-disable no-console */
/* eslint-disable no-else-return */
import bitsFetch from '../../../Utils/bitsFetch'

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

export const generateMappedField = companyHubFields => {
  const requiredFlds = companyHubFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        companyHubFormField: field.key
      }))
    : [{ formField: '', companyHubFormField: '' }]
}

export const checkMappedFields = companyHubConf => {
  const mappedFields = companyHubConf?.field_map
    ? companyHubConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.companyHubFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.companyHubFormField === 'customFieldKey' && !mappedField.customFieldKey)
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
        sub_domain: confTmp.sub_domain,
        api_key: confTmp.api_key
      }

export const getAllCompanies = (confTmp, setConf, setLoading) => {
  if (typeof setLoading === 'function') {
    setLoading(prev => ({ ...prev, companies: true }))
  }

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'company_hub_fetch_all_companies').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => ({ ...prevConf, companies: result.data }))

        if (typeof setLoading === 'function') {
          setLoading(prev => ({ ...prev, companies: false }))
        }
        return
      }
      if (typeof setLoading === 'function') {
        setLoading(prev => ({ ...prev, companies: false }))
      }
      return
    }
    if (typeof setLoading === 'function') {
      setLoading(prev => ({ ...prev, companies: false }))
    }
  })
}

export const getAllContacts = (confTmp, setConf, setLoading) => {
  if (typeof setLoading === 'function') {
    setLoading(prev => ({ ...prev, contact: true }))
  }

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'company_hub_fetch_all_contacts').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => ({ ...prevConf, contacts: result.data }))

        if (typeof setLoading === 'function') {
          setLoading(prev => ({ ...prev, contact: false }))
        }
        return
      }
      if (typeof setLoading === 'function') {
        setLoading(prev => ({ ...prev, contact: false }))
      }
      return
    }
    if (typeof setLoading === 'function') {
      setLoading(prev => ({ ...prev, contact: false }))
    }
  })
}
