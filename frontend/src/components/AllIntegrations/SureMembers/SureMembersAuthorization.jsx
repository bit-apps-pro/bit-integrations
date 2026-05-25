import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function SureMembersAuthorization({
  sureMembersConf,
  setSureMembersConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={sureMembersConf}
      setConfig={setSureMembersConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="SureMembers"
      tutorialLinks={tutorialLinks?.sureMembers || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'suremembers/suremembers.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use SureMembers integration, make sure the SureMembers plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
