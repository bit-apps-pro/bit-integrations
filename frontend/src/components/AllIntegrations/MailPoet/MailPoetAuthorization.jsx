import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function MailPoetAuthorization({
  mailPoetConf,
  setMailPoetConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={mailPoetConf}
      setConfig={setMailPoetConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="MailPoet"
      tutorialLinks={tutorialLinks?.mailPoet || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'class', value: 'MailPoet\\API\\API' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use MailPoet integration, make sure the MailPoet plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
