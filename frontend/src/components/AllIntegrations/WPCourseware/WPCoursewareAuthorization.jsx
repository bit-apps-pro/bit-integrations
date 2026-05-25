import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function WPCoursewareAuthorization({
  wpCoursewareConf,
  setWPCoursewareConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={wpCoursewareConf}
      setConfig={setWPCoursewareConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="WP Courseware"
      tutorialLinks={tutorialLinks?.wpCourseware || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'wp-courseware/wp-courseware.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use WP Courseware integration, make sure the WP Courseware plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
