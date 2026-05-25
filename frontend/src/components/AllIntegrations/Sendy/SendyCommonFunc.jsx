/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        api_key: conf.api_key,
        sendy_url: conf.sendy_url
      }

export const handleInput = (
  e,
  sendyConf,
  setSendyConf,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  const newConf = { ...sendyConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setSendyConf({ ...newConf })
}

export const getAllBrand = (sendyConf, setSendyConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const queryParams = buildAuthRequestParams(sendyConf)

  const loadPostTypes = bitsFetch(queryParams, 'get_all_brands').then(result => {
    if (result && result.success) {
      const newConf = { ...sendyConf }
      if (!newConf.default) newConf.default = {}
      if (result.data) {
        newConf.default.brandList = result.data
      }
      setSendyConf({ ...newConf })
      setIsLoading(false)
      return __('BrandList refreshed successfully', 'bit-integrations')
    } else {
      setIsLoading(false)
      return __('BrandList refresh failed. please try again', 'bit-integrations')
    }
  })
  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading Brand...')
  })
}

export const getAllList = (sendyConf, setSendyConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const queryParams = {
    ...buildAuthRequestParams(sendyConf),
    brand_id: sendyConf.brand_id
  }

  const loadPostTypes = bitsFetch(queryParams, 'get_all_lists_from_sendy').then(result => {
    if (result && result.success) {
      const newConf = { ...sendyConf }
      if (!newConf.default) newConf.default = {}
      if (result.data) {
        newConf.default.lists = result.data
      }
      setSendyConf({ ...newConf })
      setIsLoading(false)
      return __('Lists refreshed successfully', 'bit-integrations')
    } else {
      setIsLoading(false)
      return __('Lists refresh failed. please try again', 'bit-integrations')
    }
  })
  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading Lists...')
  })
}

export const generateMappedField = sendyConf => {
  const requiredFlds = sendyConf?.subscriberFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', sendyField: field.key }))
    : [{ formField: '', sendyField: '' }]
}

export const checkMappedFields = sendyConf => {
  const mappedFields = sendyConf?.field_map
    ? sendyConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.sendyField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
