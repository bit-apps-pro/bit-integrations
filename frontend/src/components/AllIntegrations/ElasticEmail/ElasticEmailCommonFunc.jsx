// eslint-disable-next-line import/no-extraneous-dependencies
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, elasticEmailConf, setElasticEmailConf, setIsLoading) => {
  const newConf = { ...elasticEmailConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setElasticEmailConf({ ...newConf })
}
export const checkMappedFields = elasticEmailConf => {
  const mappedFields = elasticEmailConf?.field_map
    ? elasticEmailConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.elasticEmailField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  if (mappedFields.length > 0) {
    return false
  }
  return true
}
export const generateMappedField = elasticEmailConf => {
  const requiredFlds = elasticEmailConf?.elasticEmailFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', elasticEmailField: field.key }))
    : [{ formField: '', elasticEmailField: '' }]
}

const buildAuthRequestParams = conf =>
  conf.connection_id ? { connection_id: conf.connection_id } : { apiKey: conf.api_key }

export const getAllList = (elasticEmailConf, setElasticEmailConf, setIsLoading) => {
  if (setIsLoading) setIsLoading(true)
  const queryParams = buildAuthRequestParams(elasticEmailConf)
  const loadPostTypes = bitsFetch(null, 'get_all_lists', queryParams, 'GET').then(result => {
    if (result && result.success) {
      const newConf = { ...elasticEmailConf }
      if (!newConf.default) newConf.default = {}
      if (result.data.lists) {
        newConf.default.lists = result.data.lists
      }
      setElasticEmailConf({ ...newConf })
      if (setIsLoading) setIsLoading(false)
      return __('List refreshed successfully', 'bit-integrations')
    }
    if (setIsLoading) setIsLoading(false)
    return __('List refresh failed. please try again', 'bit-integrations')
  })
  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading Lists...')
  })
}
