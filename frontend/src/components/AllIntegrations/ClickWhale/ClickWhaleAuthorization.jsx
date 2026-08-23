import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function ClickWhaleAuthorization({
  clickWhaleConf,
  setClickWhaleConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={clickWhaleConf}
      setConfig={setClickWhaleConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="clickWhale"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'CLICKWHALE_VERSION' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use ClickWhale integration, make sure the ClickWhale plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
