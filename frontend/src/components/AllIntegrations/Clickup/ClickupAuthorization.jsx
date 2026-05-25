import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function ClickupAuthorization({ clickupConf, setClickupConf, step, setStep, isInfo }) {
  const note = `
    <h4>${__('To get the ClickUp API key', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open your personal Settings in ClickUp.', 'bit-integrations')}</li>
      <li>${__('Go to Apps in the left sidebar.', 'bit-integrations')}</li>
      <li>${__('Generate your API token and copy it.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={clickupConf}
      setConfig={setClickupConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="ClickUp"
      tutorialLinks={tutorialLinks?.clickup || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.clickup.com/api/v2/user',
        method: 'GET',
        key: 'Authorization',
        addTo: 'header'
      }}
      noteDetails={{ note }}
    />
  )
}
