import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { needsPlan } from './staticData'

export const handleInput = (e, profilePressConf, setProfilePressConf) => {
  const { name, value } = e.target

  setProfilePressConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

/**
 * Plans are held in component state rather than on conf, so they are not
 * serialized into flow_details on every save.
 */
export const refreshProfilePressPlans = (setLists, setIsLoading) => {
  setIsLoading(true)

  return bitsFetch(null, 'refresh_profilepress_plans')
    .then(result => {
      setIsLoading(false)

      if (result?.success && result?.data?.plans) {
        setLists(prev => ({ ...prev, plans: result.data.plans }))
        toast.success(__('All plans fetched successfully', 'bit-integrations'))
        return
      }

      toast.error(__('ProfilePress plans fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

/**
 * Which lists a given action's dropdowns need.
 *
 * @param {string} action mainAction slug
 *
 * @returns {string[]}
 */
export const listsForAction = action => (needsPlan.includes(action) ? ['plans'] : [])

export const checkMappedFields = profilePressConf => {
  const mappedFields = profilePressConf?.field_map
    ? profilePressConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.profilePressField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

/**
 * Validate the selections the field map cannot express.
 *
 * Shared by the create wizard and the edit screen so both paths reject the same
 * configurations.
 *
 * @param {object} profilePressConf
 *
 * @returns {string} error message, or '' when the config is valid
 */
export const validateProfilePressConf = profilePressConf => {
  const action = profilePressConf?.mainAction

  if (!action) {
    return __('Please select an action to continue.', 'bit-integrations')
  }

  if (needsPlan.includes(action) && !profilePressConf?.selectedPlan) {
    return __('Please select a plan to continue.', 'bit-integrations')
  }

  return ''
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        profilePressField: field.key
      }))
    : [{ formField: '', profilePressField: '' }]
}
