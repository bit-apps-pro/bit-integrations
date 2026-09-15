import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function PointicsAuthorization({
  pointicsConf,
  setPointicsConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={pointicsConf}
      setConfig={setPointicsConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Pointics"
      tutorialLinks={tutorialLinks?.pointics || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'POINTICS_VERSION' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Pointics integration, make sure the Pointics plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
