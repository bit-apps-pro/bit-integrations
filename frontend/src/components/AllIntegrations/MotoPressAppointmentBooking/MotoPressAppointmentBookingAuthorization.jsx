import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function MotoPressAppointmentBookingAuthorization({
  motoPressAppointmentBookingConf,
  setMotoPressAppointmentBookingConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={motoPressAppointmentBookingConf}
      setConfig={setMotoPressAppointmentBookingConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="MotoPress Appointment Booking"
      tutorialLinks={tutorialLinks?.motoPressAppointmentBooking || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'function', value: 'mpapp' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use this integration, install and activate the MotoPress Appointment Booking plugin on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
