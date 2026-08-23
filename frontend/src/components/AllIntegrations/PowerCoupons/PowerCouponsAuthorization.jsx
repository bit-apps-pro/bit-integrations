import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function PowerCouponsAuthorization({
  powerCouponsConf,
  setPowerCouponsConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={powerCouponsConf}
      setConfig={setPowerCouponsConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          groups: [
            {
              logic: 'OR',
              checks: [
                { type: 'class', value: 'WooCommerce' },
                { type: 'function', value: 'WC' }
              ]
            },
            {
              logic: 'OR',
              checks: [
                { type: 'constant', value: 'POWER_COUPONS_VERSION' },
                { type: 'function', value: 'power_coupons' },
                { type: 'class', value: '\\Power_Coupons\\Power_Coupons_Loader' }
              ]
            }
          ],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use Power Coupons integration, make sure the Power Coupons for WooCommerce and WooCommerce plugins are installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
