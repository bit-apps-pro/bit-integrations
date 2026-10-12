import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function ZoomAuthorization({ zoomConf, setZoomConf, step, setStep, isInfo }) {
  const note = `<h4>${__('Requires a Zoom Pro plan or higher.', 'bit-integrations')}</h4>
  <ul>
      <li>${__('Visit', 'bit-integrations')} <a href="https://marketplace.zoom.us/develop/create" target="_blank" rel="noreferrer">${__('Zoom App Marketplace', 'bit-integrations')}</a>, ${__('build a General App (OAuth) and copy its Client ID and Client Secret here.', 'bit-integrations')}</li>
      <li>${__('Add the Callback / Redirect URL above as the OAuth Redirect URL and to the OAuth Allow List.', 'bit-integrations')}</li>
      <li>${__('Create User and Delete User need an Admin-managed app. A User-managed app works for the attendee actions.', 'bit-integrations')}</li>
  </ul>
  <h4>${__('Scopes:', 'bit-integrations')}</h4>
  <ul>
      <li>${__('Attendee actions:', 'bit-integrations')} <b>meeting:read:list_meetings, meeting:read:list_registration_questions, meeting:write:registrant, meeting:read:list_registrants, meeting:delete:registrant</b></li>
      <li>${__('User actions:', 'bit-integrations')} <b>user:write:user:admin, user:read:list_users:admin, user:delete:user:admin</b></li>
      <li>${__('In an Admin-managed app, choose the attendee scopes that end in :admin.', 'bit-integrations')}</li>
  </ul>
  <h4>${__('Zoom meeting settings:', 'bit-integrations')}</h4>
  <ul>
      <li>${__('Registration:', 'bit-integrations')} <b>${__('Required', 'bit-integrations')}</b></li>
      <li>${__('Create User and Delete User do not use the meeting, but one must still be selected.', 'bit-integrations')}</li>
  </ul>
  `
  return (
    <Authorization
      config={zoomConf}
      setConfig={setZoomConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Zoom Meeting"
      tutorialLinks={tutorialLinks?.zoomMeeting || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'header',
        authCodeEndpoint: {
          url: 'https://zoom.us/oauth/authorize'
        },
        tokenEndpoint: {
          url: 'https://zoom.us/oauth/token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://zoom.us/oauth/token'
      }}
      noteDetails={{ note }}
    />
  )
}
