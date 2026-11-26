import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function BitConnectAuthorization({
  bitConnectConf,
  setBitConnectConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])

  return (
    <Authorization
      config={bitConnectConf}
      setConfig={setBitConnectConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Bit Connect"
      tutorialLinks={tutorialLinks?.bitConnect || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'class', value: 'BitApps\\BitConnectPro\\Integrations\\Actions' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'Install and activate Bit Connect and Bit Connect Pro. The actions also need an active Bit Connect Pro licence.',
          'bit-integrations'
        )
      }}
    />
  )
}
