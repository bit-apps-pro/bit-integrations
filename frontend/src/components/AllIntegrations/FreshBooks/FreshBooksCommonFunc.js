import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'

export const handleInput = (e, freshBooksConf, setFreshBooksConf) => {
  const { name, value } = e.target
  setFreshBooksConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = conf => {
  if (!conf?.mainAction) {
    return false
  }
  return true
}

export const handleAuthorize = (confTmp, setError, setisAuthorized, setIsLoading) => {
  if (!confTmp.access_token || !confTmp.account_id) {
    setError({
      access_token: !confTmp.access_token ? __("Access Token can't be empty", 'bit-integrations') : '',
      account_id: !confTmp.account_id ? __("Account ID can't be empty", 'bit-integrations') : ''
    })
    return
  }
  setError({})
  setIsLoading(true)
  const requestParams = {
    access_token: confTmp.access_token,
    account_id: confTmp.account_id
  }

  bitsFetch(requestParams, 'fresh_books_authorization').then(result => {
    if (result && result.success) {
      setisAuthorized(true)
      setIsLoading(false)
      toast.success(__('Authorized Successfully', 'bit-integrations'))
      return
    }
    setIsLoading(false)
    toast.error(__('Authorization failed', 'bit-integrations'))
  })
}
