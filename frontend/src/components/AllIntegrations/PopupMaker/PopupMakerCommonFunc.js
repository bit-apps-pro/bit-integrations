import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, popupMakerConf, setPopupMakerConf) => {
  const { name, value } = e.target

  setPopupMakerConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshPopupMakerPopups = (setPopupMakerConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_popup_maker_popups')
    .then(result => {
      if (result && result?.success && result?.data?.popups) {
        setPopupMakerConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allPopups = result.data.popups
          })
        )

        setIsLoading(false)
        toast.success(__('All popups fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Popup Maker popups fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const refreshPopupMakerThemes = (setPopupMakerConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_popup_maker_themes')
    .then(result => {
      if (result && result?.success && result?.data?.themes) {
        setPopupMakerConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allThemes = result.data.themes
          })
        )

        setIsLoading(false)
        toast.success(__('All popup themes fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Popup Maker themes fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = popupMakerConf => {
  const mappedFields = popupMakerConf?.field_map
    ? popupMakerConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.popupMakerField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        popupMakerField: field.key
      }))
    : [{ formField: '', popupMakerField: '' }]
}
