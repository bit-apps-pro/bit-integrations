import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { fetchAllTags } from './GroundhoggCommonFunc'

export default function GroundhoggAuthorization({
  groundhoggConf,
  setGroundhoggConf,
  step,
  setstep,
  setIsLoading,
  isInfo
}) {
  const loadTags = useCallback(
    async connectionId => {
      const nextConf = connectionId
        ? { ...groundhoggConf, connection_id: connectionId }
        : groundhoggConf

      await fetchAllTags(nextConf, setGroundhoggConf, setIsLoading)
    },
    [groundhoggConf, setGroundhoggConf, setIsLoading]
  )

  const handleConnectionSelected = useCallback(
    async connectionId => {
      await loadTags(connectionId)
    },
    [loadTags]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !groundhoggConf?.default?.tags) {
        loadTags()
      }

      setstep(value)
    },
    [groundhoggConf, loadTags, setstep]
  )

  const groundhoggInstructions = `<h4>${__('Get Public Key and Token few step', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First install Groundhogg.', 'bit-integrations')}</li>
                <li>${__('Go to <b> "Setting -> Api" </b>.', 'bit-integrations')}</li>
            </ul>`

  return (
    <Authorization
      config={groundhoggConf}
      setConfig={setGroundhoggConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Groundhogg"
      tutorialLinks={tutorialLinks?.groundhogg || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: '{domainName}/index.php?rest_route=/gh/v4/contacts',
        key: 'Gh-Token',
        addTo: 'header',
        headers: {
          'Gh-Public-Key': '{public_key}'
        },
        method: 'GET',
        extraFields: [
          {
            name: 'domainName',
            label: 'Your Domain Name',
            required: true,
            placeholder: 'https://example.com'
          },
          {
            name: 'public_key',
            label: 'Public Key',
            required: true,
            placeholder: 'Public Key...'
          }
        ]
      }}
      noteDetails={{ note: groundhoggInstructions }}
      onConnectionSelected={handleConnectionSelected}
    />
  )
}
