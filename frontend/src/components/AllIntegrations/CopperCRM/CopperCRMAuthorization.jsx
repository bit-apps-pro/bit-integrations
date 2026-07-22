import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function CopperCRMAuthorization({
  copperCRMConf,
  setCopperCRMConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('Get API credentials', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Go to your Copper dashboard.', 'bit-integrations')}</li>
      <li>${__('Open Settings > Integrations > API Keys.', 'bit-integrations')}</li>
      <li>${__('Copy your API key and account email, then authorize.', 'bit-integrations')}</li>
    </ul>
  `

  return (
    <Authorization
      config={copperCRMConf}
      setConfig={setCopperCRMConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Copper CRM"
      tutorialLinks={tutorialLinks?.coppercrm || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.copper.com/developer_api/v1/account',
        method: 'GET',
        key: 'X-PW-AccessToken',
        addTo: 'header',
        headers: {
          'X-PW-Application': 'developer_api',
          'X-PW-UserEmail': '{api_email}',
          'X-PW-AccessToken': '{api_key}',
          'Content-Type': 'application/json'
        },
        extraFields: [
          {
            name: 'api_email',
            label: __('Your API Email', 'bit-integrations'),
            required: true,
            placeholder: __('john@company.com', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
