import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function MailsterAuthorization({
  mailsterConf,
  setMailsterConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={mailsterConf}
      setConfig={setMailsterConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Mailster"
      tutorialLinks={tutorialLinks?.mailster || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'mailster/mailster.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Mailster integration, make sure the Mailster plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
