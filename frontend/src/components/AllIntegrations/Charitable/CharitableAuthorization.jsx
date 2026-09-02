import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function CharitableAuthorization({
  charitableConf,
  setCharitableConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={charitableConf}
      setConfig={setCharitableConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Charitable"
      tutorialLinks={tutorialLinks?.charitable || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'class', value: 'Charitable' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Charitable integration, make sure the Charitable plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
