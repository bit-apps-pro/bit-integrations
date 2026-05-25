/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { api_key: confTmp.api_key }

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

export const generateMappedField = systemeIOFields => {
  const requiredFlds = systemeIOFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        systemeIOFormField: field.key
      }))
    : [{ formField: '', systemeIOFormField: '' }]
}

export const checkMappedFields = systemeIOConf => {
  const mappedFields = systemeIOConf?.field_map
    ? systemeIOConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.systemeIOFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.systemeIOFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const getAllTags = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, tag: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'systemeIO_fetch_all_tags').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => {
          prevConf.tags = result.data
          return prevConf
        })

        setLoading({ ...setLoading, tag: false })
        toast.success(__('Tags fetched successfully', 'bit-integrations'))
        return
      }
      setLoading({ ...setLoading, tag: false })
      toast.error(__('Tags Not Found!', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, tag: false })
    toast.error(__('Tags fetching failed', 'bit-integrations'))
  })
}

export const getAllFields = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, fields: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'systemeIO_fetch_all_fields').then(result => {
    if (result && result.success) {
      setConf(prevConf => {
        prevConf.systemeIOFields = result.data
        prevConf.field_map = generateMappedField(prevConf.systemeIOFields)
        return prevConf
      })

      setLoading({ ...setLoading, fields: false })
      toast.success(__('Contact Field fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, fields: false })
    toast.error(__('Contact Field fetching failed', 'bit-integrations'))
  })
}
