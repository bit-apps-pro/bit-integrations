import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { getAllList } from './ElasticEmailCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function ElasticEmailAuthorization({
  elasticEmailConf,
  setElasticEmailConf,
  step,
  setstep,
  isInfo
}) {
  const loadLists = useCallback(
    connectionId => {
      const nextConf = connectionId
        ? { ...elasticEmailConf, connection_id: connectionId }
        : elasticEmailConf

      getAllList(nextConf, setElasticEmailConf, () => {})
    },
    [elasticEmailConf, setElasticEmailConf]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !elasticEmailConf?.default?.lists) {
        loadLists()
      }
      setstep(value)
    },
    [elasticEmailConf, loadLists, setstep]
  )

  const note = `
      <small class="d-blk mt-5">
        ${__('To get API, please visit', 'bit-integrations')}
        <a
          class="btcd-link"
          href="https://elasticemail.com/account#/settings/new/manage-api"
          target="_blank"
          rel="noreferrer">
          ${__(' Elastic Email API Console', 'bit-integrations')}
        </a>
      </small>`

  return (
    <Authorization
      config={elasticEmailConf}
      setConfig={setElasticEmailConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Elastic Email"
      tutorialLinks={tutorialLinks?.elasticEmail || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.elasticemail.com/v4/lists',
        method: 'GET',
        key: 'X-ElasticEmail-ApiKey',
        addTo: 'header'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}
