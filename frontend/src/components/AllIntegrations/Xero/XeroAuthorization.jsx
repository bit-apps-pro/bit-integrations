import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

const developerPortalUrl = 'https://developer.xero.com/app/manage'

const scope = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'accounting.contacts',
  'accounting.settings',
  'accounting.attachments',
  'accounting.invoices',
  'accounting.payments',
  'accounting.banktransactions',
  'accounting.manualjournals'
].join(' ')

const note = `
    <h4>${__('Steps to connect Xero:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open the', 'bit-integrations')} <a href="${developerPortalUrl}" target="_blank" rel="noreferrer">${__(
        'Xero Developer portal',
        'bit-integrations'
      )}</a>.</li>
      <li>${__('Click <b>New app</b> and select <b>Web app</b>.', 'bit-integrations')}</li>
      <li>${__('Copy the <b>Callback / Redirect URL</b> from this form. Add it to the app as a redirect URI.', 'bit-integrations')}</li>
      <li>${__('Open <b>Configuration</b>. Copy the <b>Client ID</b> and generate a <b>Client Secret</b>. Paste both into this form.', 'bit-integrations')}</li>
      <li>${__('Click <b>Authorize</b> and select one organisation. Make one connection for each organisation.', 'bit-integrations')}</li>
    </ul>
  `

export default function XeroAuthorization({ xeroConf, setXeroConf, step, setstep, isInfo }) {
  return (
    <Authorization
      config={xeroConf}
      setConfig={setXeroConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Xero"
      tutorialLinks={tutorialLinks?.xero || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        scope,
        authCodeEndpoint: {
          url: 'https://login.xero.com/identity/connect/authorize'
        },
        tokenEndpoint: {
          url: 'https://identity.xero.com/connect/token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://identity.xero.com/connect/token'
      }}
      noteDetails={{ note }}
    />
  )
}
