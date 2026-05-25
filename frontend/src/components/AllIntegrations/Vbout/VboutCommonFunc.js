/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { create } from 'mutative'

export const handleInput = (e, vboutConf, setVboutConf) => {
  setVboutConf(prevConf =>
    create(prevConf, draftConfig => {
      const { name } = e.target
      if (e.target.value !== '') {
        draftConfig[name] = e.target.value
      } else {
        delete draftConfig[name]
      }
    })
  )
}

export const generateMappedField = vboutConf => {
  const requiredFlds = vboutConf?.VboutFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', VboutFormField: field.key }))
    : [{ formField: '', VboutFormField: '' }]
}

export const checkMappedFields = vboutConf => {
  const mappedFields = vboutConf?.field_map
    ? vboutConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.VboutFormField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const VboutRefreshFields = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, field: true })

  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id, list_id: confTmp.list_id }
    : { auth_token: confTmp.auth_token, list_id: confTmp.list_id }

  bitsFetch(requestParams, 'vbout_refresh_fields').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.VboutFields = result.data
      }
      newConf['field_map'] = generateMappedField(newConf)
      setConf(newConf)
      setLoading({ ...loading, field: false })
      toast.success(__('Fields refresh successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, field: false })
    toast.error(__('Fields refresh failed', 'bit-integrations'))
  })
}

export const getAllLists = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, list: true })

  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { auth_token: confTmp.auth_token }

  bitsFetch(requestParams, 'vbout_fetch_all_lists').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        if (!newConf.default) {
          newConf.default = {}
        }
        newConf.default.lists = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, list: false })

      toast.success(__('List refresh successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, list: false })
    toast.error(__('List refresh failed', 'bit-integrations'))
  })
}
