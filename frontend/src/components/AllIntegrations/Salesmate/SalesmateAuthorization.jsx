/* eslint-disable jsx-a11y/anchor-is-valid */
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function SalesmateAuthorization({
  salesmateConf,
  setSalesmateConf,
  step,
  setStep,
  isInfo
}) {
  const ActiveInstructions = `<h4>${__('Get Session Token', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your Salesmate dashboard.', 'bit-integrations')}</li>
                <li>${__('Click go to your "Profile" from Right top corner', 'bit-integrations')}</li>
                <li>${__('Then Click "Access Key"', 'bit-integrations')}</li>
                <li>${__(
                  'Then click "Session Key / Session Token", Then Copied',
                  'bit-integrations'
                )}</li>
            </ul>`

  return (
    <Authorization
      config={salesmateConf}
      setConfig={setSalesmateConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Salesmate CRM"
      tutorialLinks={tutorialLinks?.salesmate || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://{link_name}.salesmate.io/apis/v1/users/active',
        key: 'accessToken',
        addTo: 'header',
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'x-linkname': '{link_name}.salesmate.io'
        },
        extraFields: [
          {
            name: 'link_name',
            label: 'Link Name',
            required: true,
            placeholder: 'Link Name...'
          }
        ]
      }}
      noteDetails={{ note: ActiveInstructions }}
    />
  )
}
