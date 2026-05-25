import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function ZoomWebinarAuthorization({
  zoomWebinarConf,
  setZoomWebinarConf,
  step,
  setStep,
  isInfo
}) {
  const note = `<h4>${__('Pro or higher plan only .', 'bit-integrations')}</h4>
  <h4>${__('Client Id and Client Secret generate with OAuth .', 'bit-integrations')}</h4>
  <h4>${__('Scope:', 'bit-integrations')}</h4>
  <ul>
      <li>${__("User:<b>'user:master, user:read:admin, user:write:admin'</b> ", 'bit-integrations')}</li>
      <li>${__(
        "Webinar:<b>'webinar:master, webinar:read:admin, webinar:write:admin'</b> ",
        'bit-integrations'
      )}</li>
  </ul>
  <h4>${__("Redirect URIs add also in <b>'Add allow lists'</b>", 'bit-integrations')}</h4>
  <h4>${__('Zoom Settings :', 'bit-integrations')}</h4>
  <ul>
      <li>${__('Registration:<b>Required</b>', 'bit-integrations')}</li>
      <li>${__('Participant:<b>On</b>', 'bit-integrations')}</li>
  </ul>
  `
  return (
    <Authorization
      config={zoomWebinarConf}
      setConfig={setZoomWebinarConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Zoom Webinars"
      tutorialLinks={tutorialLinks?.zoomWebinar || {}}
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
