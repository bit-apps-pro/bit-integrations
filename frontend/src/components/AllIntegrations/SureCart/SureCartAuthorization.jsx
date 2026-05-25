import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function SureCartAuthorization({
  sureCartConf,
  setSureCartConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <small class="d-blk mt-5">
      ${__('To get bearer token, please visit', 'bit-integrations')}
      <a class="btcd-link" href="https://app.surecart.com/developer" target="_blank" rel="noreferrer">
        ${__(' SureCart developer settings', 'bit-integrations')}
      </a>
    </small>`

  return (
    <Authorization
      config={sureCartConf}
      setConfig={setSureCartConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="SureCart"
      tutorialLinks={tutorialLinks?.sureCart || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.surecart.com/v1/account',
        method: 'GET'
      }}
      noteDetails={{ note }}
    />
  )
}
