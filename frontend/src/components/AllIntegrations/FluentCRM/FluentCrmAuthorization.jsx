import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function FluentCrmAuthorization({
  fluentCrmConf,
  setFluentCrmConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={fluentCrmConf}
      setConfig={setFluentCrmConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="FluentCRM"
      tutorialLinks={tutorialLinks?.fluentCrm || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'fluent-crm/fluent-crm.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use FluentCRM integration, make sure the FluentCRM plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
