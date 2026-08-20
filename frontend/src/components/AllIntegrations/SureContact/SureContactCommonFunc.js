import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

// The backend reads credentials off the connection itself, so the id is all it needs.
const buildAuthRequestParams = conf => ({ connection_id: conf?.connection_id })

export const handleInput = (e, sureContactConf, setSureContactConf) => {
  const newConf = { ...sureContactConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setSureContactConf({ ...newConf })
}

const fetchList = (conf, setConf, setIsLoading, route, defaultKey, { loading, success, failed }) => {
  setIsLoading(true)

  const request = bitsFetch(buildAuthRequestParams(conf), route).then(result => {
    setIsLoading(false)
    if (result && result.success) {
      // Merge off the latest state, not the captured snapshot — two lists can be
      // fetched concurrently and a snapshot merge makes the slower one win.
      setConf(prev => ({
        ...prev,
        default: { ...(prev.default || {}), [defaultKey]: result.data || [] }
      }))

      return success
    }

    return failed
  })

  toast.promise(request, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading
  })
}

export const getLists = (conf, setConf, setIsLoading) =>
  fetchList(conf, setConf, setIsLoading, 'sure_contact_get_lists', 'lists', {
    failed: __('List refresh failed. please try again', 'bit-integrations'),
    loading: __('Loading lists...', 'bit-integrations'),
    success: __('Lists refreshed successfully', 'bit-integrations')
  })

export const getTags = (conf, setConf, setIsLoading) =>
  fetchList(conf, setConf, setIsLoading, 'sure_contact_get_tags', 'tags', {
    failed: __('Tag refresh failed. please try again', 'bit-integrations'),
    loading: __('Loading tags...', 'bit-integrations'),
    success: __('Tags refreshed successfully', 'bit-integrations')
  })

export const generateMappedField = sureContactConf => {
  const fields = sureContactConf?.sureContactFields || []
  const requiredFlds = fields.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', sureContactField: field.key }))
    : [{ formField: '', sureContactField: '' }]
}

export const checkMappedFields = sureContactConf => {
  const mappedFields = sureContactConf?.field_map
    ? sureContactConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.sureContactField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  return mappedFields.length === 0
}
