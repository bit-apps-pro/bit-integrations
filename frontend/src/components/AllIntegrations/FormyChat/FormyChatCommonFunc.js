import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, formyChatConf, setFormyChatConf) => {
  const { name, value } = e.target
  setFormyChatConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshFormyChatWidgets = (setFormyChatConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_formy_chat_widgets')
    .then(result => {
      if (result?.success && result?.data?.widgets) {
        setFormyChatConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allWidgets = result.data.widgets
          })
        )
        toast.success(__('FormyChat widgets fetched successfully', 'bit-integrations'))
      } else {
        toast.error(__('FormyChat widgets fetch failed. Please try again', 'bit-integrations'))
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshFormyChatWidgetFields = (widgetId, setFormyChatConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch({ widgetId }, 'refresh_formy_chat_widget_fields')
    .then(result => {
      if (result?.success && result?.data?.fields) {
        setFormyChatConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allFields = result.data.fields
          })
        )
      } else {
        toast.error(__('FormyChat widget fields fetch failed. Please try again', 'bit-integrations'))
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = formyChatConf => {
  const mappedFields = formyChatConf?.field_map
    ? formyChatConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.formyChatField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) return false
  if (!formyChatConf?.widgetId || !formyChatConf?.mainAction) return false

  const partialMeta = (formyChatConf?.meta_map || []).filter(
    m =>
      (m.formField && !m.metaKey) ||
      (!m.formField && m.metaKey) ||
      (m.formField === 'custom' && !m.customValue)
  )
  if (partialMeta.length > 0) return false

  return true
}

export const generateMappedField = () => [{ formField: '', formyChatField: '' }]

export const addMetaFieldMap = (i, formyChatConf, setFormyChatConf) => {
  const newConf = { ...formyChatConf }
  newConf.meta_map.splice(i, 0, { formField: '', metaKey: '' })
  setFormyChatConf({ ...newConf })
}

export const delMetaFieldMap = (i, formyChatConf, setFormyChatConf) => {
  const newConf = { ...formyChatConf }
  if (newConf.meta_map.length > 1) {
    newConf.meta_map.splice(i, 1)
  }
  setFormyChatConf({ ...newConf })
}

export const handleMetaMapping = (event, i, formyChatConf, setFormyChatConf) => {
  const newConf = { ...formyChatConf }
  newConf.meta_map[i][event.target.name] = event.target.value
  setFormyChatConf({ ...newConf })
}
