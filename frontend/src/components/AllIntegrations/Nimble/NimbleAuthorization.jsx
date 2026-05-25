import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import { getAllFields } from './NimbleCommonFunc'

export default function NimbleAuthorization({
  nimbleConf,
  setNimbleConf,
  step,
  setStep,
  setLoading,
  isInfo,
  setSnackbar
}) {
  const loadFields = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...nimbleConf, connection_id: connectionId } : nimbleConf
      getAllFields(nextConf, setNimbleConf, setLoading, setSnackbar)
    },
    [nimbleConf, setLoading, setNimbleConf, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !nimbleConf?.peopleFields?.length && !nimbleConf?.companyFields?.length) {
        loadFields()
      }
      setStep(value)
    },
    [loadFields, nimbleConf?.companyFields?.length, nimbleConf?.peopleFields?.length, setStep]
  )

  const ActiveInstructions = `
            <h4>${__('To Get API Token', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your Nimble dashboard.', 'bit-integrations')}</li>
                <li>${__('Click go to "Settings"', 'bit-integrations')}</li>
                <li>${__('Then Click "API Tokens"', 'bit-integrations')}</li>
                <li>${__('Then Click "Generate New Token', 'bit-integrations')}</li>
            </ul>`

  return (
    <Authorization
      config={nimbleConf}
      setConfig={setNimbleConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="NimbleCRM"
      tutorialLinks={tutorialLinks?.nimble || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://app.nimble.com/api/v1/myself',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: {
          Authorization: 'Bearer {api_key}',
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }}
      noteDetails={{ note: ActiveInstructions }}
      onConnectionSelected={loadFields}
    />
  )
}
