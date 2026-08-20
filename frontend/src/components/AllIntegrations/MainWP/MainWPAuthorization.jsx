import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function MainWPAuthorization({ mainWPConf, setMainWPConf, step, nextPage, isInfo }) {
  return (
    <Authorization
      config={mainWPConf}
      setConfig={setMainWPConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="mainWP"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'class', value: 'MainWP\\Dashboard\\MainWP_DB' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use MainWP integration, make sure the MainWP Dashboard plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
