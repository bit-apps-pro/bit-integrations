/* eslint-disable no-else-return */
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        app_domain: conf.app_domain,
        api_key: conf.api_key
      }

const hasAuthParams = conf => Boolean(conf?.connection_id || (conf?.app_domain && conf?.api_key))

export const handleInput = (e, freshdeskConf, setFreshdeskConf) => {
  const newConf = { ...freshdeskConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setFreshdeskConf({ ...newConf })
}

export const getAllTicketFields = (confTmp, setConf, setIsLoading, setSnackbar) => {
  if (!hasAuthParams(confTmp)) {
    setSnackbar({
      show: true,
      msg: __('Authorization info is missing. please authorize again', 'bit-integrations')
    })
    return
  }

  setIsLoading(true)
  const tokenRequestParams = buildAuthRequestParams(confTmp)

  bitsFetch(tokenRequestParams, 'freshdesk_fetch_ticket_fields')
    .then(result => result)
    .then(result => {
      if (result && result.success) {
        const newConf = { ...confTmp }
        newConf.ticketFields = result.data.ticketFields
        newConf.agents = result.data.agents
        newConf.groups = result.data.groups
        newConf.products = result.data.products
        newConf.sources = result.data.sources
        newConf.ticketType = result.data.ticketType
        newConf.field_map = generateMappedField(newConf)
        setConf(newConf)
        setSnackbar({
          show: true,
          msg: __('Ticket fields fetch Successfully', 'bit-integrations')
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Ticket field fetch failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
}

export const getAllContactFields = (confTmp, setConf, setIsLoading, setSnackbar) => {
  if (!hasAuthParams(confTmp)) {
    setSnackbar({
      show: true,
      msg: __('Authorization info is missing. please authorize again', 'bit-integrations')
    })
    return
  }

  setIsLoading(true)
  const tokenRequestParams = buildAuthRequestParams(confTmp)

  bitsFetch(tokenRequestParams, 'freshdesk_fetch_Contact_fields')
    .then(result => result)
    .then(result => {
      if (result && result.success) {
        const newConf = { ...confTmp }
        newConf.contactFields = result.data
        newConf.field_map_contact = generateContactMappedField(newConf)
        setConf(newConf)
        setSnackbar({
          show: true,
          msg: __('Contacts fields fetch Successfully', 'bit-integrations')
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Contacts field fetch failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
}

export const checkMappedFields = fieldsMapped => {
  const checkedField = fieldsMapped
    ? fieldsMapped?.filter(item => !item.formField || !item.freshdeskFormField)
    : []
  if (checkedField.length > 0) return false
  return true
}

export const checkMappedFieldsContact = fieldsMapped => {
  const checkedField = fieldsMapped
    ? fieldsMapped?.filter(item => !item.formField || !item.contactFreshdeskFormField)
    : []
  if (checkedField.length > 0) return false
  return true
}

export const generateMappedField = freshdeskConf => {
  const requiredFlds = freshdeskConf?.ticketFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        freshdeskFormField: field.key
      }))
    : [{ formField: '', freshdeskFormField: '' }]
}

export const generateContactMappedField = freshdeskConf => {
  const requiredFlds = freshdeskConf?.contactFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        contactFreshdeskFormField: field.key
      }))
    : [{ formField: '', contactFreshdeskFormField: '' }]
}
