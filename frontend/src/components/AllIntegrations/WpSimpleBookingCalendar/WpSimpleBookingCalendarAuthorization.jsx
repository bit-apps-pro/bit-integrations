import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function WpSimpleBookingCalendarAuthorization({
  wpSimpleBookingCalendarConf,
  setWpSimpleBookingCalendarConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={wpSimpleBookingCalendarConf}
      setConfig={setWpSimpleBookingCalendarConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="wpSimpleBookingCalendar"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'function', value: 'wpsbc_get_calendar' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use WP Simple Booking Calendar integration, make sure the WP Simple Booking Calendar plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
