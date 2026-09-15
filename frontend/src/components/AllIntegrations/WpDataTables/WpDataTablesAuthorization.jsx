import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function WpDataTablesAuthorization({
  wpDataTablesConf,
  setWpDataTablesConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      tutorialTitle="wpDataTables"
      tutorialLinks={tutorialLinks?.wpDataTables || {}}
      config={wpDataTablesConf}
      setConfig={setWpDataTablesConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'class', value: 'WDTConfigController' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use wpDataTables integration, make sure the wpDataTables plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
