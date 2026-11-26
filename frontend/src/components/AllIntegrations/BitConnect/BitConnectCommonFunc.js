import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { requiredGroupActions } from './staticData'

export const handleInput = (e, bitConnectConf, setBitConnectConf) => {
  const { name, value } = e.target

  setBitConnectConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshOptions = (setBitConnectConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_bit_connect_options')
    .then(result => {
      setIsLoading(false)

      if (!result?.success || !result?.data) {
        toast.error(
          typeof result?.data === 'string'
            ? result.data
            : __('Options fetch failed. Please try again.', 'bit-integrations')
        )
        return
      }

      setBitConnectConf(prevConf =>
        create(prevConf, draftConf => {
          draftConf.allTopicTypes = result.data.topicTypes || []
          draftConf.allStatuses = result.data.statuses || []
          draftConf.allStages = result.data.stages || []
          draftConf.allBadges = result.data.badges || []
          draftConf.allGroups = result.data.groups || []
          draftConf.allTags = result.data.tags || []
        })
      )
      toast.success(__('Options fetched successfully', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = bitConnectConf => {
  const mappedFields = bitConnectConf?.field_map
    ? bitConnectConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.bitConnectField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  return mappedFields.length === 0
}

export const generateMappedField = fields => {
  const rows = fields
    .filter(fld => fld.required === true)
    .map(field => ({ formField: '', bitConnectField: field.key }))

  return rows.length > 0 ? rows : [{ formField: '', bitConnectField: '' }]
}

export const checkRequiredSelect = bitConnectConf => {
  const { mainAction } = bitConnectConf || {}

  if (
    mainAction === 'set_post_status' &&
    !bitConnectConf?.selectedStatus &&
    !bitConnectConf?.selectedStage
  ) {
    return __('Status and stage are empty. Select a status, a stage, or both.', 'bit-integrations')
  }

  if (mainAction === 'award_badge' && !bitConnectConf?.selectedBadge) {
    return __('Badge is empty. Select a badge.', 'bit-integrations')
  }

  if (requiredGroupActions.includes(mainAction) && !bitConnectConf?.selectedGroup) {
    return __('Group is empty. Select a group.', 'bit-integrations')
  }

  return ''
}
