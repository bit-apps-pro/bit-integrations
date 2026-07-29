import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function BuddyBossAuthorization({
  buddyBossConf,
  setBuddyBossConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={buddyBossConf}
      setConfig={setBuddyBossConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="BuddyBoss"
      tutorialLinks={tutorialLinks?.buddyBoss || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'class', value: 'BuddyPress' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use BuddyBoss integration, make sure the BuddyBoss plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
