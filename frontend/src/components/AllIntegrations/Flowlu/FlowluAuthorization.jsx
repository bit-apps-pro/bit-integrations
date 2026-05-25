import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function FlowluAuthorization({
  flowluConf,
  setFlowluConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('Get the API Key', 'bit-integrations')}</h4>
    <ul>
      <li>${__('First go to your Flowlu dashboard.', 'bit-integrations')}</li>
      <li>${__('Open Profile from the top-right corner.', 'bit-integrations')}</li>
      <li>${__('Open Portal Settings, then API Settings.', 'bit-integrations')}</li>
      <li>${__('Create and copy your API key.', 'bit-integrations')}</li>
      <li>${__('Use your workspace subdomain as Company Name.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={flowluConf}
      setConfig={setFlowluConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Flowlu"
      tutorialLinks={tutorialLinks?.flowlu || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://{company_name}.flowlu.com/api/v1/module/crm/account',
        method: 'GET',
        key: 'api_key',
        addTo: 'query',
        extraFields: [
          {
            name: 'company_name',
            label: __('Company Name', 'bit-integrations'),
            required: true,
            placeholder: __('your-company', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
