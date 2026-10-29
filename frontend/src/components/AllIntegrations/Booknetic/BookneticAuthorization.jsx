import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function BookneticAuthorization({
  bookneticConf,
  setBookneticConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={bookneticConf}
      setConfig={setBookneticConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Booknetic"
      tutorialLinks={tutorialLinks?.booknetic || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'class', value: 'BookneticApp\\Providers\\Core\\Bootstrap' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use the Booknetic integration, install and activate the Booknetic plugin on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
