import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { getAllEvents } from './LivestormCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function LivestormAuthorization({
  livestormConf,
  setLivestormConf,
  step,
  setStep,
  loading,
  setLoading,
  setSnackbar,
  isInfo
}) {
  const loadEvents = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...livestormConf, connection_id: connectionId } : livestormConf
      getAllEvents(nextConf, setLivestormConf, loading, setLoading, setSnackbar)
    },
    [livestormConf, loading, setLivestormConf, setLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !livestormConf?.events?.length) {
        loadEvents()
      }
      setStep(value)
    },
    [livestormConf?.events?.length, loadEvents, setStep]
  )

  const ActiveInstructions = `
            <h4>${__('To Get API Token', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your Livestorm dashboard.', 'bit-integrations')}</li>
                <li>${__('Click go to "Account Settings"', 'bit-integrations')}</li>
                <li>${__('Then Click "App marketplace"', 'bit-integrations')}</li>
                <li>${__('Then Click "Public API" card', 'bit-integrations')}</li>
                <li>${__("Then you'll be able to generate your own API tokens", 'bit-integrations')}</li>
            </ul>`

  return (
    <Authorization
      config={livestormConf}
      setConfig={setLivestormConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Livestorm"
      tutorialLinks={tutorialLinks?.livestorm || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.livestorm.co/v1/ping',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: { Authorization: '{api_key}', Accept: 'application/json', 'Content-Type': 'application/json' }
      }}
      noteDetails={{ note: ActiveInstructions }}
      onConnectionSelected={loadEvents}
    />
  )
}
