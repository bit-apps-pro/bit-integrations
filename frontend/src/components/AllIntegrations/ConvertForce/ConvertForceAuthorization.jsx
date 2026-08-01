import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function ConvertForceAuthorization({
  convertForceConf,
  setConvertForceConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage?.(value), [nextPage])

  return (
    <Authorization
      config={convertForceConf}
      setConfig={setConvertForceConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="ConvertForce Popup Builder"
      tutorialLinkKey="convertForce"
      tutorialLinks={tutorialLinks?.convertForce || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'CONVERTFORCE_VERSION' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use ConvertForce Popup Builder integration, make sure the ConvertForce Popup Builder plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
