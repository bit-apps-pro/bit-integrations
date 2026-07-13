import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function SecureCustomFieldsAuthorization({
  secureCustomFieldsConf,
  setSecureCustomFieldsConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={secureCustomFieldsConf}
      setConfig={setSecureCustomFieldsConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          groups: [
            {
              logic: 'AND',
              checks: [
                {
                  type: 'constant',
                  value: 'ACF_BASENAME',
                  expected: 'secure-custom-fields/secure-custom-fields.php'
                }
              ]
            },
            {
              logic: 'AND',
              checks: [{ type: 'plugin_file', value: 'secure-custom-fields/secure-custom-fields.php' }]
            }
          ],
          logic: 'OR'
        }
      }}
      noteDetails={{
        note: __(
          'To use Secure Custom Fields integration, make sure the Secure Custom Fields plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
