import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { customFieldActions, fieldsByAction, selectsByAction } from './staticData'

const sources = {
  actionPlans: 'follow_up_boss_get_action_plans',
  appointmentOutcomes: 'follow_up_boss_get_appointment_outcomes',
  appointmentTypes: 'follow_up_boss_get_appointment_types',
  customFields: 'follow_up_boss_get_custom_fields',
  dealStages: 'follow_up_boss_get_deal_stages',
  emailCampaigns: 'follow_up_boss_get_email_campaigns',
  groups: 'follow_up_boss_get_groups',
  ponds: 'follow_up_boss_get_ponds',
  stageNames: 'follow_up_boss_get_stage_names',
  stages: 'follow_up_boss_get_stages',
  teams: 'follow_up_boss_get_teams',
  timeframes: 'follow_up_boss_get_timeframes',
  users: 'follow_up_boss_get_users'
}

let pendingFetches = 0

export const handleInput = (e, followUpBossConf, setFollowUpBossConf) => {
  const { name, value } = e.target

  setFollowUpBossConf(
    create(followUpBossConf, draftConf => {
      if (value !== '') {
        draftConf[name] = value
      } else {
        delete draftConf[name]
      }
    })
  )
}

export const fetchSource = (source, conf, setConf, setIsLoading, silent = false) => {
  const route = sources[source]

  if (!route || !conf?.connection_id) return

  pendingFetches += 1
  setIsLoading(true)

  const request = bitsFetch({ connection_id: conf.connection_id }, route)
    .then(result => {
      if (result?.success) {
        setConf(prevConf =>
          create(prevConf, draftConf => {
            if (!draftConf.default) {
              draftConf.default = {}
            }

            draftConf.default[source] = result.data || []
          })
        )
        return __('Options refreshed.', 'bit-integrations')
      }

      throw new Error(
        typeof result?.data === 'string'
          ? result.data
          : __('Refresh failed. Try again.', 'bit-integrations')
      )
    })
    .finally(() => {
      pendingFetches -= 1
      setIsLoading(pendingFetches > 0)
    })

  if (silent) {
    request.catch(error => toast.error(error.message, { id: 'follow-up-boss-fetch-error' }))
    return
  }

  toast.promise(request, {
    error: error => error.message,
    loading: __('Loading options...', 'bit-integrations'),
    success: message => message
  })
}

export const fetchActionSources = (conf, setConf, setIsLoading) => {
  const selectSources = (selectsByAction[conf?.mainAction] || [])
    .map(select => select.source)
    .filter(Boolean)

  if (customFieldActions.includes(conf?.mainAction)) {
    selectSources.push('customFields')
  }

  ;[...new Set(selectSources)].forEach(source => fetchSource(source, conf, setConf, setIsLoading, true))
}

export const generateMappedField = action => {
  const actionFields = fieldsByAction[action] || []
  const requiredFlds = actionFields.filter(fld => fld.required === true)

  if (requiredFlds.length > 0) {
    return requiredFlds.map(field => ({ formField: '', followUpBossField: field.key }))
  }

  return actionFields.length > 0 ? [{ formField: '', followUpBossField: '' }] : []
}

export const checkMappedFields = followUpBossConf => {
  if (!followUpBossConf?.mainAction) return false

  const missingSelect = (selectsByAction[followUpBossConf.mainAction] || []).some(
    select => select.required && !followUpBossConf[select.key]?.length
  )

  if (missingSelect) return false

  const incompleteRows = (followUpBossConf.field_map || []).filter(
    mappedField =>
      !mappedField.formField ||
      !mappedField.followUpBossField ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )

  return incompleteRows.length === 0
}
