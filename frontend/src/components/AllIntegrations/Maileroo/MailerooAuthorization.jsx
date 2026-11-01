import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

const dashboardUrl = 'https://app.maileroo.com'
const note = `
    <h4>${__('Steps to get your Maileroo Account API key:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open the', 'bit-integrations')} <a href=${dashboardUrl} target="_blank" rel="noreferrer">${__(
        'Maileroo dashboard',
        'bit-integrations'
      )}</a>.</li>
      <li>${__('Create an <b>Account API key</b>. Give the key the scopes of the actions that you use.', 'bit-integrations')}</li>
      <li>${__('Copy the key and paste it into the <b>Bearer Token</b> field, then click <b>Authorize</b>.', 'bit-integrations')}</li>
    </ul>
    <p>${__('A domain sending key does not work here. Email actions get the sending key of the selected domain.', 'bit-integrations')}</p>
  `

export default function MailerooAuthorization({ mailerooConf, setMailerooConf, step, setstep, isInfo }) {
  return (
    <Authorization
      config={mailerooConf}
      setConfig={setMailerooConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Maileroo"
      tutorialLinks={tutorialLinks?.maileroo || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.maileroo.com/v1/account',
        method: 'GET',
        headers: { Accept: 'application/json' }
      }}
      noteDetails={{ note }}
    />
  )
}
