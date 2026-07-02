/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { fetchAllLists } from './EmailOctopusCommonFunc'

export default function EmailOctopusAuthorization({
  emailOctopusConf,
  setEmailOctopusConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !emailOctopusConf?.default) {
        fetchAllLists(emailOctopusConf, setEmailOctopusConf, loading, setLoading)
      }
      setStep(value)
    },
    [emailOctopusConf, setEmailOctopusConf, loading, setLoading, setStep]
  )

  const note = `<h4>${__('To get API key:', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Visit', 'bit-integrations')} <a href="https://emailoctopus.com/api-documentation" target="_blank">EmailOctopus API documentation</a>.</li>
    <li>${__('Generate/copy your API key and paste it into the Bearer Token field.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={emailOctopusConf}
      setConfig={setEmailOctopusConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="EmailOctopus"
      tutorialLinks={tutorialLinks?.emailOctopus || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://emailoctopus.com/api/1.6/lists?api_key={token}',
        method: 'GET'
      }}
      noteDetails={{ note }}
    />
  )
}
