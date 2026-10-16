import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

const settingsUrl = 'https://www.pushbullet.com/#settings/account'
const note = `
    <h4>${__('Steps to get your Pushbullet access token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open', 'bit-integrations')} <a href=${settingsUrl} target="_blank" rel="noreferrer">${__(
        'Pushbullet account settings',
        'bit-integrations'
      )}</a>.</li>
      <li>${__('Under <b>Access Tokens</b>, click <b>Create Access Token</b>.', 'bit-integrations')}</li>
      <li>${__('Copy the token and paste it into the <b>Bearer Token</b> field, then click <b>Authorize</b>.', 'bit-integrations')}</li>
    </ul>
  `

export default function PushbulletAuthorization({
  pushbulletConf,
  setPushbulletConf,
  step,
  setstep,
  isInfo
}) {
  return (
    <Authorization
      config={pushbulletConf}
      setConfig={setPushbulletConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Pushbullet"
      tutorialLinks={tutorialLinks?.pushbullet || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.pushbullet.com/v2/users/me',
        method: 'GET',
        headers: { Accept: 'application/json' }
      }}
      noteDetails={{ note }}
    />
  )
}
