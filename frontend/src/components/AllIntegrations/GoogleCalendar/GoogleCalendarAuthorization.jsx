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
    <p>${__('Click Authorize and sign in to Google. No API credentials are needed.', 'bit-integrations')}</p>
    <h4>${__('Using your own Google Cloud app', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Visit', 'bit-integrations')} <a href="https://console.developers.google.com/apis/credentials" target="_blank" rel="noreferrer">${__('Google API Console', 'bit-integrations')}</a> ${__('to get your credentials.', 'bit-integrations')}</li>
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
        oneClick: {
          app: 'google',
          scope: 'https://www.googleapis.com/auth/calendar',
          label: __('One-click: sign in with Google', 'bit-integrations'),
          hint: __('No setup needed. Sign in and allow access to your calendars.', 'bit-integrations'),
          customLabel: __('Your own Google app', 'bit-integrations'),
          customHint: __(
            'Needs an OAuth client from your Google Cloud project with the Google Calendar API enabled.',
            'bit-integrations'
          )
        },
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
