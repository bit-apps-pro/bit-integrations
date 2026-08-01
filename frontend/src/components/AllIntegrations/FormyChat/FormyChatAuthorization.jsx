import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function FormyChatAuthorization({
  formyChatConf,
  setFormyChatConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={formyChatConf}
      setConfig={setFormyChatConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'FORMYCHAT_VERSION' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use FormyChat integration, make sure the FormyChat plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
