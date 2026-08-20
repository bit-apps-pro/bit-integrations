import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, badgeOSConf, setBadgeOSConf) => {
  const { name, value } = e.target

  setBadgeOSConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshBadgeOSAchievements = (setBadgeOSConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_badgeos_achievements')
    .then(result => {
      if (result && result?.success && result?.data?.achievements) {
        setBadgeOSConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allAchievements = result.data.achievements
          })
        )

        setIsLoading(false)
        toast.success(__('All achievements fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('BadgeOS achievements fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = badgeOSConf => {
  const mappedFields = badgeOSConf?.field_map
    ? badgeOSConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.badgeOSField ||
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
        badgeOSField: field.key
      }))
    : [{ formField: '', badgeOSField: '' }]
}
