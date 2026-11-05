import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { isUserSourceIncomplete } from '../IntegrationHelpers/userSource'

export const PMPRO_ACTIONS = {
  ADD_MEMBERSHIP: '1',
  REMOVE_MEMBERSHIP: '2',
  UPDATE_PROFILE: '3',
  DIRECTORY_VISIBILITY: '4'
}

export const MEMBERSHIP_ACTIONS = [PMPRO_ACTIONS.ADD_MEMBERSHIP, PMPRO_ACTIONS.REMOVE_MEMBERSHIP]

export const getPaidMembershipProActions = () => [
  { key: PMPRO_ACTIONS.ADD_MEMBERSHIP, label: __('Add the user to a membership', 'bit-integrations') },
  {
    key: PMPRO_ACTIONS.REMOVE_MEMBERSHIP,
    label: __('Remove the user from a membership', 'bit-integrations')
  },
  { key: PMPRO_ACTIONS.UPDATE_PROFILE, label: __('Update the user profile', 'bit-integrations') },
  {
    key: PMPRO_ACTIONS.DIRECTORY_VISIBILITY,
    label: __('Show or hide the user in the member directory', 'bit-integrations')
  }
]

export const handleInput = (
  e,
  paidMembershipProConf,
  setPaidMembershipProConf,
  setIsLoading,
  setSnackbar,
  formID
) => {
  const { name, value } = e.target
  const newConf = { ...paidMembershipProConf, [name]: value }

  if (name !== 'mainAction') {
    setPaidMembershipProConf(newConf)
    return
  }

  if (MEMBERSHIP_ACTIONS.includes(value)) {
    getAllPaidMemberShipProLevel(newConf, setPaidMembershipProConf, setIsLoading, setSnackbar)
    return
  }

  if (value === PMPRO_ACTIONS.UPDATE_PROFILE) {
    getPaidMembershipProProfileFields(newConf, setPaidMembershipProConf, setIsLoading)
    return
  }

  setPaidMembershipProConf(newConf)
}

export const getAllPaidMemberShipProLevel = (
  paidMembershipProConf,
  setPaidMembershipProConf,
  setIsLoading,
  setSnackbar
) => {
  setIsLoading(true)
  bitsFetch(null, 'fetch_all_paid_membership_pro_level')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...paidMembershipProConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          if (newConf.mainAction === '2') {
            const newLevel = { membershipId: 'any', membershipTitle: 'Any membership level' }
            newConf.default.allMemberShipLevel = [newLevel, ...result.data]
          } else {
            newConf.default.allMemberShipLevel = result.data
          }
        }
        setPaidMembershipProConf(newConf)
        setIsLoading(false)
        toast.success(__('All Paid Membership pro level fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Paid Membership pro level fetch failed. please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const getPaidMembershipProProfileFields = (
  paidMembershipProConf,
  setPaidMembershipProConf,
  setIsLoading
) => {
  setIsLoading(true)
  bitsFetch(null, 'paid_membership_pro_profile_fields')
    .then(result => {
      setIsLoading(false)

      if (!result?.success || !Array.isArray(result.data)) {
        toast.error(__('Profile fields fetch failed. Please try again.', 'bit-integrations'))
        return
      }

      setPaidMembershipProConf({
        ...paidMembershipProConf,
        profileFields: result.data,
        field_map: paidMembershipProConf.field_map?.length
          ? paidMembershipProConf.field_map
          : [{ formField: '', paidmembershipproFormField: '' }]
      })
      toast.success(__('Profile fields fetched successfully', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = paidMembershipProConf => {
  const fieldMap = paidMembershipProConf?.field_map || []

  return (
    fieldMap.length > 0 &&
    fieldMap.every(
      ({ formField, paidmembershipproFormField, customValue }) =>
        formField && paidmembershipproFormField && (formField !== 'custom' || customValue)
    )
  )
}

export const isPaidMembershipProConfIncomplete = paidMembershipProConf => {
  const { mainAction } = paidMembershipProConf || {}

  if (!mainAction || isUserSourceIncomplete(paidMembershipProConf)) {
    return true
  }

  if (MEMBERSHIP_ACTIONS.includes(mainAction)) {
    return paidMembershipProConf.selectedMembership === undefined
  }

  if (mainAction === PMPRO_ACTIONS.UPDATE_PROFILE) {
    return !checkMappedFields(paidMembershipProConf)
  }

  if (mainAction === PMPRO_ACTIONS.DIRECTORY_VISIBILITY) {
    return !paidMembershipProConf.directoryVisibility
  }

  return false
}
