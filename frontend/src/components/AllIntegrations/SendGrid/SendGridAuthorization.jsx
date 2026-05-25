import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { fetchSendGridCustomFields } from './SendGridCommonFunc'

export default function SendGridAuthorization({
  sendGridConf,
  setSendGridConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const refreshCustomFields = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...sendGridConf, connection_id: connectionId } : sendGridConf

      fetchSendGridCustomFields(nextConf, setSendGridConf, loading, setLoading)
    },
    [loading, sendGridConf, setLoading, setSendGridConf]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !sendGridConf?.customFields?.length) {
        refreshCustomFields()
      }

      setStep(value)
    },
    [refreshCustomFields, sendGridConf?.customFields?.length, setStep]
  )

  const note = `
    <small class="d-blk mt-3">
      ${__('To Get API key, Please Visit', 'bit-integrations')}
      <a class="btcd-link" href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noreferrer">
        ${__('SendGrid API Token', 'bit-integrations')}
      </a>
    </small>`

  return (
    <Authorization
      config={sendGridConf}
      setConfig={setSendGridConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="SendGrid"
      tutorialLinks={tutorialLinks?.sendGrid || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.sendgrid.com/v3/marketing/field_definitions',
        method: 'GET'
      }}
      noteDetails={{ note }}
      onConnectionSelected={refreshCustomFields}
    />
  )
}
