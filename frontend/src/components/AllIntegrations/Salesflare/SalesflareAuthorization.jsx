import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function SalesflareAuthorization({
  salesflareConf,
  setSalesflareConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('Get API Key', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Go to your Salesflare user dashboard.', 'bit-integrations')}</li>
      <li>${__('Open Settings.', 'bit-integrations')}</li>
      <li>${__('Open API Keys, then generate/copy your key.', 'bit-integrations')}</li>
    </ul>
    <small class="d-blk mt-3">
      ${__('To get API key, please visit', 'bit-integrations')}
      <a class="btcd-link" href="https://app.salesflare.com/#/settings/apikeys" target="_blank" rel="noreferrer">
        ${__('Salesflare API Key', 'bit-integrations')}
      </a>
    </small>`

  return (
    <Authorization
      config={salesflareConf}
      setConfig={setSalesflareConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Salesflare"
      tutorialLinks={tutorialLinks?.salesflare || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.salesflare.com/accounts',
        method: 'GET'
      }}
      noteDetails={{ note }}
    />
  )
}
