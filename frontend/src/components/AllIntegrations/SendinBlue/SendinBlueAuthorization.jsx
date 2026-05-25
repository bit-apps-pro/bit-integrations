import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { refreshLists } from './SendinBlueCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function SendinBlueAuthorization({
  sendinBlueConf,
  setSendinBlueConf,
  step,
  setstep,
  setSnackbar,
  isInfo
}) {
  const loadLists = useCallback(
    connectionId => {
      const nextConf = connectionId
        ? { ...sendinBlueConf, connection_id: connectionId }
        : sendinBlueConf

      refreshLists(nextConf, setSendinBlueConf, () => {}, setSnackbar)
    },
    [sendinBlueConf, setSendinBlueConf, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !sendinBlueConf?.default?.sblueList) {
        loadLists()
      }
      setstep(value)
    },
    [loadLists, sendinBlueConf, setstep]
  )

  const note = `
      <small class="d-blk mt-5">
        ${__('To get API, please visit', 'bit-integrations')}
        <a
          class="btcd-link"
          href="https://account.sendinblue.com/advanced/api"
          target="_blank"
          rel="noreferrer">
          ${__(' Brevo(Sendinblue) API Console', 'bit-integrations')}
        </a>
      </small>`

  return (
    <Authorization
      config={sendinBlueConf}
      setConfig={setSendinBlueConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Brevo (Sendinblue)"
      tutorialLinks={tutorialLinks?.sendinBlue || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.sendinblue.com/v3/account',
        method: 'GET',
        key: 'api-key',
        addTo: 'header'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}
