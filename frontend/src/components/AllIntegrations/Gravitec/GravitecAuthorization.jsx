import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function GravitecAuthorization({
  gravitecConf,
  setGravitecConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('To Get App key & App Secret', 'bit-integrations')}</h4>
    <ul>
      <li>${__('First go to your Gravitec dashboard.', 'bit-integrations')}</li>
      <li>${__('Open your site from the left sidebar.', 'bit-integrations')}</li>
      <li>${__('Open Settings, then REST API.', 'bit-integrations')}</li>
      <li>${__('Use App key as Username and App secret as Password here.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={gravitecConf}
      setConfig={setGravitecConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Gravitec"
      tutorialLinks={tutorialLinks?.gravitec || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://uapi.gravitec.net/api/v3/push',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        payload:
          '{"payload":{"title":"Authorization","message":"Authorized Successfully","icon":"{site_url}/favicon.ico","redirect_url":"{site_url}"}}',
        extraFields: [
          {
            name: 'site_url',
            label: __('Site Url', 'bit-integrations'),
            required: true,
            placeholder: __('https://example.com', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
