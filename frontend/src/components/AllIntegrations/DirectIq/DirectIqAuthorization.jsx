/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { refreshDirectIqList } from './DirectIqCommonFunc'

export default function DirectIqAuthorization({
  directIqConf,
  setDirectIqConf,
  step,
  setstep,
  setSnackbar,
  isInfo,
  setIsLoading
}) {
  const loadLists = useCallback(
    connectionId => {
      const nextConf = connectionId
        ? { ...directIqConf, connection_id: connectionId }
        : directIqConf

      refreshDirectIqList(nextConf, setDirectIqConf, setIsLoading, setSnackbar)
    },
    [directIqConf, setDirectIqConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !directIqConf?.default?.directIqLists) {
        loadLists()
      }
      setstep(value)
    },
    [directIqConf, loadLists, setstep]
  )

  const note = `
      <h4>${__('Get client id and client secret key', 'bit-integrations')}</h4>
      <ul>
        <li>${__('First go to your DirectIq dashboard.', 'bit-integrations')}</li>
        <li>${__('Click "Integrations", Then click "API Keys"', 'bit-integrations')}</li>
      </ul>`

  return (
    <Authorization
      config={directIqConf}
      setConfig={setDirectIqConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="DirectIQ"
      tutorialLinks={tutorialLinks?.directIq || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://rest.directiq.com/subscription/authorize',
        method: 'GET'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}
