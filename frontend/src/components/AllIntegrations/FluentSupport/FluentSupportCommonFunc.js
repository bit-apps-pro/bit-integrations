import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'
import { sprintf, __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'

export const handleInput = (
  e,
  fluentSupportConf,
  setFluentSupportConf,
  formID,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  const newConf = { ...fluentSupportConf }
  if (isNew) {
    const rmError = { ...error }
    rmError[e.target.name] = ''
    setError({ ...rmError })
  }
  newConf[e.target.name] = e.target.value
  setFluentSupportConf({ ...newConf })
}

export const supportStaff = (
  formID,
  fluentSupportConf,
  setFluentSupportConf,
  setIsLoading,
  setSnackbar
) => {
  setIsLoading(true)
  const refreshSupportStaffRequestParams = {
    formID,
    password: fluentSupportConf.password,
    userName: fluentSupportConf.userName
  }
  bitsFetch(refreshSupportStaffRequestParams, 'fluent_support_get_all_support_staff')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...fluentSupportConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.default.agents = result.data
        }
        setSnackbar({
          show: true,
          msg: __('Support Staff refreshed', 'bit-integrations')
        })
        setFluentSupportConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Support Staff refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const getCustomFields = (fluentSupportConf, setFluentSupportConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)

  bitsFetch(null, 'fluent_support_get_custom_fields')
    .then(result => {
      setFluentSupportConf(prevConf =>
        create(prevConf, draftConf => {
          if (result && result.success && result.data) {
            draftConf.fluentSupportFields = [...draftConf.basicFields, ...result.data]
            draftConf.field_map = generateMappedField([...draftConf.basicFields, ...result.data])

            result.data.length > 0
              ? setSnackbar({
                  show: true,
                  msg: __('Custom Ticket Fields refreshed', 'bit-integrations')
                })
              : setSnackbar({
                  show: true,
                  msg: __('Custom Ticket Fields not found!', 'bit-integrations')
                })
          } else {
            draftConf.fluentSupportFields = draftConf.basicFields
            draftConf.field_map = generateMappedField(draftConf.basicFields)

            setSnackbar({
              show: true,
              msg:
                result?.data || __('Custom Ticket Fields failed. please try again', 'bit-integrations')
            })
          }
        })
      )

      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const getAllBusinessInboxes = (
  formID,
  fluentSupportConf,
  setFluentSupportConf,
  setIsLoading,
  setSnackbar
) => {
  setIsLoading(true)

  bitsFetch('', 'fluent_support_get_all_business_inboxes')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...fluentSupportConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.default.businessInboxes = result.data
        }
        setSnackbar({
          show: true,
          msg: __('Business Inboxes refreshed', 'bit-integrations')
        })
        setFluentSupportConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Business Inboxes refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const generateMappedField = fluentSupportFields => {
  const requiredFlds = fluentSupportFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        fluentSupportFormField: field.key
      }))
    : [{ formField: '', fluentSupportFormField: '' }]
}

export const checkMappedFields = fluentSupportConf => {
  const mappedFields = fluentSupportConf?.field_map
    ? fluentSupportConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.fluentSupportFormField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const handleAuthorize = (
  confTmp,
  setConf,
  setError,
  setisAuthorized,
  setIsLoading,
  setSnackbar
) => {
  setError({})
  setIsLoading(true)

  bitsFetch(null, 'fluentSupport_authorization')
    .then(result => result)
    .then(result => {
      if (result && result.success) {
        const newConf = { ...confTmp }
        setConf(newConf)
        setisAuthorized(true)
        setSnackbar({
          show: true,
          msg: __('Connected Successfully', 'bit-integrations')
        })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: `${__('Cunnection failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Cunnection failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
}
