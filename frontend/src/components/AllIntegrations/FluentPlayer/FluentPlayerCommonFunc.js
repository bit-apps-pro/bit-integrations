import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, fluentPlayerConf, setFluentPlayerConf) => {
  const { name, value } = e.target

  setFluentPlayerConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const refreshList = (route, dataKey, confKey, successMsg, errorMsg) => (setFluentPlayerConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, route)
    .then(result => {
      if (result && result?.success && result?.data?.[dataKey]) {
        setFluentPlayerConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf[confKey] = result.data[dataKey]
          })
        )
        setIsLoading(false)
        toast.success(successMsg)
        return
      }
      setIsLoading(false)
      toast.error(errorMsg)
    })
    .catch(() => setIsLoading(false))
}

export const refreshFluentPlayerMedia = refreshList(
  'refresh_fluent_player_media',
  'media',
  'allMedia',
  __('All media fetched successfully', 'bit-integrations'),
  __('FluentPlayer media fetch failed. Please try again', 'bit-integrations')
)

export const refreshFluentPlayerTags = refreshList(
  'refresh_fluent_player_tags',
  'tags',
  'allTags',
  __('All tags fetched successfully', 'bit-integrations'),
  __('FluentPlayer tags fetch failed. Please try again', 'bit-integrations')
)

export const refreshFluentPlayerPresets = refreshList(
  'refresh_fluent_player_presets',
  'presets',
  'allPresets',
  __('All presets fetched successfully', 'bit-integrations'),
  __('FluentPlayer presets fetch failed. Please try again', 'bit-integrations')
)

export const refreshFluentPlayerUsers = refreshList(
  'refresh_fluent_player_users',
  'users',
  'allUsers',
  __('All users fetched successfully', 'bit-integrations'),
  __('Users fetch failed. Please try again', 'bit-integrations')
)

export const refreshFluentPlayerAttachments = refreshList(
  'refresh_fluent_player_attachments',
  'attachments',
  'allAttachments',
  __('All attachments fetched successfully', 'bit-integrations'),
  __('Attachments fetch failed. Please try again', 'bit-integrations')
)

export const checkMappedFields = fluentPlayerConf => !!fluentPlayerConf?.mainAction

export const generateMappedField = fields => {
  const requiredFlds = (fields || []).filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', fluentPlayerField: field.key }))
    : [{ formField: '', fluentPlayerField: '' }]
}
