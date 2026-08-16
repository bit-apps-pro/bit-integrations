import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function DirectoristAuthorization({
  directoristConf,
  setDirectoristConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={directoristConf}
      setConfig={setDirectoristConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Directorist"
      tutorialLinks={tutorialLinks?.directorist || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'ATBDP_VERSION' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Directorist integration, make sure the Directorist plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
