import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllCustomFields, getAllLists, getAllTags } from './SelzyCommonFunc'

function SelzyAuthorization({
  selzyConf,
  setSelzyConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const loadLists = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...selzyConf, connection_id: connectionId } : selzyConf
      await getAllLists(nextConf, setSelzyConf, loading, setLoading)
    },
    [loading, selzyConf, setLoading, setSelzyConf]
  )

  const handleSetStep = useCallback(
    async value => {
      if (value === 2) {
        setLoading({ ...loading, page: true })
        const nextConf = selzyConf?.connection_id ? selzyConf : { ...selzyConf }
        await getAllTags(nextConf, setSelzyConf)
        await getAllCustomFields(nextConf, setSelzyConf)
        setLoading({ ...loading, page: false })
      }
      setStep(value)
    },
    [loading, selzyConf, setLoading, setSelzyConf, setStep]
  )

  const note = `
  <h4>${__('Step of get API Key:', 'bit-integrations')}</h4>
  <ul>
    <li>${__(
      'Goto Settings and click on',
      'bit-integrations'
    )} <a href="https://cp.selzy.com/en/v5/user/info/api" target='_blank'>${__(
      'Integration and API.',
      'bit-integrations'
    )}</a></li>
    <li>${__('API access section API key click show full.', 'bit-integrations')}</li>
    <li>${__('Enter your password and click send', 'bit-integrations')}</li>
    <li>${__(
      'Copy the <b>API Key</b> and paste into <b>API Key</b> field of your authorization form.',
      'bit-integrations'
    )}</li>
    <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
</ul>
`

  return (
    <Authorization
      config={selzyConf}
      setConfig={setSelzyConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Selzy"
      tutorialLinks={tutorialLinks?.selzy || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.selzy.com/en/api/getLists?format=json',
        method: 'GET',
        key: 'api_key',
        addTo: 'query'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}

export default SelzyAuthorization
