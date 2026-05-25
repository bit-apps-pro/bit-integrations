import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function WooCommerceAuthorization({
  wcConf,
  setWcConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={wcConf}
      setConfig={setWcConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="WooCommerce"
      tutorialLinks={tutorialLinks?.wooCommerce || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'woocommerce/woocommerce.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use WooCommerce integration, make sure the WooCommerce plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
