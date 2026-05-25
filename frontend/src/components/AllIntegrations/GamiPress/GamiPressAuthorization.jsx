import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function GamiPressAuthorization({
  gamiPressConf,
  setGamiPressConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={gamiPressConf}
      setConfig={setGamiPressConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="GamiPress"
      tutorialLinks={tutorialLinks?.gamiPress || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'gamipress/gamipress.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use GamiPress integration, make sure the GamiPress plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
