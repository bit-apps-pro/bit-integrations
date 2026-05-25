import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, mainWPConf, setMainWPConf) => {
  const { name, value } = e.target

  setMainWPConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = conf => {
  if (!conf?.mainAction) return false

  if (conf.mainAction !== 'sync_all_sites' && !conf?.selectedSite) return false

  const requiredFields = conf?.mainWPFields?.filter(f => f.required) || []

  if (!requiredFields.length) return true

  return requiredFields.every((_, i) => {
    const mapItem = conf?.field_map?.[i]
    return mapItem?.formField && mapItem?.mainWPField
  })
}

export const generateMappedField = fields => {
  if (!fields?.length) return []
  const required = fields.filter(f => f.required)
  const hasOptional = fields.some(f => !f.required)
  const map = required.map(f => ({ formField: '', mainWPField: f.key }))
  if (hasOptional) map.push({ formField: '', mainWPField: '' })
  return map
}

export const refreshMainWPSites = (setMainWPConf, setIsLoading) => {
  setIsLoading('sites')
  bitsFetch(null, 'refresh_main_wp_sites')
    .then(result => {
      if (result?.success && result?.data?.sites) {
        setMainWPConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allSites = result.data.sites
          })
        )
        toast.success(__('Sites fetched successfully', 'bit-integrations'))
      } else {
        toast.error(__('Failed to fetch sites. Please try again.', 'bit-integrations'))
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}
