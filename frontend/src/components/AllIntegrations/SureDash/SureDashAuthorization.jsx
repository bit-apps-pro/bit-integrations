import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function SureDashAuthorization({
  sureDashConf,
  setSureDashConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      tutorialTitle="SureDash"
      tutorialLinks={tutorialLinks?.sureDash || {}}
      config={sureDashConf}
      setConfig={setSureDashConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'SUREDASHBOARD_POST_TYPE' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use SureDash integration, make sure the SureDash plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
