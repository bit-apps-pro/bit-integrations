import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function BookingCalendarAuthorization({
  bookingCalendarConf,
  setBookingCalendarConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage?.(value), [nextPage])

  return (
    <Authorization
      config={bookingCalendarConf}
      setConfig={setBookingCalendarConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Booking Calendar"
      tutorialLinkKey="bookingCalendar"
      tutorialLinks={tutorialLinks?.bookingCalendar || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        // Free and pro builds expose different markers, so any one of these is enough.
        pluginCheck: {
          checks: [
            { type: 'constant', value: 'WP_BK_VERSION_NUM' },
            { type: 'constant', value: 'WPBC_FILE' },
            { type: 'function', value: 'wpbc_api_booking_add_new' }
          ],
          logic: 'OR'
        }
      }}
      noteDetails={{
        note: __(
          'To use Booking Calendar integration, make sure the Booking Calendar plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
