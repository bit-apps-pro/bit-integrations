import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, elementsKitConf, setElementsKitConf) => {
  const { name, value } = e.target

  setElementsKitConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshElementsKitContents = (setElementsKitConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_elements_kit_contents')
    .then(result => {
      if (result && result?.success && result?.data?.contents) {
        setElementsKitConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allContents = result.data.contents
          })
        )

        setIsLoading(false)
        toast.success(__('All dynamic content items fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('ElementsKit dynamic content fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = elementsKitConf => {
  const mappedFields = elementsKitConf?.field_map
    ? elementsKitConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.elementsKitField ||
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
        elementsKitField: field.key
      }))
    : [{ formField: '', elementsKitField: '' }]
}
