import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllLists } from './MoosendCommonFunc'

function MoosendAuthorization({
  moosendConf,
  setMoosendConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const loadLists = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...moosendConf, connection_id: connectionId } : moosendConf

      setLoading({ ...loading, page: true })
      const loaded = await getAllLists(nextConf, setMoosendConf, loading, setLoading)
      if (loaded) {
        setLoading({ ...loading, page: false })
      }
    },
    [moosendConf, setMoosendConf, loading, setLoading]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !moosendConf?.default?.lists) {
        loadLists()
      }
      setStep(value)
    },
    [moosendConf, loadLists, setStep]
  )

  const note = `
  <h4>${__('Step of get API Key:', 'bit-integrations')}</h4>
  <ul>
    <li>${__('First login on account.', 'bit-integrations')}</li>
    <li>${__('Goto Settings and click on <b>API Key</b>', 'bit-integrations')}</li>
    <li>${__(
      'Copy the <b>API Key</b> and paste into <b>API Key</b> field of your authorization form.',
      'bit-integrations'
    )}</li>
    <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
</ul>
`

  return (
    <Authorization
      config={moosendConf}
      setConfig={setMoosendConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Moosend"
      tutorialLinks={tutorialLinks?.moosend || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.moosend.com/v3/lists/1/1000.json',
        method: 'GET',
        key: 'apikey',
        addTo: 'query'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}

export default MoosendAuthorization
