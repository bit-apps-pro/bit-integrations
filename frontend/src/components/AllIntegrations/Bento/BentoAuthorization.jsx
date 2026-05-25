import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function BentoAuthorization({ bentoConf, setBentoConf, step, setStep, isInfo }) {
  const note = `
    <h4>${__('To get Publishable Key, Secret Key and Site UUID', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open the Bento team dashboard.', 'bit-integrations')}</li>
      <li>${__('Go to Settings, then API Keys.', 'bit-integrations')}</li>
      <li>${__('Copy Publishable Key, Secret Key and Site UUID.', 'bit-integrations')}</li>
      <li>${__('Use Publishable Key as Username and Secret Key as Password.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={bentoConf}
      setConfig={setBentoConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Bento"
      tutorialLinks={tutorialLinks?.bento || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://app.bentonow.com/api/v1/fetch/tags?site_uuid={site_uuid}',
        method: 'GET',
        extraFields: [
          {
            name: 'site_uuid',
            label: __('Site UUID', 'bit-integrations'),
            required: true,
            placeholder: __('Site UUID...', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
