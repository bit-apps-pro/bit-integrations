import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

const tokenUrl = 'https://app.sender.net/settings/tokens'
const note = `
    <h4>${__('Steps to generate an API access token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Go to', 'bit-integrations')} <a href=${tokenUrl} target="_blank" rel="noreferrer">${__(
        'Sender API Access Tokens',
        'bit-integrations'
      )}</a></li>
      <li>${__('Create a token and copy it.', 'bit-integrations')}</li>
      <li>${__('Paste it into the <b>Bearer Token</b> field and click <b>Authorize</b>.', 'bit-integrations')}</li>
    </ul>
  `

export default function SenderAuthorization({ senderConf, setSenderConf, step, setstep, isInfo }) {
  return (
    <Authorization
      config={senderConf}
      setConfig={setSenderConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Sender"
      tutorialLinks={tutorialLinks?.sender || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.sender.net/v2/groups',
        method: 'GET',
        headers: { Accept: 'application/json' }
      }}
      noteDetails={{ note }}
    />
  )
}
