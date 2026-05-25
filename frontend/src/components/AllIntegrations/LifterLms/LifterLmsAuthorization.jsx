import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function LifterLmsAuthorization({
  lifterLmsConf,
  setLifterLmsConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={lifterLmsConf}
      setConfig={setLifterLmsConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="LifterLMS"
      tutorialLinks={tutorialLinks?.lifterLms || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'lifterlms/lifterlms.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use LifterLMS integration, make sure the LifterLMS plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
