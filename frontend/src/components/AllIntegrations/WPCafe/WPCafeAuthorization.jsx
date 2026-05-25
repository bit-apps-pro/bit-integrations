import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function WPCafeAuthorization({
  wpcafeConf,
  setWpcafeConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={wpcafeConf}
      setConfig={setWpcafeConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="WPCafe"
      tutorialLinks={tutorialLinks?.wpcafe || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'class', value: 'WpCafe\\Init' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use WPCafe integration, make sure the WPCafe plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
