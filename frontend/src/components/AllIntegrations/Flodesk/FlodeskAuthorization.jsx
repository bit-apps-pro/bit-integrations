import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function FlodeskAuthorization({
  flodeskConf,
  setFlodeskConf,
  step,
  setstep,
  isInfo
}) {
  const note = `
  <small class="d-blk mt-5">
    ${__('Generate an API key in Flodesk:', 'bit-integrations')}
    <b>${__('Account &gt; Integrations &gt; Flodesk API', 'bit-integrations')}</b>.
    ${__('API access requires a paid Flodesk plan.', 'bit-integrations')}
  </small>
  `

  return (
    <Authorization
      config={flodeskConf}
      setConfig={setFlodeskConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Flodesk"
      tutorialLinks={tutorialLinks?.flodesk || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://api.flodesk.com/v1/segments',
        method: 'GET',
        allowEmptyPassword: true
      }}
      noteDetails={{ note }}
    />
  )
}
