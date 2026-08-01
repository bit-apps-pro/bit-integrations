import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function WebbaBookingAuthorization({
  webbaBookingConf,
  setWebbaBookingConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={webbaBookingConf}
      setConfig={setWebbaBookingConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="webbaBooking"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'class', value: 'WBK_Booking_Factory' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use Webba Booking integration, make sure the Webba Booking plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
