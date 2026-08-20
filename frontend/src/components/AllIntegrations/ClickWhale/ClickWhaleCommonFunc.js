import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { needsAuthor } from './staticData'

export const handleInput = (e, clickWhaleConf, setClickWhaleConf) => {
  const { name, value } = e.target

  setClickWhaleConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = clickWhaleConf => {
  const mappedFields = clickWhaleConf?.field_map
    ? clickWhaleConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.clickWhaleField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const refreshClickWhaleAuthors = (setLists, setIsLoading) => {
  setIsLoading(true)

  return bitsFetch(null, 'refresh_clickwhale_authors')
    .then(result => {
      setIsLoading(false)

      if (result?.success && Array.isArray(result?.data?.authors)) {
        setLists(prev => ({ ...prev, authors: result.data.authors }))

        if (result.data.authors.length === 0) {
          toast.error(__('No users found to assign as author.', 'bit-integrations'))
          return
        }

        toast.success(__('All authors fetched successfully', 'bit-integrations'))
        return
      }

      toast.error(__('ClickWhale authors fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => {
      setIsLoading(false)
      toast.error(__('ClickWhale authors fetch failed. Please try again', 'bit-integrations'))
    })
}

export const listsForAction = action => (needsAuthor.includes(action) ? ['authors'] : [])

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        clickWhaleField: field.key
      }))
    : [{ formField: '', clickWhaleField: '' }]
}
