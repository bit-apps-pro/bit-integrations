import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

const SESSION_ACTIONS = [
  'delete_abandoned_cart',
  'reschedule_recovery_emails',
  'update_cart_status'
]

const isSessionIdMapped = cartAbandonmentRecoveryConf => {
  const sessionField = cartAbandonmentRecoveryConf?.field_map?.find(
    field => field.cartAbandonmentRecoveryField === 'session_id'
  )

  return !!(
    sessionField?.formField &&
    (sessionField.formField !== 'custom' || sessionField.customValue)
  )
}

export const handleInput = (e, cartAbandonmentRecoveryConf, setCartAbandonmentRecoveryConf) => {
  const { name, value } = e.target

  setCartAbandonmentRecoveryConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshCartAbandonmentRecoveryCarts = (setCartAbandonmentRecoveryConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_cart_abandonment_recovery_carts')
    .then(result => {
      if (result?.success && result?.data?.carts) {
        setCartAbandonmentRecoveryConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.abandonedCarts = result.data.carts
          })
        )

        setIsLoading(false)
        toast.success(__('Abandoned carts fetched successfully', 'bit-integrations'))
        return
      }

      setIsLoading(false)
      toast.error(__('Abandoned carts fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = cartAbandonmentRecoveryConf => {
  if (
    !cartAbandonmentRecoveryConf?.mainAction ||
    !SESSION_ACTIONS.includes(cartAbandonmentRecoveryConf.mainAction)
  ) {
    return false
  }

  if ((cartAbandonmentRecoveryConf?.sessionIdSource || 'select') === 'map') {
    if (!isSessionIdMapped(cartAbandonmentRecoveryConf)) {
      return false
    }
  } else if (!cartAbandonmentRecoveryConf?.sessionId) {
    return false
  }

  if (cartAbandonmentRecoveryConf.mainAction === 'update_cart_status') {
    return !!cartAbandonmentRecoveryConf?.orderStatus
  }

  return true
}
