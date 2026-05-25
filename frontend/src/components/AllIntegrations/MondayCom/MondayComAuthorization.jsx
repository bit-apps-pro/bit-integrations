import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllBoards } from './MondayComCommonFunc'

export default function MondayComAuthorization({
  mondayComConf,
  setMondayComConf,
  step,
  setStep,
  setLoading,
  isInfo
}) {
  const loadBoards = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...mondayComConf, connection_id: connectionId } : mondayComConf
      getAllBoards(nextConf, setMondayComConf, setLoading)
    },
    [mondayComConf, setMondayComConf, setLoading]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !mondayComConf?.boards?.length) {
        loadBoards()
      }

      setStep(value)
    },
    [loadBoards, mondayComConf?.boards?.length, setStep]
  )

  const note = `
    <h4>${__('To Get Monday.com API Token', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Log in to your Monday.com account.', 'bit-integrations')}</li>
      <li>${__('Click on your avatar in the bottom left corner.', 'bit-integrations')}</li>
      <li>${__('Select Developers → API Token.', 'bit-integrations')}</li>
      <li>${__('Copy your personal API token (v2).', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={mondayComConf}
      setConfig={setMondayComConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Monday.com"
      tutorialLinks={tutorialLinks?.mondayCom || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.monday.com/v2',
        method: 'POST',
        key: 'Authorization',
        addTo: 'header',
        headers: {
          'Content-Type': 'application/json',
          'API-Version': '2023-10'
        },
        payload: '{"query":"query { me { id } }"}'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadBoards}
    />
  )
}
