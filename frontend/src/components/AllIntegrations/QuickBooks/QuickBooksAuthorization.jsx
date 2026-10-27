import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

const developerPortalUrl = 'https://developer.intuit.com/app/developer/dashboard'
const note = `
    <h4>${__('Steps to connect QuickBooks:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open the', 'bit-integrations')} <a href=${developerPortalUrl} target="_blank" rel="noreferrer">${__(
        'Intuit Developer portal',
        'bit-integrations'
      )}</a>.</li>
      <li>${__('Create an app and select the <b>com.intuit.quickbooks.accounting</b> scope.', 'bit-integrations')}</li>
      <li>${__('Open <b>Keys and credentials</b>. Copy the <b>Client ID</b> and the <b>Client Secret</b> into this form.', 'bit-integrations')}</li>
      <li>${__('Copy the <b>Callback / Redirect URL</b> from this form. Add it to the app as a redirect URI. Intuit accepts only HTTPS URLs.', 'bit-integrations')}</li>
      <li>${__('Select the environment. Use <b>Sandbox</b> with Development keys and <b>Production</b> with Production keys.', 'bit-integrations')}</li>
      <li>${__('Enter the <b>Company ID</b>. In QuickBooks, go to Settings > Account and settings > Billing & subscription. For a sandbox company, the Intuit Developer portal shows it on the Sandboxes page.', 'bit-integrations')}</li>
      <li>${__('Click <b>Authorize</b> and select the same company.', 'bit-integrations')}</li>
    </ul>
  `

export default function QuickBooksAuthorization({
  quickBooksConf,
  setQuickBooksConf,
  step,
  setstep,
  isInfo
}) {
  return (
    <Authorization
      config={quickBooksConf}
      setConfig={setQuickBooksConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="QuickBooks"
      tutorialLinks={tutorialLinks?.quickBooks || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        scope: 'com.intuit.quickbooks.accounting',
        authCodeEndpoint: {
          url: 'https://appcenter.intuit.com/connect/oauth2'
        },
        tokenEndpoint: {
          url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
          method: 'POST'
        },
        refreshTokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
        extraFields: [
          {
            name: 'environment',
            type: 'select',
            required: true,
            label: __('Environment', 'bit-integrations'),
            options: [
              { label: __('Production', 'bit-integrations'), value: 'production' },
              { label: __('Sandbox', 'bit-integrations'), value: 'sandbox' }
            ]
          },
          {
            name: 'company_id',
            required: true,
            label: __('Company ID', 'bit-integrations'),
            placeholder: __('Enter the QuickBooks Company ID', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
