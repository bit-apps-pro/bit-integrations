import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function ZendeskAuthorization({
  zendeskConf,
  setZendeskConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <small class="d-blk mt-3">
      ${__('To Get API Token, Please Visit', 'bit-integrations')}
      <a class="btcd-link" href="https://app.futuresimple.com/settings/oauth" target="_blank" rel="noreferrer">
        ${__('Zendesk API Token', 'bit-integrations')}
      </a>
    </small>`

  return (
    <Authorization
      config={zendeskConf}
      setConfig={setZendeskConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Zendesk"
      tutorialLinks={tutorialLinks?.zendesk || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.getbase.com/v2/accounts/self',
        method: 'GET'
      }}
      noteDetails={{ note }}
    />
  )
}
