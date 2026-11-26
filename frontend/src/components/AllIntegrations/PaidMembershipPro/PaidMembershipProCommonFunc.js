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
  {
    key: PMPRO_ACTIONS.UPDATE_PROFILE,
    label: __('Update the user profile', 'bit-integrations'),
    is_pro: true
  },
  {
    key: PMPRO_ACTIONS.DIRECTORY_VISIBILITY,
    label: __('Show or hide the user in the member directory', 'bit-integrations'),
    is_pro: true
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
  setPaidMembershipProConf({ ...paidMembershipProConf, [name]: value })

  if (name !== 'mainAction') {
    return
  }

  if (MEMBERSHIP_ACTIONS.includes(value)) {
    getAllPaidMemberShipProLevel(
      { ...paidMembershipProConf, mainAction: value },
      setPaidMembershipProConf,
      setIsLoading,
      setSnackbar
    )
  } else if (value === PMPRO_ACTIONS.UPDATE_PROFILE) {
    getPaidMembershipProProfileFields(paidMembershipProConf, setPaidMembershipProConf, setIsLoading)
  }
}

const fetchFailed = (setIsLoading, message) => {
  setIsLoading(false)
  toast.error(message)
}

export const getAllPaidMemberShipProLevel = (
  paidMembershipProConf,
  setPaidMembershipProConf,
  setIsLoading
) => {
  const failedMessage = __(
    'Paid Membership pro level fetch failed. please try again',
    'bit-integrations'
  )
  const anyLevel = {
    membershipId: 'any',
    membershipTitle: __('Any membership level', 'bit-integrations')
  }

  setIsLoading(true)
  bitsFetch(null, 'fetch_all_paid_membership_pro_level')
    .then(result => {
      if (!result?.success || !Array.isArray(result.data)) {
        fetchFailed(setIsLoading, failedMessage)
        return
      }

      setPaidMembershipProConf(prevConf => ({
        ...prevConf,
        default: {
          ...prevConf.default,
          allMemberShipLevel:
            paidMembershipProConf.mainAction === PMPRO_ACTIONS.REMOVE_MEMBERSHIP
              ? [anyLevel, ...result.data]
              : result.data
        }
      }))
      setIsLoading(false)
      toast.success(__('All Paid Membership pro level fetched successfully', 'bit-integrations'))
    })
    .catch(() => fetchFailed(setIsLoading, failedMessage))
}

export const getPaidMembershipProProfileFields = (
  paidMembershipProConf,
  setPaidMembershipProConf,
  setIsLoading
) => {
  const failedMessage = __('Profile fields fetch failed. Please try again.', 'bit-integrations')

  setIsLoading(true)
  bitsFetch(null, 'paid_membership_pro_profile_fields')
    .then(result => {
      if (!result?.success || !Array.isArray(result.data)) {
        fetchFailed(setIsLoading, failedMessage)
        return
      }

      setPaidMembershipProConf(prevConf => ({
        ...prevConf,
        profileFields: result.data,
        field_map: prevConf.field_map?.length
          ? prevConf.field_map
          : [{ formField: '', paidmembershipproFormField: '' }]
      }))
      setIsLoading(false)
      toast.success(__('Profile fields fetched successfully', 'bit-integrations'))
    })
    .catch(() => fetchFailed(setIsLoading, failedMessage))
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
