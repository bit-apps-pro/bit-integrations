import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { refreshBenchMarkList, refreshBenchMarkHeader } from './BenchMarkCommonFunc'

export default function BenchMarkAuthorization({
  benchMarkConf,
  setBenchMarkConf,
  step,
  setstep,
  setSnackbar,
  isInfo,
  setIsLoading
}) {
  const loadLists = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...benchMarkConf, connection_id: connectionId } : benchMarkConf

      refreshBenchMarkList(nextConf, setBenchMarkConf, setIsLoading, setSnackbar)
    },
    [benchMarkConf, setBenchMarkConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !benchMarkConf?.default?.benchMarkLists) {
        loadLists()
      }
      setstep(value)
    },
    [benchMarkConf, loadLists, setstep]
  )

  const note = `
            <h4>${__('Get api secret key', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your BenchMark dashboard.', 'bit-integrations')}</li>
                <li>${__('Click "Integrations", Then click "API Key"', 'bit-integrations')}</li>
            </ul>`

  return (
    <Authorization
      config={benchMarkConf}
      setConfig={setBenchMarkConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Benchmark Email"
      tutorialLinks={tutorialLinks?.benchMark || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://clientapi.benchmarkemail.com/Client/',
        method: 'GET',
        key: 'AuthToken',
        addTo: 'header'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}
