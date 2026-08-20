import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function FluentPlayerAuthorization({
  fluentPlayerConf,
  setFluentPlayerConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={fluentPlayerConf}
      setConfig={setFluentPlayerConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="fluentPlayer"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'FLUENT_PLAYER' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use FluentPlayer integration, make sure the FluentPlayer plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
