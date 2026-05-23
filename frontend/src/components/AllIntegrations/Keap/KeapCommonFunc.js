import { __, sprintf } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { contactFields } from './staticData'

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

export const handleAuthorize = (
  confTmp,
  setConf,
  setError,
  setisAuthorized,
  setIsLoading,
  setSnackbar,
  btcbi
) => {
  if (!confTmp.clientId || !confTmp.clientSecret) {
    setError({
      clientId: !confTmp.clientId ? __("Client Id can't be empty", 'bit-integrations') : '',
      clientSecret: !confTmp.clientSecret ? __("Secret key can't be empty", 'bit-integrations') : ''
    })
    return
  }
  setIsLoading(true)
  const apiEndpoint = `https://accounts.infusionsoft.com/app/oauth/authorize?scope=full&access_type=offline&prompt=consent&response_type=code&state=${encodeURIComponent(
    window.location.href
  )}/redirect&redirect_uri=${encodeURIComponent(`${btcbi.api}/redirect`)}&client_id=${confTmp.clientId}`
  const authWindow = window.open(apiEndpoint, 'keap', 'width=400,height=609,toolbar=off')
  const popupURLCheckTimer = setInterval(() => {
    if (authWindow.closed) {
      clearInterval(popupURLCheckTimer)
      let grantTokenResponse = {}
      let isauthRedirectLocation = false
      const bitsGoogleSheet = localStorage.getItem('__keap')
      if (bitsGoogleSheet) {
        isauthRedirectLocation = true
        grantTokenResponse = JSON.parse(bitsGoogleSheet)
        localStorage.removeItem('__keap')
      }
      if (
        !grantTokenResponse.code ||
        grantTokenResponse.error ||
        !grantTokenResponse ||
        !isauthRedirectLocation
      ) {
        const errorCause = grantTokenResponse.error ? `Cause: ${grantTokenResponse.error}` : ''
        setSnackbar({
          show: true,
          msg: `${__('Authorization failed', 'bit-integrations')} ${errorCause}. ${__(
            'please try again',
            'bit-integrations'
          )}`
        })
        setIsLoading(false)
      } else {
        const newConf = { ...confTmp }
        newConf.accountServer = grantTokenResponse['accounts-server']
        tokenHelper(
          grantTokenResponse,
          newConf,
          setConf,
          setisAuthorized,
          setIsLoading,
          setSnackbar,
          btcbi
        )
      }
    }
  }, 500)
}

const tokenHelper = (
  grantToken,
  confTmp,
  setConf,
  setisAuthorized,
  setIsLoading,
  setSnackbar,
  btcbi
) => {
  const tokenRequestParams = { ...grantToken }
  tokenRequestParams.clientId = confTmp.clientId
  tokenRequestParams.clientSecret = confTmp.clientSecret
  // eslint-disable-next-line no-undef
  tokenRequestParams.redirectURI = `${btcbi.api}/redirect`
  bitsFetch(tokenRequestParams, 'keap_generate_token')
    .then(result => result)
    .then(result => {
      if (result && result.success) {
        const newConf = { ...confTmp }
        newConf.tokenDetails = result.data
        setConf(newConf)
        setisAuthorized(true)
        setSnackbar({
          show: true,
          msg: __('Authorized Successfully', 'bit-integrations')
        })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: `${__('Authorization failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Authorization failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
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
  setLoading({ ...setLoading, tags: true })

  const requestParams = {
    clientId: confTmp.clientId,
    clientSecret: confTmp.clientSecret,
    tokenDetails: confTmp.tokenDetails
  }

  bitsFetch(requestParams, 'keap_fetch_all_tags').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.tags = result.data
      }
      setConf(newConf)
      setLoading(false)

      setSnackbar({
        show: true,
        msg: __('Tag Fetched Successfully', 'bit-integrations')
      })
      return
    }
    setLoading({ ...setLoading, tags: false })
    setSnackbar({
      show: true,
      msg: __("Tag Couldn't Fetched Successfully", 'bit-integrations')
    })
  })
}

export const refreshCustomFields = (id, confTmp, setConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)

  const requestParams = {
    id: id,
    clientId: confTmp.clientId,
    clientSecret: confTmp.clientSecret,
    tokenDetails: confTmp.tokenDetails
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
