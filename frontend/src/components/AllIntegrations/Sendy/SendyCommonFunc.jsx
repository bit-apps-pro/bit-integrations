/* eslint-disable no-else-return */
import { create } from 'mutative'
import toast from 'react-hot-toast'
import { __, sprintf } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { DEFAULT_ACTION, fieldsByAction, getAction, needsCampaignLists, needsList } from './staticData'

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
  const { name, value } = e.target
  setSendyConf(prevConf =>
    create(prevConf, draftConf => {
      if (value !== '') {
        draftConf[name] = value
      } else {
        delete draftConf[name]
      }
    })
  )
}

export const getAllBrand = (sendyConf, setSendyConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const queryParams = buildAuthRequestParams(sendyConf)

  const loadPostTypes = bitsFetch(queryParams, 'get_all_brands').then(result => {
    if (result && result.success) {
      setSendyConf(prevConf =>
        create(prevConf, draftConf => {
          if (!draftConf.default) draftConf.default = {}
          draftConf.default.brandList = result.data || []
        })
      )
      setIsLoading(false)
      return __('Brands refreshed successfully', 'bit-integrations')
    } else {
      setIsLoading(false)
      throw new Error(
        typeof result?.data === 'string'
          ? result.data
          : __('Brands did not load. Try again.', 'bit-integrations')
      )
    }
  })
  toast.promise(loadPostTypes, {
    success: data => data,
    error: err => err?.message || __('Error Occurred', 'bit-integrations'),
    loading: __('Loading Brands...', 'bit-integrations')
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
      setSendyConf(prevConf =>
        create(prevConf, draftConf => {
          if (!draftConf.default) draftConf.default = {}
          draftConf.default.lists = result.data || []
        })
      )
      setIsLoading(false)
      return __('Lists refreshed successfully', 'bit-integrations')
    } else {
      setIsLoading(false)
      throw new Error(
        typeof result?.data === 'string'
          ? result.data
          : __('Lists did not load. Try again.', 'bit-integrations')
      )
    }
  })
  toast.promise(loadPostTypes, {
    success: data => data,
    error: err => err?.message || __('Error Occurred', 'bit-integrations'),
    loading: __('Loading Lists...', 'bit-integrations')
  })
}

export const mappableFields = sendyConf => fieldsByAction[getAction(sendyConf)] || []

export const generateMappedField = sendyConf => {
  const requiredFlds = mappableFields(sendyConf).filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', sendyField: field.key }))
    : [{ formField: '', sendyField: '' }]
}

export const getConfigError = sendyConf => {
  const incompleteRow = (sendyConf?.field_map || []).some(
    mappedField =>
      !mappedField.formField ||
      !mappedField.sendyField ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )
  if (incompleteRow) {
    return __(
      'A field map row is not complete. Select both fields or delete the row.',
      'bit-integrations'
    )
  }

  const mappedKeys = (sendyConf?.field_map || []).map(mappedField => mappedField.sendyField)
  const missingField = mappableFields(sendyConf).find(
    fld => fld.required && !mappedKeys.includes(fld.key)
  )
  if (missingField) {
    return sprintf(__('%s is required. Map a field to it.', 'bit-integrations'), missingField.label)
  }

  const action = getAction(sendyConf)

  if (needsList.includes(action) && action !== DEFAULT_ACTION && !sendyConf?.list_id) {
    return __('List is required. Select a list.', 'bit-integrations')
  }

  if (needsCampaignLists.includes(action) && !sendyConf?.brand_id) {
    return __('Brand is required. Select a brand.', 'bit-integrations')
  }

  return ''
}
