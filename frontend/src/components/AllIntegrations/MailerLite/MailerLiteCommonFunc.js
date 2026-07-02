/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { create } from 'mutative'

export const handleInput = (e, mailerLiteConf, setMailerLiteConf, loading, setLoading) => {
  const { name, value } = e.target

  const updatedConf = create(mailerLiteConf, draftConf => {
    draftConf[name] = value
  })

  setMailerLiteConf(updatedConf)

  if (name === 'action' && value !== '') {
    mailerliteRefreshFields(updatedConf, setMailerLiteConf, loading, setLoading)
  }
}

export const generateMappedField = mailerLiteConf => {
  const requiredFlds = mailerLiteConf?.mailerLiteFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        mailerLiteFormField: field.key
      }))
    : [{ formField: '', mailerLiteFormField: '' }]
}

export const checkMappedFields = mailerLiteConf => {
  const mappedFields = mailerLiteConf?.field_map
    ? mailerLiteConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.mailerLiteFormField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : {
        auth_token: confTmp.auth_token,
        version: confTmp.version
      }

export const mailerliteRefreshFields = (confTmp, setConf, loading, setLoading) => {
  if (!confTmp.connection_id && !confTmp.auth_token) {
    toast.error(__("API Key can't be empty", 'bit-integrations'))

    return
  }

  setLoading({ ...loading, field: true })

  if (confTmp?.action !== 'add_subscriber') {
    setLoading({ ...loading, field: false })

    setConf(prev =>
      create(prev, draftConf => {
        draftConf.mailerLiteFields = [
          {
            key: 'email',
            label: 'Email',
            required: true
          }
        ]

        draftConf.field_map = generateMappedField(draftConf)
      })
    )

    toast.success(__('Fields refresh successfully', 'bit-integrations'))

    return
  }

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'mailerlite_refresh_fields').then(result => {
    setLoading({ ...loading, field: false })

    if (result && result.success) {
      setConf(prev =>
        create(prev, draftConf => {
          draftConf.mailerLiteFields = result.data
          draftConf.field_map = generateMappedField(draftConf)
        })
      )

      toast.success(__('Fields refresh successfully', 'bit-integrations'))

      return
    }

    toast.error(__('Fields refresh failed', 'bit-integrations'))
  })
}

export const getAllGroups = (confTmp, setConf, loding, setLoading) => {
  setLoading({ ...loding, group: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'mailerlite_fetch_all_groups').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.groups = result.data
      }
      setConf(newConf)
      setLoading({ ...loding, group: false })

      toast.success(__('Group fetch successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loding, group: false })
    toast.error(__('Group fetch failed', 'bit-integrations'))
  })
}
