/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, lionDeskConf, setLionDeskConf) => {
  const newConf = { ...lionDeskConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setLionDeskConf({ ...newConf })
}

export const generateMappedField = lionDeskConf => {
  let allFields = []
  if (lionDeskConf.actionName === 'campaign') {
    allFields = lionDeskConf?.campaignFields
  } else if (lionDeskConf.actionName === 'contact') {
    allFields = lionDeskConf?.contactFields
  }
  const requiredFlds = allFields && allFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        lionDeskFormField: field.key
      }))
    : [{ formField: '', lionDeskFormField: '' }]
}

export const checkMappedFields = lionDeskConf => {
  const mappedFields = lionDeskConf?.field_map
    ? lionDeskConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.lionDeskFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.lionDeskFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        tokenDetails: conf.tokenDetails,
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        redirectURI: conf.redirectURI
      }

export const getCustomFields = (confTmp, setConf, setIsLoading) => {
  setIsLoading(true)
  const requestParams = {
    ...buildAuthRequestParams(confTmp)
  }

  bitsFetch(requestParams, 'lionDesk_fetch_custom_fields').then(result => {
    if (result && result.success) {
      setIsLoading(false)
      if (result.data?.customFields) {
        setConf(prevConf => {
          const newConf = { ...prevConf }
          newConf.customFields = result.data.customFields
          if (result.data.tokenDetails) {
            newConf.tokenDetails = result.data.tokenDetails
          }
          return newConf
        })
        toast.success(__('Custom fields also fetched successfully', 'bit-integrations'))
      } else {
        toast.error(__('No custom fields found', 'bit-integrations'))
      }
      return
    }
    setIsLoading(false)
    toast.error(__(`Custom fields fetching failed ${result.data}`, 'bit-integrations'))
  })
}

export const getAllTags = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, tags: true })
  const requestParams = {
    ...buildAuthRequestParams(confTmp)
  }

  bitsFetch(requestParams, 'lionDesk_fetch_all_tags').then(result => {
    if (result && result.success) {
      setLoading({ ...setLoading, tags: false })
      if (result.data?.tags) {
        setConf(prevConf => {
          const newConf = { ...prevConf }
          newConf.tags = result.data.tags
          if (result.data.tokenDetails) {
            newConf.tokenDetails = result.data.tokenDetails
          }
          return newConf
        })
        toast.success(__('Tags fetched successfully', 'bit-integrations'))
      } else {
        toast.error(__('No Tags found', 'bit-integrations'))
      }
      return
    }
    setLoading({ ...setLoading, tags: false })
    toast.error(__(`Tags fetching failed ${result.data}`, 'bit-integrations'))
  })
}
