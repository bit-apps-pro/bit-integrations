/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { fetchAllBases } from './AirtableCommonFunc'

export default function AirtableAuthorization({
  airtableConf,
  setAirtableConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !airtableConf?.default) {
        fetchAllBases(airtableConf, setAirtableConf, loading, setLoading)
      }
      setStep(value)
    },
    [airtableConf, setAirtableConf, loading, setLoading, setStep]
  )

  const note = `<h4>${__('To get personal access token:', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Visit', 'bit-integrations')} <a href="https://airtable.com/create/tokens" target="_blank">Airtable Personal Access Tokens</a>.</li>
    <li>${__('Create a token with required base/table permissions.', 'bit-integrations')}</li>
    <li>${__('Copy the token and paste it into the Bearer Token field.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={airtableConf}
      setConfig={setAirtableConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Airtable"
      tutorialLinks={tutorialLinks?.airtable || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.airtable.com/v0/meta/bases',
        method: 'GET'
      }}
      noteDetails={{ note }}
    />
  )
}
