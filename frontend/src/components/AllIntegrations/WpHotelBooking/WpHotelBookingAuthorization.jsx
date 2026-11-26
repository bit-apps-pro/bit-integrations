import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function WpHotelBookingAuthorization({
  wpHotelBookingConf,
  setWpHotelBookingConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={wpHotelBookingConf}
      setConfig={setWpHotelBookingConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="wpHotelBooking"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'WPHB_VERSION' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'Install and activate the WP Hotel Booking plugin to use this integration.',
          'bit-integrations'
        )
      }}
    />
  )
}
