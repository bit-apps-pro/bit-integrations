import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function CartAbandonmentRecoveryAuthorization({
  cartAbandonmentRecoveryConf,
  setCartAbandonmentRecoveryConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={cartAbandonmentRecoveryConf}
      setConfig={setCartAbandonmentRecoveryConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="cartAbandonmentRecovery"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'CARTFLOWS_CA_FILE' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use Cart Abandonment Recovery integration, make sure the Cart Abandonment Recovery plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
