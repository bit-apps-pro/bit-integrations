import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function InsightlyAuthorization({
  insightlyConf,
  setInsightlyConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('Get Insightly API credentials', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open your Insightly account settings.', 'bit-integrations')}</li>
      <li>${__('Copy your API key and account host (without https://api.).', 'bit-integrations')}</li>
      <li>${__('Use API key in Username field, leave password empty, then authorize.', 'bit-integrations')}</li>
    </ul>
    <small class="d-blk mt-3">
      ${__('Example host:', 'bit-integrations')} <b>name.insightly.com</b>
    </small>
  `

  return (
    <Authorization
      config={insightlyConf}
      setConfig={setInsightlyConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Insightly"
      tutorialLinks={tutorialLinks?.insightly || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://api.{api_url}/v3.1/Users',
        method: 'GET',
        allowEmptyPassword: true,
        extraFields: [
          {
            name: 'api_url',
            label: __('API URL', 'bit-integrations'),
            required: true,
            placeholder: __('name.insightly.com', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
