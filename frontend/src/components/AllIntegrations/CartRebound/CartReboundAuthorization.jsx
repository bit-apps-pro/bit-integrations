import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function CartReboundAuthorization({
  cartReboundConf,
  setCartReboundConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={cartReboundConf}
      setConfig={setCartReboundConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Cart Rebound"
      tutorialLinks={tutorialLinks?.cartRebound || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'CART_REBOUND_VERSION' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use this integration, install and activate the Cart Rebound plugin on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
