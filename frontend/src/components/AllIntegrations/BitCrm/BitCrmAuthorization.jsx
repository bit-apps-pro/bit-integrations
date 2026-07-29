import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function BitCrmAuthorization({ bitCrmConf, setBitCrmConf, step, nextPage, isInfo }) {
  const setStep = useCallback(value => nextPage?.(value), [nextPage])

  return (
    <Authorization
      config={bitCrmConf}
      setConfig={setBitCrmConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Bit CRM"
      tutorialLinkKey="bitCrm"
      tutorialLinks={tutorialLinks?.bitCrm || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'class', value: 'BitApps\\Crm\\Config' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Bit CRM integration, make sure the Bit CRM plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
