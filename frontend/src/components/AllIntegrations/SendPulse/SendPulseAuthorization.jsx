/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { refreshSendPulseList } from './SendPulseCommonFunc'

export default function SendPulseAuthorization({
  sendPulseConf,
  setSendPulseConf,
  step,
  setstep,
  setSnackbar,
  isInfo,
  setIsLoading
}) {
  const loadLists = useCallback(
    connectionId => {
      const nextConf = connectionId
        ? { ...sendPulseConf, connection_id: connectionId }
        : sendPulseConf

      refreshSendPulseList(nextConf, setSendPulseConf, setIsLoading, setSnackbar)
    },
    [sendPulseConf, setSendPulseConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !sendPulseConf?.default?.sendPulseLists) {
        loadLists()
      }
      setstep(value)
    },
    [sendPulseConf, loadLists, setstep]
  )

  const note = `
      <h4>${__('Get client id and client secret key', 'bit-integrations')}</h4>
      <ul>
        <li>${__('First go to your SendPulse dashboard.', 'bit-integrations')}</li>
        <li>${__('Click "Integrations", Then click "API Keys"', 'bit-integrations')}</li>
      </ul>`

  return (
    <Authorization
      config={sendPulseConf}
      setConfig={setSendPulseConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="SendPulse"
      tutorialLinks={tutorialLinks?.sendPulse || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'client_credentials',
        clientAuthentication: 'body',
        tokenEndpoint: {
          url: 'https://api.sendpulse.com/oauth/access_token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://api.sendpulse.com/oauth/access_token'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}
