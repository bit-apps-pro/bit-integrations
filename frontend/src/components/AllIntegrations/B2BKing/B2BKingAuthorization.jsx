import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function B2BKingAuthorization({ b2bKingConf, setB2BKingConf, step, nextPage, isInfo }) {
  return (
    <Authorization
      config={b2bKingConf}
      setConfig={setB2BKingConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'B2BKINGCORE_DIR' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use B2BKing integration, make sure the B2BKing plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
