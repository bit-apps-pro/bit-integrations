import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function SliceWpAuthorization({
  sliceWpConf,
  setSliceWpConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={sliceWpConf}
      setConfig={setSliceWpConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="SliceWP"
      tutorialLinks={tutorialLinks?.sliceWp || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'slicewp/index.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use SliceWP integration, make sure the SliceWP plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
