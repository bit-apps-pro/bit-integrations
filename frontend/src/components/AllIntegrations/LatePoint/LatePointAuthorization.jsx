import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function LatePointAuthorization({
  latePointConf,
  setLatePointConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={latePointConf}
      setConfig={setLatePointConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="latePoint"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'class', value: 'LatePoint' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use LatePoint integration, make sure the LatePoint plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
