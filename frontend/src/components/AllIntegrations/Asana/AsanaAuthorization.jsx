import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function AsanaAuthorization({ asanaConf, setAsanaConf, step, setStep, isInfo }) {
  const note = `
    <h4>${__('Get API token', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open your Asana account settings.', 'bit-integrations')}</li>
      <li>${__('Create a personal access token.', 'bit-integrations')}</li>
      <li>${__('Use that token for this connection.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={asanaConf}
      setConfig={setAsanaConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Asana"
      tutorialLinks={tutorialLinks?.asana || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://app.asana.com/api/1.0/users/me',
        method: 'GET'
      }}
      noteDetails={{ note }}
    />
  )
}
