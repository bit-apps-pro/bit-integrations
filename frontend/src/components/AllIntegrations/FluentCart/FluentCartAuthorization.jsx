import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function FluentCartAuthorization({
  fluentCartConf,
  setFluentCartConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={fluentCartConf}
      setConfig={setFluentCartConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="FluentCart"
      tutorialLinks={tutorialLinks?.fluentCart || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'FLUENTCART_PLUGIN_PATH' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use FluentCart integration, make sure the FluentCart plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
