/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, emailOctopusConf, setEmailOctopusConf) => {
  const newConf = { ...emailOctopusConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setEmailOctopusConf({ ...newConf })
}

export const generateMappedField = emailOctopusConf => {
  const requiredFlds = emailOctopusConf?.emailOctopusFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', emailOctopusFormField: field.key }))
    : [{ formField: '', emailOctopusFormField: '' }]
}

export const checkMappedFields = emailOctopusConf => {
  const mappedFields = emailOctopusConf?.field_map
    ? emailOctopusConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.emailOctopusFormField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const fetchAllLists = (confTmp, setConf, loading, setLoading, type = 'fetch') => {
  if (!confTmp.connection_id && !confTmp.auth_token) {
    toast.error(__("Api Key can't be empty", 'bit-integrations'))
    return
  }

  setLoading({ ...loading, lists: true })

  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { auth_token: confTmp.auth_token }

  bitsFetch(requestParams, 'emailOctopus_fetch_all_lists').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.lists = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, lists: false })
      toast.success(
        type === 'refresh'
          ? __('All lists fetched successfully', 'bit-integrations')
          : __('Lists fetched successfully', 'bit-integrations')
      )
      return
    }
    setLoading({ ...loading, lists: false })
    toast.error(__('Lists fetching failed', 'bit-integrations'))
  })
}

export const getAllFields = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, customFields: true })
  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id, listId: confTmp.selectedList }
    : { auth_token: confTmp.auth_token, listId: confTmp.selectedList }

  bitsFetch(requestParams, 'emailOctopus_fetch_all_fields').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.emailOctopusFields = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, customFields: false, emailOctopusFields: true })

      toast.success(__('Fields fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, customFields: false })
    toast.error(__('Fields fetching failed', 'bit-integrations'))
  })
}

export const getAllTags = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, tags: true, emailOctopusFields: true })

  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id, listId: confTmp.selectedList }
    : { auth_token: confTmp.auth_token, listId: confTmp.selectedList }

  bitsFetch(requestParams, 'emailOctopus_fetch_all_tags').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.tags = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, tags: false, emailOctopusFields: true })

      toast.success(__('Tags fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, tags: false, emailOctopusFields: true })
    toast.error(__('Tags fetching failed', 'bit-integrations'))
  })
}
