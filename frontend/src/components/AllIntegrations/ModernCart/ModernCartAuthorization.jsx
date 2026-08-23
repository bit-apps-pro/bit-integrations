import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function ModernCartAuthorization({
  modernCartConf,
  setModernCartConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={modernCartConf}
      setConfig={setModernCartConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="modernCart"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          groups: [
            {
              logic: 'OR',
              checks: [
                { type: 'constant', value: 'MODERNCART_VER' },
                { type: 'class', value: '\\ModernCart\\Plugin_Loader' }
              ]
            },
            {
              logic: 'OR',
              checks: [
                { type: 'function', value: 'WC' },
                { type: 'class', value: 'WooCommerce' }
              ]
            }
          ],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use Modern Cart integration, make sure the Modern Cart and WooCommerce plugins are installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
