import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function SalonBookingSystemAuthorization({
  salonBookingSystemConf,
  setSalonBookingSystemConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={salonBookingSystemConf}
      setConfig={setSalonBookingSystemConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Salon Booking System"
      tutorialLinks={tutorialLinks?.salonBookingSystem || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'SLN_VERSION' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use this integration, install and activate the Salon Booking System plugin on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
