import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

const zendeskApiEndpoint = authData =>
  `https://${authData?.subdomain || ''}.zendesk.com/api/v2/users/me.json`

export default function ZendeskSupportAuthorization({
  zendeskSupportConf,
  setZendeskSupportConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('How to connect Zendesk Support:', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
        'Your <b>Subdomain</b> is the part before <b>.zendesk.com</b> in your account URL. Example: for <b>https://acme.zendesk.com</b> the subdomain is <b>acme</b>.',
        'bit-integrations'
      )}</li>
      <li>${__(
        'Use the <b>Email</b> of an agent/admin account that has API access.',
        'bit-integrations'
      )}</li>
      <li>${__(
        'In Zendesk, go to <b>Admin Center → Apps and integrations → APIs → Zendesk API</b> and enable <b>Token access</b>, then click <b>Add API token</b>.',
        'bit-integrations'
      )}</li>
      <li>${__(
        'Copy the generated token and paste it into the <b>API Token</b> field.',
        'bit-integrations'
      )}</li>
      <li>${__('Finally, authorize and save the connection.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={zendeskSupportConf}
      setConfig={setZendeskSupportConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Zendesk Support"
      tutorialLinks={tutorialLinks?.zendeskSupport || {}}
      authDetails={{
        authType: AUTH_TYPES.CUSTOM,
        apiEndpoint: zendeskApiEndpoint,
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        encryptKeys: ['apiToken'],
        extraFields: [
          {
            name: 'subdomain',
            label: __('Subdomain', 'bit-integrations'),
            required: true,
            placeholder: __('your-subdomain', 'bit-integrations'),
            persistToConfig: false
          },
          {
            name: 'email',
            label: __('Email', 'bit-integrations'),
            required: true,
            placeholder: __('agent@example.com', 'bit-integrations'),
            persistToConfig: false
          },
          {
            name: 'apiToken',
            label: __('API Token', 'bit-integrations'),
            required: true,
            placeholder: __('API Token...', 'bit-integrations'),
            persistToConfig: false
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
