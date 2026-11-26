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
          checks: [{ type: 'plugin_file', value: 'the-events-calendar/the-events-calendar.php' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'Install and activate The Events Calendar. Register New Attendee also needs Event Tickets. Duplicate Event, Create Recurring Event and the series tasks also need The Events Calendar Pro.',
          'bit-integrations'
        )
      }}
    />
  )
}
