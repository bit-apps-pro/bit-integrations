import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function LionDeskAuthorization({
  lionDeskConf,
  setLionDeskConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('Get Redirect URI, Client ID and Client Secret', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Go to LionDesk Developer Center Apps.', 'bit-integrations')}</li>
      <li>${__('Create a new app and set redirect URI from this form.', 'bit-integrations')}</li>
      <li>${__('Copy client ID and client secret from LionDesk app.', 'bit-integrations')}</li>
      <li>${__('Authorize to complete connection.', 'bit-integrations')}</li>
    </ul>
  `

  return (
    <Authorization
      config={lionDeskConf}
      setConfig={setLionDeskConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="LionDesk"
      tutorialLinks={tutorialLinks?.lionDesk || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        authCodeEndpoint: {
          url: 'https://api-v2.liondesk.com/oauth2/authorize',
          queryParams: {
            scope: 'write read'
          }
        },
        tokenEndpoint: {
          url: 'https://api-v2.liondesk.com/oauth2/token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://api-v2.liondesk.com/oauth2/token'
      }}
      noteDetails={{ note }}
    />
  )
}
