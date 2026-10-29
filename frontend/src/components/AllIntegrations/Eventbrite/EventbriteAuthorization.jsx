import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

const keyUrl = 'https://www.eventbrite.com/platform/api-keys'
const note = `
    <h4>${__('Steps to get your Eventbrite private token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open', 'bit-integrations')} <a href=${keyUrl} target="_blank" rel="noreferrer">${__(
        'Eventbrite API keys',
        'bit-integrations'
      )}</a> ${__('(Account Settings > Developer Links > API Keys).', 'bit-integrations')}</li>
      <li>${__('Create an API key if the list is empty.', 'bit-integrations')}</li>
      <li>${__('Copy its <b>Private token</b>, not the API key or the client secret.', 'bit-integrations')}</li>
      <li>${__('Paste it into the <b>Bearer Token</b> field and click <b>Authorize</b>.', 'bit-integrations')}</li>
    </ul>
  `

export default function EventbriteAuthorization({
  eventbriteConf,
  setEventbriteConf,
  step,
  setstep,
  isInfo
}) {
  return (
    <Authorization
      config={eventbriteConf}
      setConfig={setEventbriteConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Eventbrite"
      tutorialLinks={tutorialLinks?.eventbrite || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://www.eventbriteapi.com/v3/users/me/',
        method: 'GET',
        headers: { Accept: 'application/json' }
      }}
      noteDetails={{ note }}
    />
  )
}
