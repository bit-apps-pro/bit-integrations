/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'

export const handleInput = (e, mailsterConf, setMailsterConf) => {
  const newConf = create(mailsterConf, draftConf => {
    const { name } = e.target
    if (e.target.value !== '') {
      draftConf[name] = e.target.value
    } else {
      delete draftConf[name]
    }
  })

  setMailsterConf(newConf)
}

export const generateMappedField = mailsterConf => {
  const requiredFlds = mailsterConf?.mailsterFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', mailsterFormField: field.key }))
    : [{ formField: '', mailsterFormField: '' }]
}

export const checkMappedFields = mailsterConf => {
  const mappedFields = mailsterConf?.field_map
    ? mailsterConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.mailsterFormField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}


export const mailsterFields = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, fields: true })

  bitsFetch({}, 'mailster_fields').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.mailsterFields = result.data
      setConf(newConf)
      toast.success(__('Fields fetched successfully.', 'bit-integrations'))
      setLoading({ ...loading, fields: false })
      return
    }
    setLoading({ ...loading, fields: false })
    toast.error(__('Fields fetching failed!', 'bit-integrations'))
  })
}

export const mailsterLists = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, lists: true })

  bitsFetch({}, 'mailster_lists').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.lists = result.data
      setConf(newConf)
      toast.success(__('Lists fetched successfully.', 'bit-integrations'))
      setLoading({ ...loading, lists: false })
      return
    }
    setLoading({ ...loading, lists: false })
    toast.error(__('Lists fetching failed!', 'bit-integrations'))
  })
}

export const mailsterTags = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, tags: true })

  bitsFetch({}, 'mailster_tags').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.tags = result.data
      setConf(newConf)
      toast.success(__('Tags fetched successfully.', 'bit-integrations'))
      setLoading({ ...loading, tags: false })
      return
    }
    setLoading({ ...loading, tags: false })
    toast.error(__('Tags fetching failed!', 'bit-integrations'))
  })
}
