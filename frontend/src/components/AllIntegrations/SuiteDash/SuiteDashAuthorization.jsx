import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function SuiteDashAuthorization({
  suiteDashConf,
  setSuiteDashConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('To get Public ID and Secret Key', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open your SuiteDash dashboard.', 'bit-integrations')}</li>
      <li>${__('Go to Profile, then Integrations.', 'bit-integrations')}</li>
      <li>${__('Open Secure API and copy credentials.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={suiteDashConf}
      setConfig={setSuiteDashConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="SuiteDash"
      tutorialLinks={tutorialLinks?.suiteDash || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://app.suitedash.com/secure-api/contacts',
        method: 'GET',
        key: 'X-Public-ID',
        addTo: 'header',
        headers: {
          'X-Secret-Key': '{secret_key}'
        },
        extraFields: [
          {
            name: 'secret_key',
            label: __('Secret Key', 'bit-integrations'),
            required: true,
            placeholder: __('Secret Key...', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
