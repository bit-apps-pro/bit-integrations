import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

function NotionAuthorization({ notionConf, setNotionConf, step, setStep, isInfo }) {
  const note = `
  <h4>${__('Step of get Client Id & Client Secret', 'bit-integrations')}</h4>
  <ul>
    <li>${__(
      'Goto',
      'bit-integrations'
    )}Goto <a href="https://www.notion.so/my-integrations" target='_blank'>My integrations.</a></li>
    <li>${__('Click new integration.', 'bit-integrations')}</li>
    <li>${__('Name to identify your integration to users.', 'bit-integrations')}</li>
    <li>${__(
      '<b>User Capabilities</b> always select read user information including email addresses',
      'bit-integrations'
    )}</li>
    <li><b>${__('Submit', 'bit-integrations')}</b></li>
    <li>${__('Select <b>Integration type</b> Public', 'bit-integrations')}</li>
    <li>${__('Fill up <b>OAuth Domain & URIs</b> information', 'bit-integrations')}</li>
    <li>${__('Homepage & Redirect URIs copy from Integration Settings', 'bit-integrations')}</li>
    <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
</ul>
`
  return (
    <Authorization
      config={notionConf}
      setConfig={setNotionConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Notion"
      tutorialLinks={tutorialLinks?.notion || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'header',
        authCodeEndpoint: {
          url: 'https://api.notion.com/v1/oauth/authorize',
          queryParams: {
            owner: 'user'
          }
        },
        tokenEndpoint: {
          url: 'https://api.notion.com/v1/oauth/token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://api.notion.com/v1/oauth/token'
      }}
      noteDetails={{ note }}
    />
  )
}

export default NotionAuthorization
