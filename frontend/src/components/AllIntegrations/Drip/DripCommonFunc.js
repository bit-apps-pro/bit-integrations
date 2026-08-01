// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import toast from 'react-hot-toast'

export const handleInput = (e, dripConf, setDripConf) => {
  const newConf = { ...dripConf }
  newConf.name = e.target.value
  setDripConf({ ...newConf })
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id ? { connection_id: confTmp.connection_id } : { api_token: confTmp.api_token }

export const fetchDripAccounts = async (confTmp, setConf, setLoading, type = 'fetch') => {
  if (!confTmp.connection_id && !confTmp.api_token) {
    toast.error(__("Access Api Token can't be empty", 'bit-integrations'))
    return
  }

  setLoading(prev => ({ ...prev, accounts: true }))

  const result = await bitsFetch(buildAuthRequestParams(confTmp), 'drip_fetch_all_accounts')

  if (result?.success) {
    const newConf = { ...confTmp, accounts: result.data || [] }
    setConf(newConf)
    setLoading(prev => ({ ...prev, accounts: false }))
    toast.success(
      type === 'refresh'
        ? __('Accounts fetched Successfully', 'bit-integrations')
        : __('Authorized Successfully', 'bit-integrations')
    )
    return
  }

  setLoading(prev => ({ ...prev, accounts: false }))
  toast.error(__('Accounts fetching failed', 'bit-integrations'))
}

export const checkMappedFields = dripConf => {
  const mappedFields = dripConf?.field_map
    ? dripConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.dripField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const generateMappedField = dripConf => {
  const requiredFlds = dripConf?.dripFormFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', dripField: field.key }))
    : [{ formField: '', dripField: '' }]
}

export const getCustomFields = (confTmp, setConf, setLoading) => {
  setLoading(prev => ({ ...prev, customFields: true }))

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    selectedAccountId: confTmp.selectedAccountId
  }

  bitsFetch(requestParams, 'drip_fetch_all_custom_fields').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.dripFormFields = [...staticFields, ...result.data]
      }
      setConf(newConf)
      setLoading(prev => ({ ...prev, customFields: false }))
      toast.success(__('Custom fields fetch successfully', 'bit-integrations'))
      return
    }
    setLoading(prev => ({ ...prev, customFields: false }))
    toast.error(__('Custom fields fetch failed', 'bit-integrations'))
  })
}

export const getAllTags = (confTmp, setConf, setLoading) => {
  setLoading(prev => ({ ...prev, tags: true }))

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    selectedAccountId: confTmp.selectedAccountId
  }

  bitsFetch(requestParams, 'drip_fetch_all_tags').then(result => {
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

export const staticFields = [
  { key: 'email', label: __('Email', 'bit-integrations'), required: true },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'address1', label: __('Address 1', 'bit-integrations'), required: false },
  { key: 'address2', label: __('Address 2', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'state', label: __('State', 'bit-integrations'), required: false },
  { key: 'zip', label: __('Zip', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'time_zone', label: __('Time Zone', 'bit-integrations'), required: false },
  { key: 'ip_address', label: __('IP Address', 'bit-integrations'), required: false }
]
