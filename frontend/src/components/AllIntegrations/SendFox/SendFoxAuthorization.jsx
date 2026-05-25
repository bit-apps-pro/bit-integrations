import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function SendFoxAuthorization({
  sendFoxConf,
  setSendFoxConf,
  step,
  setstep,
  isInfo
}) {
  const note = `
    <small class="d-blk mt-3">
      ${__('To generate an access token, please visit', 'bit-integrations')}
      <a class="btcd-link" href="https://sendfox.com/account/oauth" target="_blank" rel="noreferrer">
        ${__(' SendFox OAuth settings', 'bit-integrations')}
      </a>
    </small>`

  return (
    <Authorization
      config={sendFoxConf}
      setConfig={setSendFoxConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="SendFox"
      tutorialLinks={tutorialLinks?.sendFox || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.sendfox.com/me',
        method: 'GET'
      }}
      noteDetails={{ note }}
    />
  )
}
