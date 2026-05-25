import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { contactFields } from './staticData'

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        tokenDetails: conf.tokenDetails
      }

export const handleInput = (
  e,
  keapConf,
  setKeapConf,
  formID,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  let newConf = { ...keapConf }
  if (isNew) {
    const rmError = { ...error }
    rmError[e.target.name] = ''
    setError({ ...rmError })
  }
  newConf[e.target.name] = e.target.value
  setKeapConf({ ...newConf })
}

export const checkMappedFields = keapConf => {
  const mappedFleld = keapConf.field_map
    ? keapConf.field_map.filter(mapped => !mapped.formField && !mapped.keapField)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}

export const generateMappedField = keapConf => {
  const allFields = [...keapConf?.contactFields, ...keapConf?.customFields]
  const requiredFlds = allFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', keapField: field.key }))
    : [{ formField: '', keapField: '' }]
}

export const getAllTags = (confTmp, setConf, setLoading) => {
  setLoading(true)

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
  }

  bitsFetch(requestParams, 'keap_fetch_all_tags').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.tags = result.data
      }
      setConf(newConf)
      setLoading(false)
      toast.success(__('Tag Fetched Successfully', 'bit-integrations'))
      return
    }
    setLoading(false)
    toast.error(__("Tag Couldn't Fetched Successfully", 'bit-integrations'))
  })
    .catch(() => {
      setLoading(false)
      toast.error(__("Tag Couldn't Fetched Successfully", 'bit-integrations'))
    })
}

export const refreshCustomFields = (id, confTmp, setConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)

  const requestParams = {
    id: id,
    ...buildAuthRequestParams(confTmp),
  }

  bitsFetch(requestParams, 'keap_fetch_all_custom_fields').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.contactFields = contactFields
        newConf.customFields = result.data
      }
      newConf.field_map = generateMappedField(newConf)
      setConf(newConf)
      setIsLoading(false)

      setSnackbar({
        show: true,
        msg: __('Custom Field Fetched Successfully', 'bit-integrations')
      })
      return
    }
    setIsLoading(false)
    setSnackbar({
      show: true,
      msg: __("Custom Field Couldn't Fetched Successfully", 'bit-integrations')
    })
  })
}
