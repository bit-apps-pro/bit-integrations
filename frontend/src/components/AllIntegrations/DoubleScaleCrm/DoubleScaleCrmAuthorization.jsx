import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function DoubleScaleCrmAuthorization({
  doubleScaleCrmConf,
  setDoubleScaleCrmConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={doubleScaleCrmConf}
      setConfig={setDoubleScaleCrmConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="DoubleScale CRM"
      tutorialLinks={tutorialLinks?.doubleScaleCrm || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'DOUBLESCALE_FREE_PLUGIN_LOADED' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use the DoubleScale CRM integration, install and activate the DoubleScale CRM plugin on your site. Turn on the Contacts, Support, Invoices and Proposals modules that your actions use.',
          'bit-integrations'
        )
      }}
    />
  )
}
