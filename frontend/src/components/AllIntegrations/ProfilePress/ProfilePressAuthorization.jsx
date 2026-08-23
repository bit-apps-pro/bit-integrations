import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function ProfilePressAuthorization({
  profilePressConf,
  setProfilePressConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={profilePressConf}
      setConfig={setProfilePressConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="profilePress"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'PPRESS_VERSION_NUMBER' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use ProfilePress integration, make sure the ProfilePress plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
