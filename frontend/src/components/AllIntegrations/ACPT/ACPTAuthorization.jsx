import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function ACPTAuthorization({ acptConf, setAcptConf, step, setStep, isInfo }) {
  const note = `
    <b>${__('Please note', 'bit-integrations')}</b>
    <p>${__(
      'The secret key will no longer be displayed, so please take note of it. Eventually, you can regenerate your API keys.',
      'bit-integrations'
    )}</p>
    <h4>${__('To get API key-secret', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Go to the ACPT dashboard.', 'bit-integrations')}</li>
      <li>${__('Open Tools, then go to API dashboard.', 'bit-integrations')}</li>
      <li>${__('Open REST API and generate an API key if needed.', 'bit-integrations')}</li>
      <li>${__('Copy the generated key-secret pair.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={acptConf}
      setConfig={setAcptConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="ACPT"
      tutorialLinks={tutorialLinks?.acpt || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: '{base_url}/wp-json/acpt/v1/taxonomy',
        method: 'GET',
        key: 'acpt-api-key',
        addTo: 'header',
        extraFields: [
          {
            name: 'base_url',
            label: __('Homepage URL', 'bit-integrations'),
            required: true,
            placeholder: __('https://example.com', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
