import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function NinjaTablesAuthorization({
  ninjaTablesConf,
  setNinjaTablesConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])

  return (
    <Authorization
      config={ninjaTablesConf}
      setConfig={setNinjaTablesConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle={__('NinjaTables', 'bit-integrations')}
      tutorialLinks={tutorialLinks?.ninjaTables || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'NINJA_TABLES_VERSION' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'Please make sure Ninja Tables plugin is installed and activated on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
