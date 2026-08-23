import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function SalesforceAuthorization({
  salesforceConf,
  setSalesforceConf,
  step,
  setStep,
  isInfo
}) {
  const note = `<h4>${__('Salesforce OAuth2 Setup', 'bit-integrations')}</h4>
  <ol>
    <li>${__('Create a Connected App in Salesforce.', 'bit-integrations')}</li>
    <li>${__('Set the callback URL exactly as shown below.', 'bit-integrations')}</li>
    <li>${__('Use Consumer Key as Client ID and Consumer Secret as Client Secret.', 'bit-integrations')}</li>
  </ol>`

  return (
    <Authorization
      config={salesforceConf}
      setConfig={setSalesforceConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Salesforce"
      tutorialLinks={tutorialLinks?.salesforce || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        authCodeEndpoint: {
          url: 'https://login.salesforce.com/services/oauth2/authorize',
          queryParams: {
            prompt: 'login consent'
          }
        },
        tokenEndpoint: {
          url: 'https://login.salesforce.com/services/oauth2/token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://login.salesforce.com/services/oauth2/token',
        extraTokenFields: ['instance_url']
      }}
      noteDetails={{ note }}
    />
  )
}
