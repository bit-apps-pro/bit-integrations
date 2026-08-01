import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function WpTableBuilderAuthorization({
  wpTableBuilderConf,
  setWpTableBuilderConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage?.(value), [nextPage])

  return (
    <Authorization
      config={wpTableBuilderConf}
      setConfig={setWpTableBuilderConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="WP Table Builder"
      tutorialLinkKey="wpTableBuilder"
      tutorialLinks={tutorialLinks?.wpTableBuilder || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'WPTB_PLUGIN_DIR' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use WP Table Builder integration, make sure the WP Table Builder plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
