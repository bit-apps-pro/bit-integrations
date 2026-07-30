import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function IvyFormsAuthorization({
  ivyFormsConf,
  setIvyFormsConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={ivyFormsConf}
      setConfig={setIvyFormsConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'class', value: 'IvyForms\\Plugin\\Plugin' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use IvyForms integration, make sure the IvyForms plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
