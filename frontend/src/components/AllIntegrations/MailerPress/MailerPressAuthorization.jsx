import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function MailerPressAuthorization({
  mailerPressConf,
  setMailerPressConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={mailerPressConf}
      setConfig={setMailerPressConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="MailerPress"
      tutorialLinks={tutorialLinks?.mailerPress || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'class', value: 'MailerPress\\Core\\Kernel' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use MailerPress integration, make sure the MailerPress plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
