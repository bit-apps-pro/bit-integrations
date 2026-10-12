import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
const appRegistrationsUrl =
  'https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade'

const note = `
    <h4>${__('Microsoft Excel OAuth setup', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open', 'bit-integrations')} <a href="${appRegistrationsUrl}" target="_blank" rel="noreferrer">${__('Azure App registrations', 'bit-integrations')}</a> ${__('and register a new application.', 'bit-integrations')}</li>
      <li>${__('For <b>Supported account types</b>, choose accounts in any organizational directory (multitenant).', 'bit-integrations')}</li>
      <li>${__('Add a <b>Web</b> redirect URI and paste the <b>Callback / Redirect URL</b> shown below.', 'bit-integrations')}</li>
      <li>${__('Under <b>API permissions</b>, add the Microsoft Graph delegated permissions <b>Files.ReadWrite</b>, <b>offline_access</b> and <b>openid</b>.', 'bit-integrations')}</li>
      <li>${__('Under <b>Certificates & secrets</b>, create a client secret and copy its <b>Value</b>, not its Secret ID.', 'bit-integrations')}</li>
      <li>${__('Paste the <b>Application (client) ID</b> into Client ID and the secret value into Client Secret, then click <b>Authorize</b>.', 'bit-integrations')}</li>
      <li>${__('Workbooks must be in your own OneDrive for work or school (SharePoint libraries are not listed).', 'bit-integrations')}</li>
    </ul>
  `

export default function MicrosoftExcelAuthorization({
  microsoftExcelConf,
  setMicrosoftExcelConf,
  step,
  setstep,
  isInfo
}) {
  return (
    <Authorization
      config={microsoftExcelConf}
      setConfig={setMicrosoftExcelConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Microsoft Excel"
      tutorialLinks={tutorialLinks?.microsoftExcel || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        authCodeEndpoint: {
          url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          queryParams: {
            response_mode: 'query',
            scope: 'openid offline_access Files.ReadWrite'
          }
        },
        tokenEndpoint: {
          url: tokenUrl,
          method: 'POST'
        },
        refreshTokenUrl: tokenUrl
      }}
      noteDetails={{ note }}
    />
  )
}
