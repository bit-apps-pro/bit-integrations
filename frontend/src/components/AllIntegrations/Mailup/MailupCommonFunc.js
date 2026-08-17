/* eslint-disable no-console */
import bitsFetch from '../../../Utils/bitsFetch'
import { sprintf, __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        tokenDetails: conf.tokenDetails,
        clientId: conf.clientId,
        clientSecret: conf.clientSecret
      }

export const handleInput = (e, mailupConf, setMailupConf, setIsLoading, setSnackbar) => {
  const newConf = { ...mailupConf }
  const { name, value } = e.target

  if (value !== '') {
    newConf[name] = value
    if (name === 'listId') {
      fetchAllGroup(newConf, setMailupConf, setIsLoading, setSnackbar)
      fetchAllField(newConf, setMailupConf, setIsLoading, setSnackbar)
    }
  } else {
    delete newConf[name]
  }

  setMailupConf({ ...newConf })
}

export const fetchAllList = (mailupConf, setMailupConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = buildAuthRequestParams(mailupConf)
  bitsFetch(requestParams, 'mailup_fetch_all_list')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...mailupConf }
        if (result.data) {
          newConf.allList = result.data
        }
        setSnackbar({
          show: true,
          msg: __('Mailup all Lists fetched successfully.', 'bit-integrations')
        })
        setMailupConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Mailup lists fetching failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const fetchAllField = (mailupConf, setMailupConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = buildAuthRequestParams(mailupConf)
  bitsFetch(requestParams, 'mailup_fetch_all_field')
    .then(result => {
      if (result && result.success) {
        setMailupConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.staticFields = result.data
            draftConf.field_map = generateMappedField(draftConf)
          })
        )
        setSnackbar({
          show: true,
          msg: __('Mailup all fields fetched successfully', 'bit-integrations')
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Mailup fields fetching failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const fetchAllGroup = (mailupConf, setMailupConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = {
    ...buildAuthRequestParams(mailupConf),
    listId: mailupConf.listId
  }
  bitsFetch(requestParams, 'mailup_fetch_all_group')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...mailupConf }
        if (result.data) {
          newConf.allGroup = result.data
        }
        setSnackbar({ show: true, msg: __('All groups fetched successfully', 'bit-integrations') })
        setMailupConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Groups fetching failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const generateMappedField = mailupConf => {
  const requiredFlds = mailupConf?.staticFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', mailupFormField: field.key }))
    : [{ formField: '', mailupFormField: '' }]
}

export const checkMappedFields = mailupConf => {
  const mappedFields = mailupConf?.field_map
    ? mailupConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.mailupFormField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
