import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { fieldsByAction } from './staticData'

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : { api_key: conf.api_key, site_url: conf.site_url }

export const handleInput = (e, brilliantDirectoriesConf, setBrilliantDirectoriesConf) => {
  const newConf = { ...brilliantDirectoriesConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setBrilliantDirectoriesConf({ ...newConf })
}

const fetchList = (
  conf,
  setConf,
  setIsLoading,
  route,
  defaultKey,
  { loading, success, failed }
) => {
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

export const getMembershipPlans = (conf, setConf, setIsLoading) =>
  fetchList(conf, setConf, setIsLoading, 'brilliant_directories_get_membership_plans', 'plans', {
    failed: __('Membership plan refresh failed. please try again', 'bit-integrations'),
    loading: __('Loading membership plans...', 'bit-integrations'),
    success: __('Membership plans refreshed successfully', 'bit-integrations')
  })

export const getTopCategories = (conf, setConf, setIsLoading) =>
  fetchList(conf, setConf, setIsLoading, 'brilliant_directories_get_top_categories', 'categories', {
    failed: __('Category refresh failed. please try again', 'bit-integrations'),
    loading: __('Loading categories...', 'bit-integrations'),
    success: __('Categories refreshed successfully', 'bit-integrations')
  })

export const getPostTypes = (conf, setConf, setIsLoading) =>
  fetchList(conf, setConf, setIsLoading, 'brilliant_directories_get_post_types', 'postTypes', {
    failed: __('Post type refresh failed. please try again', 'bit-integrations'),
    loading: __('Loading post types...', 'bit-integrations'),
    success: __('Post types refreshed successfully', 'bit-integrations')
  })

export const generateMappedField = brilliantDirectoriesConf => {
  const fields = brilliantDirectoriesConf?.brilliantDirectoriesFields || []
  const requiredFlds = fields.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', brilliantDirectoriesField: field.key }))
    : [{ formField: '', brilliantDirectoriesField: '' }]
}

export const checkMappedFields = brilliantDirectoriesConf => {
  if (!brilliantDirectoriesConf?.mainAction) return false

  const requiredKeys = (fieldsByAction[brilliantDirectoriesConf.mainAction] || [])
    .filter(fld => fld.required)
    .map(fld => fld.key)

  const mapped = brilliantDirectoriesConf?.field_map || []
  const isIncomplete = mapped.filter(
    field =>
      !field.brilliantDirectoriesField ||
      (!field.formField && !field.customValue) ||
      (field.formField === 'custom' && !field.customValue)
  )

  if (isIncomplete.length > 0) return false

  return requiredKeys.every(key => mapped.some(field => field.brilliantDirectoriesField === key))
}
