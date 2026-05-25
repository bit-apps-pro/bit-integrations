import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function CapsuleCRMAuthorization({
  capsulecrmConf,
  setCapsuleCRMConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('Get API Token', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Sign in to your CapsuleCRM account.', 'bit-integrations')}</li>
      <li>${__('Open My Preferences, then API Authentication Tokens.', 'bit-integrations')}</li>
      <li>${__('Create and copy your API token.', 'bit-integrations')}</li>
      <li>${__('For reference, your account domain looks like {name}.capsulecrm.com.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={capsulecrmConf}
      setConfig={setCapsuleCRMConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Capsule CRM"
      tutorialLinks={tutorialLinks?.capsulecrm || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.capsulecrm.com/api/v2/users',
        method: 'GET',
        extraFields: [
          {
            name: 'api_url',
            label: __('Account Domain', 'bit-integrations'),
            required: true,
            placeholder: __('your-org.capsulecrm.com', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
