import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (
  e,
  constantContactConf,
  setConstantContactConf,
  id,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  let newConf = { ...constantContactConf }
  if (isNew) {
    const rmError = { ...error }
    rmError[e.target.name] = ''
    setError({ ...rmError })
  }
  newConf[e.target.name] = e.target.value
  switch (e.target.name) {
    case 'source_type':
      newConf = listChange(newConf, setConstantContactConf)
      break
    default:
      break
  }
  setConstantContactConf({ ...newConf })
}

export const checkAddressFieldMapRequired = constantContactConf => {
  const requiredFleld = constantContactConf?.address_field
    ? constantContactConf.address_field.filter(
        field => !field.formField && field.constantContactAddressField && field.required
      )
    : []
  if (requiredFleld.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        tokenDetails: conf.tokenDetails
      }

const listChange = (constantContactConf, setConstantContactConf) => {
  const newConf = deepCopy(constantContactConf)
  newConf.field_map = [{ formField: '', constantContactFormField: '' }]
  getAllCustomFields(constantContactConf, setConstantContactConf)
  return newConf
}

export const getAllContactLists = (id, confTmp, setConf, isLoading, setIsLoading) => {
  setIsLoading({ ...isLoading, list: true })

  const requestParams = {
    integId: id,
    ...buildAuthRequestParams(confTmp)
  }

  bitsFetch(requestParams, 'cContact_refresh_list').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.lists = result.data.contactList
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
      }
      setConf(newConf)
      setIsLoading({ ...isLoading, list: false })

      toast.success(__('List fetch successfully', 'bit-integrations'))
      return
    }
    setIsLoading({ ...isLoading, list: false })
    toast.error(__('List fetch failed', 'bit-integrations'))
  })
}

const getAllCustomFields = (confTmp, setConf) => {
  const requestParams = {
    ...buildAuthRequestParams(confTmp)
  }

  bitsFetch(requestParams, 'cContact_custom_fields').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data?.customFields) {
        const mergedFields = newConf.default.constantContactFields.concat(result.data.customFields)
        newConf.default.constantContactFields = mergedFields
      }
      if (result.data?.tokenDetails) {
        newConf.tokenDetails = result.data.tokenDetails
      }
      setConf(newConf)
    }
  })
}

export const getContactTags = (id, confTmp, setConf, isLoading, setIsLoading) => {
  setIsLoading({ ...isLoading, tag: true })

  const requestParams = {
    integId: id,
    ...buildAuthRequestParams(confTmp)
  }

  bitsFetch(requestParams, 'cContact_refresh_tags').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.tags = result.data.contactTag
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
      }
      setConf(newConf)
      setIsLoading({ ...isLoading, tag: false })

      toast.success(__('Tags fetch successfully', 'bit-integrations'))
      return
    }
    setIsLoading({ ...isLoading, tag: false })
    toast.error(__('Tags fetch failed', 'bit-integrations'))
  })
}

export const checkMappedFields = sheetconf => {
  const mappedFleld = sheetconf.field_map
    ? sheetconf.field_map.filter(mapped => !mapped.formField && !mapped.constantContactFormField)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}

export const generateMappedField = constantContactFields => {
  const requiredFlds = constantContactFields?.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        constantContactFormField: field.key
      }))
    : [{ formField: '', constantContactFormField: '' }]
}
