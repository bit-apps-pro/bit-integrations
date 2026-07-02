import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function TheEventsCalendarAuthorization({
  theEventsCalendarConf,
  setTheEventsCalendarConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={theEventsCalendarConf}
      setConfig={setTheEventsCalendarConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="The Events Calendar"
      tutorialLinks={tutorialLinks?.theEventsCalendar || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [
            { type: 'plugin_file', value: 'the-events-calendar/the-events-calendar.php' },
            { type: 'plugin_file', value: 'event-tickets/event-tickets.php' }
          ],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use The Events Calendar integration, make sure the The Events Calendar and Event Tickets plugins are installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
