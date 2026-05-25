import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function GiveWpAuthorization({
  giveWpConf,
  setGiveWpConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={giveWpConf}
      setConfig={setGiveWpConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="GiveWP"
      tutorialLinks={tutorialLinks?.giveWp || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'give/give.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use GiveWP integration, make sure the GiveWP plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
