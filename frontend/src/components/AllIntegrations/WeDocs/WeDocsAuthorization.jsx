import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function WeDocsAuthorization({
  weDocsConf,
  setWeDocsConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])

  return (
    <Authorization
      config={weDocsConf}
      setConfig={setWeDocsConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="weDocs"
      tutorialLinks={tutorialLinks?.weDocs || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'class', value: 'WeDocs' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use weDocs integration, make sure the weDocs plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
