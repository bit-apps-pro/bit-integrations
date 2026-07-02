import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { refreshZagoMailList } from './ZagoMailCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function ZagoMailAuthorization({
  zagoMailConf,
  setZagoMailConf,
  step,
  setstep,
  setSnackbar,
  isInfo
}) {
  const loadLists = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...zagoMailConf, connection_id: connectionId } : zagoMailConf
      refreshZagoMailList(nextConf, setZagoMailConf, () => {}, setSnackbar)
    },
    [setSnackbar, setZagoMailConf, zagoMailConf]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !zagoMailConf?.default?.zagoMailLists) {
        loadLists()
      }
      setstep(value)
    },
    [loadLists, setstep, zagoMailConf]
  )

  const note = `
      <h4>${__('Get API Public Key', 'bit-integrations')}</h4>
      <ul>
          <li>${__('First go to your ZagoMail dashboard.', 'bit-integrations')}</li>
          <li>${__('Click on the top top right corner', 'bit-integrations')}</li>
          <li>${__('Then click on API', 'bit-integrations')}</li>
      </ul>
      <small class="d-blk mt-3">
        ${__('To get API Public Key, please visit', 'bit-integrations')}
        <a
          class="btcd-link"
          href="https://app.zagomail.com/user/api-keys/index"
          target="_blank"
          rel="noreferrer">
          ${__(' ZagoMail API Token', 'bit-integrations')}
        </a>
      </small>`

  return (
    <Authorization
      config={zagoMailConf}
      setConfig={setZagoMailConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Zago Mail"
      tutorialLinks={tutorialLinks?.zagoMail || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.zagomail.com/lists/all-lists',
        method: 'POST',
        payload: { publicKey: '{api_key}' }
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}
