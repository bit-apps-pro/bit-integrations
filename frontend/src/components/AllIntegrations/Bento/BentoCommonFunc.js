/* eslint-disable no-console */
/* eslint-disable no-else-return */
import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, salesmateConf, setSalesmateConf) => {
  const newConf = { ...salesmateConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setSalesmateConf({ ...newConf })
}

const generateMappedField = bentoFields => {
  const requiredFlds = bentoFields.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        bentoFormField: field.key
      }))
    : [{ formField: '', bentoFormField: '' }]
}

export const checkMappedFields = bentoConf => {
  const mappedFields = bentoConf?.field_map
    ? bentoConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.bentoFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (bentoConf.action === 'add_event' &&
            mappedField.bentoFormField === 'customFieldKey' &&
            !mappedField.customFieldKey)
      )
    : []

  return mappedFields.length <= 0
}

const setRequestParams = (config, customs = {}) => {
  if (config.connection_id) {
    return {
      ...customs,
      connection_id: config.connection_id
    }
  }

  return {
    ...customs,
    publishable_key: config.publishable_key,
    secret_key: config.secret_key,
    site_uuid: config.site_uuid
  }
}

export const getFields = (confTmp, setConf, action, setIsLoading) => {
  setIsLoading(true)

  bitsFetch(setRequestParams(confTmp, { action: action }), 'bento_get_fields').then(result => {
    setIsLoading(false)

    if (result?.success && result?.data) {
      setConf(prevConf =>
        create(prevConf, draftConf => {
          draftConf.bentoFields = result.data
          draftConf.field_map = generateMappedField(result.data)
        })
      )

      toast.success(__('Fields fetched successfully', 'bit-integrations'))
      return
    }

    toast.error(result?.data ? result?.data : __('Fields fetching failed', 'bit-integrations'))
  })
}

export const getAllTags = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, tags: true })

  bitsFetch(setRequestParams(confTmp), 'bento_get_all_tags').then(result => {
    setLoading({ ...setLoading, tags: false })

    if (result?.success && result?.data) {
      setConf(prevConf =>
        create(prevConf, draftConf => {
          draftConf.tags = result.data
        })
      )

      toast.success(__('Fields fetched successfully', 'bit-integrations'))
      return
    }

    toast.error(result?.data ? result?.data : __('Fields fetching failed', 'bit-integrations'))
  })
}
