import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllEvents } from './DemioCommonFunc'

export default function DemioAuthorization({
  demioConf,
  setDemioConf,
  step,
  setStep,
  setLoading,
  isInfo
}) {
  const loadEvents = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...demioConf, connection_id: connectionId } : demioConf
      getAllEvents(nextConf, setDemioConf, setLoading)
    },
    [demioConf, setDemioConf, setLoading]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !(demioConf?.events || []).length) {
        loadEvents()
      }
      setStep(value)
    },
    [demioConf, loadEvents, setStep]
  )

  const note = `
    <h4>${__('To get API Key and API Secret', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open your Demio dashboard.', 'bit-integrations')}</li>
      <li>${__('Go to Settings, then API.', 'bit-integrations')}</li>
      <li>${__('Generate API secret and copy credentials.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={demioConf}
      setConfig={setDemioConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Demio"
      tutorialLinks={tutorialLinks?.demio || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://my.demio.com/api/v1/ping',
        method: 'GET',
        key: 'Api-Key',
        addTo: 'header',
        headers: {
          'Api-Secret': '{api_secret}'
        },
        extraFields: [
          {
            name: 'api_secret',
            label: __('API Secret', 'bit-integrations'),
            required: true,
            placeholder: __('API Secret...', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadEvents}
    />
  )
}
