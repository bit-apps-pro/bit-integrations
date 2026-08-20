import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function BadgeOSAuthorization({ badgeOSConf, setBadgeOSConf, step, nextPage, isInfo }) {
  return (
    <Authorization
      config={badgeOSConf}
      setConfig={setBadgeOSConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="badgeOS"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'class', value: 'BadgeOS' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use BadgeOS integration, make sure the BadgeOS plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
