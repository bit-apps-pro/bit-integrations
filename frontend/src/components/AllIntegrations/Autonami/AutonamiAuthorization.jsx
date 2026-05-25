import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function AutonamiAuthorization({
  autonamiConf,
  setAutonamiConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={autonamiConf}
      setConfig={setAutonamiConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="FunnelKit (Autonami)"
      tutorialLinks={tutorialLinks?.autonami || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'class', value: 'BWFCRM_Contact' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use FunnelKit (Autonami) integration, make sure the FunnelKit Automations plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
