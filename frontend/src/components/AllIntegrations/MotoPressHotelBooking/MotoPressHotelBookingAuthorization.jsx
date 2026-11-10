import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function MotoPressHotelBookingAuthorization({
  motoPressHotelBookingConf,
  setMotoPressHotelBookingConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={motoPressHotelBookingConf}
      setConfig={setMotoPressHotelBookingConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="MotoPress Hotel Booking"
      tutorialLinks={tutorialLinks?.motoPressHotelBooking || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'function', value: 'MPHB' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use this integration, install and activate the MotoPress Hotel Booking plugin on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
