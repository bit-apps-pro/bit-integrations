import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function PipeDriveAuthorization({
  pipeDriveConf,
  setPipeDriveConf,
  step,
  setstep,
  isInfo
}) {
  const note = `
    <h4>${__('Step of generate API token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Goto', 'bit-integrations')} <a href="https://app.pipedrive.com/settings/api">${__(
        'Generate API Token',
        'bit-integrations'
      )}</a></li>
      <li>${__(
        'Copy the <b>Token</b> and paste into <b>API Token</b> field of your authorization form.',
        'bit-integrations'
      )}</li>
      <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
  </ul>
  `

  return (
    <Authorization
      config={pipeDriveConf}
      setConfig={setPipeDriveConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Pipedrive"
      tutorialLinks={tutorialLinks?.pipeDrive || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.pipedrive.com/v1/persons',
        method: 'GET',
        key: 'api_token',
        addTo: 'query'
      }}
      noteDetails={{ note }}
    />
  )
}
