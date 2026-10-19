import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function ElementsKitAuthorization({
  elementsKitConf,
  setElementsKitConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={elementsKitConf}
      setConfig={setElementsKitConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="ElementsKit"
      tutorialLinks={tutorialLinks?.elementsKit || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        // ElementsKit Lite defines no plugin constant, so its main class is the marker.
        pluginCheck: { checks: [{ type: 'class', value: 'ElementsKit_Lite' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use ElementsKit integration, make sure the ElementsKit Lite plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
