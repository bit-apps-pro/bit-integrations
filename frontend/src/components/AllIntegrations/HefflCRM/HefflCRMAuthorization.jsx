import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function HefflCRMAuthorization({ hefflCRMConf, setHefflCRMConf, step, setStep, isInfo }) {
  return (
    <Authorization
      config={hefflCRMConf}
      setConfig={setHefflCRMConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialLinkKey="hefflCRM"
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.heffl.com/api/v1/leads?limit=1',
        method: 'GET',
        key: 'x-api-key',
        addTo: 'header',
        headers: { Accept: 'application/json' }
      }}
      noteDetails={{ note }}
    />
  )
}

const note = `
    <h4>${__('Steps to generate API Key:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Log in to your Heffl CRM account.', 'bit-integrations')}</li>
      <li>${__(
        'Go to Settings → Developers / API Keys and generate a new key.',
        'bit-integrations'
      )}</li>
      <li>${__(
        'Copy the API key and paste it into the field above, then click Authorize.',
        'bit-integrations'
      )}</li>
    </ul>
  `
