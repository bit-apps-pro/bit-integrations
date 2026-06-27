import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'
import { sprintf, __ } from '../../../Utils/i18nwrap'

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
    clientId: confTmp.clientId,
    clientSecret: confTmp.clientSecret,
    tokenDetails: confTmp.tokenDetails
  }

  bitsFetch(requestParams, 'cContact_refresh_list').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.lists = result.data.contactList
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
    clientId: confTmp.clientId,
    clientSecret: confTmp.clientSecret,
    tokenDetails: confTmp.tokenDetails
  }

  bitsFetch(requestParams, 'cContact_custom_fields').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        const mergedFields = newConf.default.constantContactFields.concat(result.data.customFields)
        newConf.default.constantContactFields = mergedFields
      }
      setConf(newConf)
    }
  })
}

export const getContactTags = (id, confTmp, setConf, isLoading, setIsLoading) => {
  setIsLoading({ ...isLoading, tag: true })

  const requestParams = {
    integId: id,
    clientId: confTmp.clientId,
    clientSecret: confTmp.clientSecret,
    tokenDetails: confTmp.tokenDetails
  }

  bitsFetch(requestParams, 'cContact_refresh_tags').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.tags = result.data.contactTag
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

export const handleConstantContactAuthorize = (
  integ,
  ajaxInteg,
  scopes,
  confTmp,
  setConf,
  setError,
  setisAuthorized,
  setIsLoading,
  setSnackbar,
  btcbi
) => {
  if (!confTmp.clientId) {
    setError({
      clientId: !confTmp.clientId ? __("Client Id can't be empty", 'bit-integrations') : '',
      clientSecret: !confTmp.clientSecret ? __("Secret key can't be empty", 'bit-integrations') : ''
    })
    return
  }
  setIsLoading(true)

  const apiEndpoint = `https://authz.constantcontact.com/oauth2/default/v1/authorize?scope=${scopes}&response_type=code&client_id=${
    confTmp.clientId
  }&state=${encodeURIComponent(window.location.href)}/redirect&redirect_uri=${encodeURIComponent(
    `${btcbi.api}`
  )}/redirect`

  const authWindow = window.open(apiEndpoint, integ, 'width=400,height=609,toolbar=off')

  const popupURLCheckTimer = setInterval(() => {
    if (authWindow.closed) {
      clearInterval(popupURLCheckTimer)
      let grantTokenResponse = {}
      let isauthRedirectLocation = false
      const bitsConstantContact = localStorage.getItem(`__${integ}`)
      if (bitsConstantContact) {
        isauthRedirectLocation = true
        grantTokenResponse = JSON.parse(bitsConstantContact)
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
        tokenHelper(
          ajaxInteg,
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
  ajaxInteg,
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
  tokenRequestParams.redirectURI = `${btcbi.api}/redirect`

  bitsFetch(tokenRequestParams, `${ajaxInteg}_generate_token`)
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
