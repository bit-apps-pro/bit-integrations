import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, teamsForWcConf, setTeamsForWcConf) => {
  const { name, value } = e.target

  setTeamsForWcConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshTeamsForWcTeams = (setTeamsForWcConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'teams_for_wc_memberships_refresh_teams')
    .then(result => {
      if (result && result?.success && result?.data?.teams) {
        setTeamsForWcConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allTeams = result.data.teams
          })
        )

        setIsLoading(false)
        toast.success(__('All teams fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(
        __('Teams for WooCommerce Memberships teams fetch failed. Please try again', 'bit-integrations')
      )
    })
    .catch(() => setIsLoading(false))
}

export const refreshTeamsForWcMemberRoles = (setTeamsForWcConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'teams_for_wc_memberships_refresh_member_roles')
    .then(result => {
      if (result && result?.success && result?.data?.roles) {
        setTeamsForWcConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allMemberRoles = result.data.roles
          })
        )

        setIsLoading(false)
        toast.success(__('All member roles fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Member roles fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = teamsForWcConf => {
  if (!teamsForWcConf?.selectedTeam) {
    return false
  }

  // Check if member role is selected for actions that require it
  if (
    ['add_member_to_team', 'invite_user_to_team', 'update_member_role'].includes(
      teamsForWcConf?.mainAction
    ) &&
    !teamsForWcConf?.selectedMemberRole
  ) {
    return false
  }

  const mappedFields = teamsForWcConf?.field_map
    ? teamsForWcConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.teamsForWooCommerceMembershipsField ||
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
        teamsForWooCommerceMembershipsField: field.key
      }))
    : [{ formField: '', teamsForWooCommerceMembershipsField: '' }]
}
