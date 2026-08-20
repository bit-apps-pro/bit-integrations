import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

const keyUrl = 'https://app.surecontact.com/settings/api-keys'
const note = `
    <h4>${__('Steps to generate an API key:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Go to', 'bit-integrations')} <a href=${keyUrl} target="_blank" rel="noreferrer">${__(
        'SureContact API Keys',
        'bit-integrations'
      )}</a></li>
      <li>${__('Create a key and copy it.', 'bit-integrations')}</li>
      <li>${__('Paste it into the <b>Bearer Token</b> field and click <b>Authorize</b>.', 'bit-integrations')}</li>
    </ul>
  `

export default function SureContactAuthorization({
  sureContactConf,
  setSureContactConf,
  step,
  setstep,
  isInfo
}) {
  return (
    <Authorization
      config={sureContactConf}
      setConfig={setSureContactConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="SureContact"
      tutorialLinks={tutorialLinks?.sureContact || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.surecontact.com/api/v1/public/lists',
        method: 'GET',
        headers: { Accept: 'application/json' }
      }}
      noteDetails={{ note }}
    />
  )
}
