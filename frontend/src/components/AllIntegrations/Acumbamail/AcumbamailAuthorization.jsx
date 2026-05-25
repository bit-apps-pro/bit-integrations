import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { fetchAllList } from './AcumbamailCommonFunc'

export default function AcumbamailAuthorization({
  acumbamailConf,
  setAcumbamailConf,
  step,
  setstep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const loadLists = useCallback(
    connectionId => {
      const nextConf = connectionId
        ? { ...acumbamailConf, connection_id: connectionId }
        : acumbamailConf
      fetchAllList(nextConf, setAcumbamailConf, setIsLoading, setSnackbar)
    },
    [acumbamailConf, setAcumbamailConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !acumbamailConf?.default?.allLists) {
        loadLists()
      }
      setstep(value)
    },
    [acumbamailConf?.default?.allLists, loadLists, setstep]
  )

  const note = `
    <small class="d-blk mt-3">
      ${__('To get your auth token, please visit', 'bit-integrations')}
      <a class="btcd-link" href="https://acumbamail.com/en/apidoc/" target="_blank" rel="noreferrer">
        ${__(' Acumbamail API docs', 'bit-integrations')}
      </a>
    </small>`

  return (
    <Authorization
      config={acumbamailConf}
      setConfig={setAcumbamailConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Acumbamail"
      tutorialLinks={tutorialLinks?.acumbamail || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://acumbamail.com/api/1/getSubscribers/',
        method: 'POST',
        key: 'auth_token',
        addTo: 'query'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}
