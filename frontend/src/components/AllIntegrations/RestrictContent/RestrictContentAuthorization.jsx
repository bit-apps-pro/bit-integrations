import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllLevels } from './RestrictContentCommonFunc'

export default function RestrictContentAuthorization({
  restrictConf,
  setRestrictConf,
  step,
  setStep,
  isInfo,
  setIsLoading
}) {
  const handleSetStep = useCallback(value => {
    if (value === 2) {
      getAllLevels(restrictConf, setRestrictConf, setIsLoading)
    }
    setStep(value)
  }, [setStep, restrictConf, setRestrictConf, setIsLoading])

  return (
    <Authorization
      config={restrictConf}
      setConfig={setRestrictConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Restrict Content"
      tutorialLinks={tutorialLinks?.restrictContent || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          groups: [
            { logic: 'AND', checks: [{ type: 'plugin_file', value: 'restrict-content-pro/restrict-content-pro.php' }] },
            { logic: 'AND', checks: [{ type: 'plugin_file', value: 'restrict-content/restrictcontent.php' }] }
          ],
          logic: 'OR'
        }
      }}
      noteDetails={{
        note: __(
          'To use Restrict Content integration, make sure the Restrict Content plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
