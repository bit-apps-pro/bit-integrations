import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { getAllLists } from './KlaviyoCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

function KlaviyoAuthorization({
  klaviyoConf,
  setKlaviyoConf,
  step,
  setStep,
  isInfo
}) {
  const loadLists = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...klaviyoConf, connection_id: connectionId } : klaviyoConf
      getAllLists(nextConf, setKlaviyoConf, {}, () => {})
    },
    [klaviyoConf, setKlaviyoConf]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !klaviyoConf?.default?.lists) {
        loadLists()
      }
      setStep(value)
    },
    [klaviyoConf, loadLists, setStep]
  )

  const note = `
  <h4>${__('Step of get API Key:', 'bit-integrations')}</h4>
  <ul>
    <li>${__(
      'Goto Settings and click on',
      'bit-integrations'
    )} <a href="https://www.klaviyo.com/account#api-keys-tab" target='_blank'>${__(
      'API Keys.',
      'bit-integrations'
    )}</a></li>
    <li>${__('Click on Create Private API key.', 'bit-integrations')}</li>
    <li>${__(
      'Copy the <b>Private API Key</b> and paste into <b>API Key</b> field of your authorization form.',
      'bit-integrations'
    )}</li>
    <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
</ul>
`

  return (
    <Authorization
      config={klaviyoConf}
      setConfig={setKlaviyoConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Klaviyo"
      tutorialLinks={tutorialLinks?.klaviyo || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://a.klaviyo.com/api/lists',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: {
          Authorization: 'Klaviyo-API-Key {api_key}',
          accept: 'application/json',
          revision: '2024-02-15'
        }
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}

export default KlaviyoAuthorization
