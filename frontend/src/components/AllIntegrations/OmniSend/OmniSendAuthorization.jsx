/* eslint-disable no-unused-expressions */
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function OmniSendAuthorization({
  omniSendConf,
  setOmniSendConf,
  step,
  setstep,
  isInfo
}) {
  const note = `
    <h4>${__('Step of generate API token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
        'Goto',
        'bit-integrations'
      )} <a href="https://app.omnisend.com/o/my-account/integrations/api-keys">${__(
        'Generate API Token',
        'bit-integrations'
      )}</a></li>
      <li>${__(
        'Copy the <b>Token</b> and paste into <b>API Token</b> field of your authorization form.',
        'bit-integrations'
      )}</li>
      <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
  </ul>
  `

  return (
    <Authorization
      config={omniSendConf}
      setConfig={setOmniSendConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Omnisend"
      tutorialLinks={tutorialLinks?.omniSend || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.omnisend.com/v3/contacts',
        method: 'GET',
        key: 'X-API-KEY',
        addTo: 'header'
      }}
      noteDetails={{ note }}
    />
  )
}
