import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function AmeliaBookingAuthorization({
  ameliaBookingConf,
  setAmeliaBookingConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={ameliaBookingConf}
      setConfig={setAmeliaBookingConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Amelia Booking"
      tutorialLinks={tutorialLinks?.ameliaBooking || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'AMELIA_PATH' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __('Install and activate the Amelia plugin to use this integration.', 'bit-integrations')
      }}
    />
  )
}
