import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function BooklyAuthorization({ booklyConf, setBooklyConf, step, nextPage, isInfo }) {
  return (
    <Authorization
      config={booklyConf}
      setConfig={setBooklyConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="bookly"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'class', value: 'Bookly\\Lib\\Entities\\Appointment' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use Bookly integration, make sure the Bookly plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
