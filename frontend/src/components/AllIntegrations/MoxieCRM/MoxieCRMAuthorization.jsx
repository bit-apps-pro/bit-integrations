import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function MoxieCRMAuthorization({
  moxiecrmConf,
  setMoxieCRMConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('Get API Key', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Go to your Moxie dashboard.', 'bit-integrations')}</li>
      <li>${__('Open Workspace Settings from the bottom-left corner.', 'bit-integrations')}</li>
      <li>${__('Go to Connected Apps, then Integrations.', 'bit-integrations')}</li>
      <li>${__('Open Custom Integrations and copy your API key.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={moxiecrmConf}
      setConfig={setMoxieCRMConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="MoxieCRM"
      tutorialLinks={tutorialLinks?.moxiecrm || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://{api_url}/api/public/action/users/list',
        method: 'GET',
        key: 'X-API-KEY',
        addTo: 'header',
        extraFields: [
          {
            name: 'api_url',
            label: __('Account Domain', 'bit-integrations'),
            required: true,
            placeholder: __('your-account.withmoxie.com', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
