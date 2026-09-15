import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function BookingPressAuthorization({
  bookingPressConf,
  setBookingPressConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      tutorialTitle="BookingPress"
      tutorialLinks={tutorialLinks?.bookingPress || {}}
      config={bookingPressConf}
      setConfig={setBookingPressConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="bookingPress"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'class', value: 'BookingPress' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use BookingPress integration, make sure the BookingPress plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
