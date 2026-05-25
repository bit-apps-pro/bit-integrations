import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function LearnDashAuthorization({
  learnDashConf,
  setLearnDashConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={learnDashConf}
      setConfig={setLearnDashConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="LearnDash"
      tutorialLinks={tutorialLinks?.learnDash || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          groups: [
            { logic: 'AND', checks: [{ type: 'plugin_file', value: 'learndash-propanel/learndash_propanel.php' }] },
            { logic: 'AND', checks: [{ type: 'plugin_file', value: 'learndash/learndash.php' }] },
            { logic: 'AND', checks: [{ type: 'plugin_file', value: 'sfwd-lms/sfwd_lms.php' }] }
          ],
          logic: 'OR'
        }
      }}
      noteDetails={{
        note: __(
          'To use LearnDash integration, make sure the LearnDash plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
