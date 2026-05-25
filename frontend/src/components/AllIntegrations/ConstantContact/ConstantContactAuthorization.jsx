import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function ConstantContactAuthorization({
  constantContactConf,
  setConstantContactConf,
  step,
  setstep,
  isInfo
}) {
  const note = `
  <h4>${__('Steps to get Client ID and Client Secret', 'bit-integrations')}</h4>
  <ul>
    <li>${__(
      'Go to Constant Contact developer portal and create app.',
      'bit-integrations'
    )}</li>
    <li>${__(
      'Enable Authorization Code flow and refresh token support.',
      'bit-integrations'
    )}</li>
    <li>${__(
      'Copy redirect URI from this form and add it to app configuration.',
      'bit-integrations'
    )}</li>
    <li>${__('Copy client ID and client secret, then click Authorize.', 'bit-integrations')}</li>
  </ul>
`

  return (
    <Authorization
      config={constantContactConf}
      setConfig={setConstantContactConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Constant Contact"
      tutorialLinks={tutorialLinks?.constantContact || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'header',
        authCodeEndpoint: {
          url: 'https://authz.constantcontact.com/oauth2/default/v1/authorize',
          queryParams: {
            scope: 'account_read account_update contact_data offline_access campaign_data'
          }
        },
        tokenEndpoint: {
          url: 'https://authz.constantcontact.com/oauth2/default/v1/token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://authz.constantcontact.com/oauth2/default/v1/token'
      }}
      noteDetails={{ note }}
    />
  )
}
