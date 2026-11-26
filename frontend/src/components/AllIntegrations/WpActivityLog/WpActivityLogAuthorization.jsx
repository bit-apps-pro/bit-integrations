import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function WpActivityLogAuthorization({
  wpActivityLogConf,
  setWpActivityLogConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={wpActivityLogConf}
      setConfig={setWpActivityLogConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="WP Activity Log"
      tutorialLinks={tutorialLinks?.wpActivityLog || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'WSAL_VERSION' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use the WP Activity Log integration, install and activate the WP Activity Log plugin on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
