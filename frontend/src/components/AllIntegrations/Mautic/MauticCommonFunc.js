import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'
import { sprintf, __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, sheetConf, setSheetConf) => {
  const newConf = { ...sheetConf }
  newConf[e.target.name] = e.target.value
  setSheetConf({ ...newConf })
}

export const getAllFields = (mauticConf, setMauticConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = {
    clientId: mauticConf.clientId,
    clientSecret: mauticConf.clientSecret,
    baseUrl: mauticConf.baseUrl,
    tokenDetails: mauticConf.tokenDetails
  }
  bitsFetch(requestParams, 'mautic_get_fields')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...mauticConf }
        if (result.data) {
          if (!newConf.default) {
            newConf.default = {}
          }
          if (!newConf.default?.fields) {
            newConf.default.fields = {}
          }
          newConf.default.fields = result.data
          newConf.field_map = generateMappedField(result.data)
        }

        if (result.data?.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({
          show: true,
          msg: __('Fields refreshed', 'bit-integrations')
        })
        setMauticConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}
export const getAllTags = (mauticConf, setMauticConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = {
    clientId: mauticConf.clientId,
    clientSecret: mauticConf.clientSecret,
    baseUrl: mauticConf.baseUrl,
    tokenDetails: mauticConf.tokenDetails
  }
  bitsFetch(requestParams, 'mautic_get_tags')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...mauticConf }
        if (result.data) {
          if (!newConf.default) {
            newConf.default = {}
          }
          if (!newConf.default?.tags) {
            newConf.default.tags = {}
          }
          newConf.default.tags = result.data
        }

        if (result.data?.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({
          show: true,
          msg: __('Tags refreshed', 'bit-integrations')
        })
        setMauticConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Tags refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const getAllUsers = (mauticConf, setMauticConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = {
    clientId: mauticConf.clientId,
    clientSecret: mauticConf.clientSecret,
    baseUrl: mauticConf.baseUrl,
    tokenDetails: mauticConf.tokenDetails
  }
  bitsFetch(requestParams, 'mautic_get_users')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...mauticConf }
        if (result.data) {
          if (!newConf.default) {
            newConf.default = {}
          }
          if (!newConf.default?.users) {
            newConf.default.users = {}
          }
          newConf.default.users = result.data.allUsers
        }

        if (result.data?.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({
          show: true,
          msg: __('Contact Owner refreshed', 'bit-integrations')
        })
        setMauticConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Contact Owner refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const setGrantTokenResponse = integ => {
  const grantTokenResponse = {}
  const authWindowLocation = window.location.href
  const queryParams = authWindowLocation.replace(`${window.opener.location.href}`, '').split('&')
  if (queryParams) {
    queryParams.forEach(element => {
      const gtKeyValue = element.split('=')
      if (gtKeyValue[1]) {
        // eslint-disable-next-line prefer-destructuring
        grantTokenResponse[gtKeyValue[0]] = gtKeyValue[1]
      }
    })
  }
  localStorage.setItem(`__${integ}`, JSON.stringify(grantTokenResponse))
  window.close()
}

export const handleMauticAuthorize = (
  integ,
  confTmp,
  setConf,
  setError,
  setisAuthorized,
  setIsLoading,
  setSnackbar
) => {
  if (!confTmp.clientId || !confTmp.clientSecret || !confTmp.baseUrl) {
    setError({
      clientId: !confTmp.clientId ? __("Client Id can't be empty", 'bit-integrations') : '',
      clientSecret: !confTmp.clientSecret ? __("Secret key can't be empty", 'bit-integrations') : '',
      baseUrl: !confTmp.baseUrl ? __("Base Url can't be empty", 'bit-integrations') : ''
    })
    return
  }
  setIsLoading(true)

  const apiEndpoint = `${confTmp.baseUrl}/oauth/v2/authorize?client_id=${
    confTmp.clientId
  }&redirect_uri=${encodeURIComponent(window.location.href)}&response_type=code`
  const authWindow = window.open(apiEndpoint, integ, 'width=400,height=609,toolbar=off')
  const popupURLCheckTimer = setInterval(() => {
    if (authWindow.closed) {
      clearInterval(popupURLCheckTimer)
      let grantTokenResponse = {}
      let isauthRedirectLocation = false
      const bitsMautic = localStorage.getItem(`__${integ}`)
      if (bitsMautic) {
        isauthRedirectLocation = true
        grantTokenResponse = JSON.parse(bitsMautic)
        localStorage.removeItem(`__${integ}`)
        if (grantTokenResponse.code.search('#')) {
          const [code] = grantTokenResponse.code.split('#')
          grantTokenResponse.code = code
        }
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
        tokenHelper(grantTokenResponse, newConf, setConf, setisAuthorized, setIsLoading, setSnackbar)
      }
    }
  }, 500)
}

const tokenHelper = (grantToken, confTmp, setConf, setisAuthorized, setIsLoading, setSnackbar) => {
  const tokenRequestParams = { ...grantToken }
  tokenRequestParams.clientId = confTmp.clientId
  tokenRequestParams.clientSecret = confTmp.clientSecret
  tokenRequestParams.baseUrl = confTmp.baseUrl
  tokenRequestParams.redirectURI = window.location.href

  bitsFetch(tokenRequestParams, 'mautic_generate_token')
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

export const checkMappedFields = mauticConf => {
  const mappedFleld = mauticConf.field_map
    ? mauticConf.field_map.filter(mapped => !mapped.formField && !mapped.mauticField)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}

const generateMappedField = mauticFields => {
  const requiredFlds = mauticFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        mauticField: field.fieldAlias
      }))
    : [{ formField: '', mauticField: '' }]
}
