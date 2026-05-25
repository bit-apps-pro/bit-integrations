import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function PeepSoAuthorization({
  peepSoConf,
  setPeepSoConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={peepSoConf}
      setConfig={setPeepSoConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="PeepSo"
      tutorialLinks={tutorialLinks?.peepSo || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'class', value: 'PeepSo' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use PeepSo integration, make sure the PeepSo plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
