import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function TutorLmsAuthorization({
  tutorlmsConf,
  setTutorlmsConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={tutorlmsConf}
      setConfig={setTutorlmsConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Tutor LMS"
      tutorialLinks={tutorialLinks?.tutorlms || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'tutor/tutor.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Tutor LMS integration, make sure the Tutor LMS plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
