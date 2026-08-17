/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { fetchDripAccounts } from './DripCommonFunc'

export default function DripAuthorization({ dripConf, setDripConf, step, setstep, isInfo, setLoading }) {
  const loadAccounts = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...dripConf, connection_id: connectionId } : dripConf
      await fetchDripAccounts(nextConf, setDripConf, setLoading, 'fetch')
    },
    [dripConf, setDripConf, setLoading]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !(dripConf?.accounts || []).length) {
        loadAccounts()
      }
      setstep(value)
    },
    [dripConf, loadAccounts, setstep]
  )

  const note = `
    <h4>${__('Get Drip Api Token', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
        'First go to your',
        'bit-integrations'
      )} <a href="https://www.getdrip.com/user/edit" target="_blank">${__(
        'Drip user settings',
        'bit-integrations'
      )}</a>.</li>
      <li>${__('Copy the API Token from "User Info".', 'bit-integrations')}</li>
      <li>${__(
        'Use that token as Username in the authorization form and keep Password empty.',
        'bit-integrations'
      )}</li>
    </ul>`

  return (
    <Authorization
      config={dripConf}
      setConfig={setDripConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Drip"
      tutorialLinks={tutorialLinks?.drip || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://api.getdrip.com/v2/accounts',
        method: 'GET',
        allowEmptyPassword: true
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadAccounts}
    />
  )
}
