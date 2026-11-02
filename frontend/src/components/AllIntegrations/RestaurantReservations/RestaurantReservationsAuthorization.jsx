import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function RestaurantReservationsAuthorization({
  restaurantReservationsConf,
  setRestaurantReservationsConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={restaurantReservationsConf}
      setConfig={setRestaurantReservationsConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Five Star Restaurant Reservations"
      tutorialLinks={tutorialLinks?.restaurantReservations || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'RTB_VERSION' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use this integration, install and activate the Five Star Restaurant Reservations plugin on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
