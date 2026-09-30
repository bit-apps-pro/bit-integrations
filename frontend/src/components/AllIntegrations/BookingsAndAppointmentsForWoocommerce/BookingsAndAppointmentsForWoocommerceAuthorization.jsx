import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function BookingsAndAppointmentsForWoocommerceAuthorization({
  bookingsAndAppointmentsForWoocommerceConf,
  setBookingsAndAppointmentsForWoocommerceConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])

  return (
    <Authorization
      config={bookingsAndAppointmentsForWoocommerceConf}
      setConfig={setBookingsAndAppointmentsForWoocommerceConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="BookingsAndAppointmentsForWoocommerce"
      tutorialLinks={tutorialLinks?.bookingsAndAppointmentsForWoocommerce || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'PH_BOOKINGS_PLUGIN_FILE' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Bookings and Appointments for WooCommerce integration, make sure the plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
