import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function WordPressAuthorization({
  wordPressConf,
  setWordPressConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={wordPressConf}
      setConfig={setWordPressConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'ABSPATH' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __('This integration performs actions on the current WordPress site.', 'bit-integrations')
      }}
    />
  )
}
