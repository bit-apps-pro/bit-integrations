import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, pointicsConf, setPointicsConf) => {
  const { name, value } = e.target

  setPointicsConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshPointicsChannels = (setPointicsConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_pointics_channels')
    .then(result => {
      if (result && result?.success && result?.data?.channels) {
        setPointicsConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allChannels = result.data.channels
          })
        )

        setIsLoading(false)
        toast.success(__('All channels fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Pointics channels fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const refreshPointicsRewards = (setPointicsConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_pointics_rewards')
    .then(result => {
      if (result && result?.success && result?.data?.rewards) {
        setPointicsConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allRewards = result.data.rewards
          })
        )

        setIsLoading(false)
        toast.success(__('All rewards fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Pointics rewards fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = pointicsConf => {
  if (!pointicsConf?.mainAction) {
    return false
  }

  const mappedFields = pointicsConf?.field_map
    ? pointicsConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.pointicsField ||
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
        pointicsField: field.key
      }))
    : [{ formField: '', pointicsField: '' }]
}
