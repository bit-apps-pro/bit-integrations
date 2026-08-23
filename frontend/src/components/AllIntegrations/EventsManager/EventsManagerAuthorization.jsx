import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function EventsManagerAuthorization({
  eventsManagerConf,
  setEventsManagerConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={eventsManagerConf}
      setConfig={setEventsManagerConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="eventsManager"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'class', value: 'EM_Events' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use Events Manager integration, make sure the Events Manager plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
