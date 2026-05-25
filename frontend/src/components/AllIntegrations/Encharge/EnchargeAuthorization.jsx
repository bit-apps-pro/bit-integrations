import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { refreshEnchargeHeader } from './EnchargeCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function EnchargeAuthorization({
  enchargeConf,
  setEnchargeConf,
  step,
  setstep,
  setSnackbar,
  isInfo,
  setIsLoading
}) {
  const loadFields = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...enchargeConf, connection_id: connectionId } : enchargeConf

      refreshEnchargeHeader(nextConf, setEnchargeConf, setIsLoading, setSnackbar)
    },
    [enchargeConf, setEnchargeConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !enchargeConf?.default?.fields) {
        loadFields()
      }
      setstep(value)
    },
    [enchargeConf, loadFields, setstep]
  )

  const note = `
      <small>
        ${__('To get API, please visit', 'bit-integrations')}
        <a
          class="btcd-link"
          href="https://app.encharge.io/account/info"
          target="_blank"
          rel="noreferrer">
          ${__(' Encharge API Console', 'bit-integrations')}
        </a>
      </small>`

  return (
    <Authorization
      config={enchargeConf}
      setConfig={setEnchargeConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Encharge"
      tutorialLinks={tutorialLinks?.encharge || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.encharge.io/v1/accounts/info',
        method: 'GET',
        key: 'X-Encharge-Token',
        addTo: 'header'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadFields}
    />
  )
}
