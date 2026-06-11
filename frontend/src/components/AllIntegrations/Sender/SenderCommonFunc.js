/* eslint-disable no-else-return */
import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, senderConf, setSenderConf) => {
  const { name, value } = e.target

  setSenderConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const generateMappedField = fields => {
  const requiredFlds = (fields || []).filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', senderField: field.key }))
    : [{ formField: '', senderField: '' }]
}

export const checkMappedFields = senderConf => {
  const mappedFields = senderConf?.field_map
    ? senderConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.senderField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  return mappedFields.length < 1
}

export const authorization = (confTmp, setIsAuthorized, loading, setLoading) => {
  if (!confTmp.api_token) {
    toast.error(__("API token can't be empty", 'bit-integrations'))
    return
  }

  setLoading({ ...loading, auth: true })

  bitsFetch({ api_token: confTmp.api_token }, 'sender_authorize').then(result => {
    setLoading({ ...loading, auth: false })

    if (result && result.success) {
      setIsAuthorized(true)
      toast.success(__('Authorized Successfully', 'bit-integrations'))
      return
    }

    toast.error(__('Authorization failed', 'bit-integrations'))
  })
}

export const refreshSenderGroups = (confTmp, setSenderConf, setIsLoading) => {
  if (!confTmp.api_token) {
    toast.error(__("API token can't be empty", 'bit-integrations'))
    return
  }

  setIsLoading(true)
  bitsFetch({ api_token: confTmp.api_token }, 'refresh_sender_groups')
    .then(result => {
      if (result && result.success && result.data?.groups) {
        setSenderConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allGroups = result.data.groups
          })
        )
        setIsLoading(false)
        toast.success(__('Groups fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Groups fetch failed', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const refreshSenderFields = (confTmp, setSenderConf, setIsLoading) => {
  if (!confTmp.api_token) {
    toast.error(__("API token can't be empty", 'bit-integrations'))
    return
  }

  setIsLoading(true)
  bitsFetch({ api_token: confTmp.api_token }, 'refresh_sender_fields')
    .then(result => {
      if (result && result.success && result.data?.fields) {
        setSenderConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allFields = result.data.fields
          })
        )
        setIsLoading(false)
        toast.success(__('Custom fields fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Custom fields fetch failed', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}
