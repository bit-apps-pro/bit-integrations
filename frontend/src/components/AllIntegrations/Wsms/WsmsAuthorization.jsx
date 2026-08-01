import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function WsmsAuthorization({ wsmsConf, setWsmsConf, step, nextPage, isInfo }) {
  return (
    <Authorization
      config={wsmsConf}
      setConfig={setWsmsConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="wsms"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'WP_SMS_VERSION' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use WSMS (WP SMS) integration, make sure the WP SMS plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
