import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function InstasentAuthorization({
  instasentConf,
  setInstasentConf,
  step,
  setstep,
  isInfo
}) {
  const note = `
    <h4>${__('Steps to generate an API token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Go to the', 'bit-integrations')} <a href="https://app.instasent.com/" target="_blank" rel="noreferrer">${__('Instasent Dashboard', 'bit-integrations')}</a>.</li>
      <li>${__(
        'Copy the <b>API Token</b> and paste it into the bearer token field.',
        'bit-integrations'
      )}</li>
      <li>${__('Finally, authorize and save the connection.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={instasentConf}
      setConfig={setInstasentConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialLinkKey="instasent"
      tutorialTitle="Instasent"
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.instasent.com/organization/account',
        method: 'GET'
      }}
      noteDetails={{ note }}
    />
  )
}
