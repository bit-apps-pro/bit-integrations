import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function CreatorLmsAuthorization({
  creatorLmsConf,
  setCreatorLmsConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={creatorLmsConf}
      setConfig={setCreatorLmsConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Creator LMS"
      tutorialLinks={tutorialLinks?.creatorLms || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [
            { type: 'class', value: 'CreatorLms' },
            { type: 'function', value: 'crlms_get_course' }
          ],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use Creator LMS integration, make sure the Creator LMS plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
