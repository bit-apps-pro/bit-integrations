import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

const developerPortalUrl = 'https://my.freshbooks.com/#/developer'
const note = `
    <h4>${__('Steps to connect FreshBooks:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open the', 'bit-integrations')} <a href=${developerPortalUrl} target="_blank" rel="noreferrer">${__(
        'FreshBooks developer portal',
        'bit-integrations'
      )}</a>.</li>
      <li>${__('Create an app.', 'bit-integrations')}</li>
      <li>${__('Select the read and write scopes for the data that your actions use, for example <b>user:invoices:write</b>.', 'bit-integrations')}</li>
      <li>${__('Copy the <b>Client ID</b> and the <b>Client Secret</b> of the app into this form.', 'bit-integrations')}</li>
      <li>${__('Copy the <b>Callback / Redirect URL</b> from this form. Add it to the app as a redirect URI. FreshBooks accepts only HTTPS URLs.', 'bit-integrations')}</li>
      <li>${__('Click <b>Authorize</b>.', 'bit-integrations')}</li>
      <li>${__('If you change the scopes of the app, authorize again.', 'bit-integrations')}</li>
    </ul>
  `

export default function FreshBooksAuthorization({
  freshBooksConf,
  setFreshBooksConf,
  step,
  setstep,
  isInfo
}) {
  return (
    <Authorization
      config={freshBooksConf}
      setConfig={setFreshBooksConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="FreshBooks"
      tutorialLinks={tutorialLinks?.freshBooks || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        authCodeEndpoint: {
          url: 'https://auth.freshbooks.com/oauth/authorize'
        },
        tokenEndpoint: {
          url: 'https://api.freshbooks.com/auth/oauth/token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://api.freshbooks.com/auth/oauth/token'
      }}
      noteDetails={{ note }}
    />
  )
}
