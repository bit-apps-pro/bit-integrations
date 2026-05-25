import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function SeoPressAuthorization({
  seoPressConf,
  setSeoPressConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])

  return (
    <Authorization
      config={seoPressConf}
      setConfig={setSeoPressConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="SEOPress"
      tutorialLinks={tutorialLinks?.seoPress || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'SEOPRESS_VERSION' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use SEOPress integration, make sure the SEOPress plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
