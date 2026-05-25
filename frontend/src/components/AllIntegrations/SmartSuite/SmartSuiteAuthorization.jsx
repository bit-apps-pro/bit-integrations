/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllSolutions } from './SmartSuiteCommonFunc'

export default function SmartSuiteAuthorization({
  smartSuiteConf,
  setSmartSuiteConf,
  step,
  setStep,
  setLoading,
  isInfo
}) {
  const loadSolutions = useCallback(
    async connectionId => {
      const nextConf = connectionId
        ? { ...smartSuiteConf, connection_id: connectionId }
        : smartSuiteConf

      await getAllSolutions(nextConf, setSmartSuiteConf, setLoading)
    },
    [smartSuiteConf, setSmartSuiteConf, setLoading]
  )

  const handleConnectionSelected = useCallback(
    async connectionId => {
      await loadSolutions(connectionId)
    },
    [loadSolutions]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !smartSuiteConf?.solutions?.length) {
        loadSolutions()
      }

      setStep(value)
    },
    [smartSuiteConf, loadSolutions, setStep]
  )

  const ActiveInstructions = `<h4>${__('To Get Workspace ID & API Token', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your SmartSuite dashboard.', 'bit-integrations')}</li>
                <li>${__('Click go to Profile Icon from Right Top corner.', 'bit-integrations')}</li>
                <li>${__('Then Click "API Key" from the "My Profile Menu".', 'bit-integrations')}</li>
                <li>${__('Then Click and Copy the "Hidden Api Token".', 'bit-integrations')}</li>
                <li>${__(
                  'Your Workspace Id is the 8 characters that follow https://app.smartsuite.com/ in the SmartSuite URL when you are logged in.',
                  'bit-integrations'
                )}</li>
            </ul>`

  return (
    <Authorization
      config={smartSuiteConf}
      setConfig={setSmartSuiteConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="SmartSuite"
      tutorialLinks={tutorialLinks?.smartSuite || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://app.smartsuite.com/api/v1/solutions/',
        key: 'token',
        addTo: 'query',
        method: 'GET',
        headers: {
          'ACCOUNT-ID': '{workspaceId}',
          Authorization: 'Token {api_key}',
          'Content-Type': 'application/json'
        },
        extraFields: [
          {
            name: 'workspaceId',
            label: 'Workspace ID',
            required: true,
            placeholder: 'Workspace ID...'
          }
        ]
      }}
      noteDetails={{ note: ActiveInstructions }}
      onConnectionSelected={handleConnectionSelected}
    />
  )
}
