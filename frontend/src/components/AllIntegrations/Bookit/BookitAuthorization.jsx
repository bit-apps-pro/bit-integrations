import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function BookitAuthorization({ bookitConf, setBookitConf, step, nextPage, isInfo }) {
  return (
    <Authorization
      config={bookitConf}
      setConfig={setBookitConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="bookit"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'BOOKIT_VERSION' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __('Install and activate the Bookit plugin to use this integration.', 'bit-integrations')
      }}
    />
  )
}
