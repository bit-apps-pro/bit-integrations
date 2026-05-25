/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function OneHashCRMAuthorization({
  oneHashCRMConf,
  setOneHashCRMConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
      <h4>${__('Get API credentials', 'bit-integrations')}</h4>
      <ul>
          <li>${__(
            "Go to your OneHash CRM user dashboard and click profile from top-right corner.",
            'bit-integrations'
          )}</li>
          <li>${__('Select My Settings.', 'bit-integrations')}</li>
          <li>${__('Then go to API Access → Generate Keys.', 'bit-integrations')}</li>
      </ul>`

  return (
    <Authorization
      config={oneHashCRMConf}
      setConfig={setOneHashCRMConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="oneHashCRM"
      tutorialLinks={tutorialLinks?.oneHashCRM || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: '{domain}/api/resource/Lead',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: {
          Authorization: 'token {api_key}:{api_secret}',
          'Content-type': 'application/json'
        },
        extraFields: [
          {
            name: 'domain',
            label: __('Access API URL', 'bit-integrations'),
            required: true,
            placeholder: __('https://your-domain.com', 'bit-integrations')
          },
          {
            name: 'api_secret',
            label: __('API Secret', 'bit-integrations'),
            required: true,
            placeholder: __('API Secret...', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
