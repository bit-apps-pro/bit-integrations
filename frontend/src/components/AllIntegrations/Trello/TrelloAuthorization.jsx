import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { fetchAllBoard } from './TrelloCommonFunc'

export default function TrelloAuthorization({
  trelloConf,
  setTrelloConf,
  step,
  setstep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const loadBoards = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...trelloConf, connection_id: connectionId } : trelloConf
      fetchAllBoard(nextConf, setTrelloConf, setIsLoading, setSnackbar)
    },
    [setIsLoading, setSnackbar, setTrelloConf, trelloConf]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !trelloConf?.default?.allBoardlist?.length) {
        loadBoards()
      }

      setstep(value)
    },
    [loadBoards, setstep, trelloConf?.default?.allBoardlist?.length]
  )

  const note = `<h4>${__('Get Trello OAuth details', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Open Trello API key page and copy your API key.', 'bit-integrations')}</li>
    <li>${__('Use the callback/return URL from this form when generating your user token.', 'bit-integrations')}</li>
    <li>${__('Authorize and save the connection, then continue to map fields.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={trelloConf}
      setConfig={setTrelloConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Trello"
      tutorialLinks={tutorialLinks?.trello || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH1,
        apiEndpoint: 'https://api.trello.com/1/members/me',
        method: 'GET',
        addTo: 'query',
        consumerKeyParam: 'key',
        tokenParam: 'token',
        responseTokenField: 'token',
        callbackUrlParam: 'return_url',
        requireClientSecret: false,
        clientIdLabel: __('Client ID (API Key):', 'bit-integrations'),
        callbackLabel: __('Return URL:', 'bit-integrations'),
        authCodeEndpoint: {
          url: 'https://trello.com/1/authorize',
          queryParams: {
            expiration: 'never',
            name: 'Bit Integrations',
            scope: 'read,write',
            response_type: 'token'
          }
        }
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadBoards}
    />
  )
}
