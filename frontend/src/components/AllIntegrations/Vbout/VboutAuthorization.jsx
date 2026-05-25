/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllLists } from './VboutCommonFunc'

export default function VboutAuthorization({
  vboutConf,
  setVboutConf,
  step,
  setstep,
  loading,
  setLoading,
  isInfo
}) {
  const loadLists = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...vboutConf, connection_id: connectionId } : vboutConf
      getAllLists(nextConf, setVboutConf, loading, setLoading)
    },
    [vboutConf, setVboutConf, loading, setLoading]
  )

  const handleConnectionSelected = useCallback(
    async connectionId => {
      loadLists(connectionId)
    },
    [loadLists]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !vboutConf?.default && !vboutConf?.list_id) {
        loadLists()
      }
      setstep(value)
    },
    [vboutConf, loadLists, setstep]
  )

  return (
    <Authorization
      config={vboutConf}
      setConfig={setVboutConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="VBOUT"
      tutorialLinks={tutorialLinks?.vbout || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.vbout.com/1/app/me.json',
        method: 'POST',
        key: 'key',
        addTo: 'query'
      }}
      noteDetails={{ note }}
      onConnectionSelected={handleConnectionSelected}
    />
  )
}

const note = `
  <h4>${__('Step of get API Key:', 'bit-integrations')}</h4>
  <ul>
    <li>${__(
      'Goto Settings and click on',
      'bit-integrations'
    )} <a href="https://app.vbout.com/Settings">${__('API Integrations', 'bit-integrations')}</a></li>
    <li>${__(
      'Copy the <b>Key</b> and paste into <b>API Key</b> field of your authorization form.',
      'bit-integrations'
    )}</li>
    <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
</ul>
`
