import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function NiroHelpAuthorization({
  niroHelpConf,
  setNiroHelpConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={niroHelpConf}
      setConfig={setNiroHelpConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="NiroHelp"
      tutorialLinks={tutorialLinks?.niroHelp || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'NIROHELP_VERSION' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __('Install and activate the NiroHelp plugin to use this integration.', 'bit-integrations')
      }}
    />
  )
}
