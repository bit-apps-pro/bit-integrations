import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function GoogleCalendarAuthorization({
  googleCalendarConf,
  setGoogleCalendarConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('Google Calendar OAuth setup', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Create OAuth client in Google API Console.', 'bit-integrations')}</li>
      <li>${__('Set homepage and redirect URI exactly from integration settings.', 'bit-integrations')}</li>
      <li>${__('Enable Google Calendar API and authorize with required scope.', 'bit-integrations')}</li>
    </ul>
  `

  return (
    <Authorization
      config={googleCalendarConf}
      setConfig={setGoogleCalendarConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Google Calendar"
      tutorialLinks={tutorialLinks?.googleCalendar || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        authCodeEndpoint: {
          url: 'https://accounts.google.com/o/oauth2/v2/auth',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'https://www.googleapis.com/auth/calendar'
          }
        },
        tokenEndpoint: {
          url: 'https://oauth2.googleapis.com/token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://oauth2.googleapis.com/token'
      }}
      noteDetails={{ note }}
    />
  )
}
