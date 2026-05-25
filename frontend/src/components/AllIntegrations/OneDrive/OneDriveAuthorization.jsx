import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function OneDriveAuthorization({
  oneDriveConf,
  setOneDriveConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('OneDrive OAuth setup', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Create app in Azure Portal and add redirect URI from integration settings.', 'bit-integrations')}</li>
      <li>${__('Use delegated permissions for OneDrive read/write with offline access.', 'bit-integrations')}</li>
    </ul>
  `

  return (
    <Authorization
      config={oneDriveConf}
      setConfig={setOneDriveConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="OneDrive"
      tutorialLinks={tutorialLinks?.oneDrive || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        authCodeEndpoint: {
          url: 'https://login.live.com/oauth20_authorize.srf',
          queryParams: {
            scope: 'onedrive.readwrite offline_access Files.ReadWrite.All'
          }
        },
        tokenEndpoint: {
          url: 'https://login.live.com/oauth20_token.srf',
          method: 'POST'
        },
        refreshTokenUrl: 'https://login.live.com/oauth20_token.srf'
      }}
      noteDetails={{ note }}
    />
  )
}
