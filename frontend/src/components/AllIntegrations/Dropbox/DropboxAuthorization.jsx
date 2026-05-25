import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function DropboxAuthorization({
  dropboxConf,
  setDropboxConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('Dropbox OAuth setup', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Create app in Dropbox API Console.', 'bit-integrations')}</li>
      <li>${__('Add redirect URI from integration settings and keep offline token access enabled.', 'bit-integrations')}</li>
    </ul>
  `

  return (
    <Authorization
      config={dropboxConf}
      setConfig={setDropboxConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Dropbox"
      tutorialLinks={tutorialLinks?.dropbox || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        authCodeEndpoint: {
          url: 'https://www.dropbox.com/oauth2/authorize',
          queryParams: {
            token_access_type: 'offline'
          }
        },
        tokenEndpoint: {
          url: 'https://api.dropboxapi.com/oauth2/token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://api.dropboxapi.com/oauth2/token'
      }}
      noteDetails={{ note }}
    />
  )
}
