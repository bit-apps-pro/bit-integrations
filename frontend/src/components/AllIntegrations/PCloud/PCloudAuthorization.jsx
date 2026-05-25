import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function PCloudAuthorization({
  pCloudConf,
  setPCloudConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('PCloud OAuth setup', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Create an app from PCloud API apps.', 'bit-integrations')}</li>
      <li>${__('Set the redirect URI exactly as shown below.', 'bit-integrations')}</li>
      <li>${__('Use your app Client ID and Client Secret to authorize.', 'bit-integrations')}</li>
    </ul>
  `

  return (
    <Authorization
      config={pCloudConf}
      setConfig={setPCloudConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="pCloud"
      tutorialLinks={tutorialLinks?.pCloud || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        authCodeEndpoint: {
          url: 'https://my.pcloud.com/oauth2/authorize'
        },
        tokenEndpoint: {
          url: 'https://api.pcloud.com/oauth2_token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://api.pcloud.com/oauth2_token'
      }}
      noteDetails={{ note }}
    />
  )
}
