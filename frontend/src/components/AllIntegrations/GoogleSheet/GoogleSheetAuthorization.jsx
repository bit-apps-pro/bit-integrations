import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function GoogleSheetAuthorization({ sheetConf, setSheetConf, step, setstep, isInfo }) {
  const note = `
    <h4>${__('Google Sheets OAuth setup', 'bit-integrations')}</h4>
    <p>${__('Click Authorize and sign in to Google. No API credentials are needed.', 'bit-integrations')}</p>
    <p>${__('In the next step, choose the spreadsheets this integration can use from Google Drive.', 'bit-integrations')}</p>
    <h4>${__('Using your own Google Cloud app', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Visit', 'bit-integrations')} <a href="https://console.developers.google.com/apis/credentials" target="_blank" rel="noreferrer">${__('Google API Console', 'bit-integrations')}</a> ${__('to get your credentials.', 'bit-integrations')}</li>
      <li>${__('Create OAuth client in Google API Console.', 'bit-integrations')}</li>
      <li>${__('Set homepage and redirect URI exactly from integration settings.', 'bit-integrations')}</li>
      <li>${__('Enable Google Drive API and authorize with required scope.', 'bit-integrations')}</li>
    </ul>
  `

  return (
    <Authorization
      config={sheetConf}
      setConfig={setSheetConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Google Sheets"
      tutorialLinks={tutorialLinks?.googleSheet || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        oneClick: {
          app: 'google',
          scope: 'https://www.googleapis.com/auth/drive.file',
          label: __('One-click: only spreadsheets you choose', 'bit-integrations'),
          hint: __(
            'Sign in with Google, no setup needed. Pick spreadsheets from Google Drive in the next step.',
            'bit-integrations'
          ),
          customLabel: __('Your own Google app: full Drive access', 'bit-integrations'),
          customHint: __(
            'Lists every spreadsheet in your Drive. Needs an OAuth client from your Google Cloud project.',
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
            scope: 'https://www.googleapis.com/auth/drive'
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
