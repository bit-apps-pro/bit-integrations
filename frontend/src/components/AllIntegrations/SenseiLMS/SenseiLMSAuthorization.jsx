import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function SenseiLMSAuthorization({
  senseiLMSConf,
  setSenseiLMSConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage?.(value), [nextPage])

  return (
    <Authorization
      config={senseiLMSConf}
      setConfig={setSenseiLMSConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Sensei LMS"
      tutorialLinkKey="senseiLMS"
      tutorialLinks={tutorialLinks?.senseiLMS || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'class', value: 'Sensei_Main' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Sensei LMS integration, make sure the Sensei LMS plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
