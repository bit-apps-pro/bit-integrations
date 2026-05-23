import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, sureDashConf, setSureDashConf) => {
  const { name, value } = e.target

  setSureDashConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshSureDashSpaces = (setSureDashConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_sure_dash_spaces')
    .then(result => {
      if (result && result?.success && result?.data?.spaces) {
        setSureDashConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allSpaces = result.data.spaces
          })
        )
        setIsLoading(false)
        toast.success(__('All spaces fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('SureDash spaces fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const refreshSureDashPosts = (setSureDashConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_sure_dash_posts')
    .then(result => {
      if (result && result?.success && result?.data?.posts) {
        setSureDashConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allPosts = result.data.posts
          })
        )
        setIsLoading(false)
        toast.success(__('All posts fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('SureDash posts fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = sureDashConf => {
  const mappedFields = sureDashConf?.field_map
    ? sureDashConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.sureDashField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  return mappedFields.length === 0
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        sureDashField: field.key
      }))
    : [{ formField: '', sureDashField: '' }]
}
