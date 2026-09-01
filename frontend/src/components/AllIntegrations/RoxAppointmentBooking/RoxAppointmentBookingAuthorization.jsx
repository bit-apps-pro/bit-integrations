import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function RoxAppointmentBookingAuthorization({
  roxAppointmentBookingConf,
  setRoxAppointmentBookingConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])

  return (
    <Authorization
      config={roxAppointmentBookingConf}
      setConfig={setRoxAppointmentBookingConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Rox Appointment Booking"
      tutorialLinks={tutorialLinks?.roxAppointmentBooking || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'ROX_APPOINTMENT_BOOKING_VERSION' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use the Rox Appointment Booking integration, make sure the Rox Appointment Booking plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
