/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { fetchCustomFields } from './MailBlusterCommonFunc'

export default function MailBlusterAuthorization({
  mailBlusterConf,
  setMailBlusterConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const loadCustomFields = useCallback(
    async connectionId => {
      const nextConf = connectionId
        ? { ...mailBlusterConf, connection_id: connectionId }
        : mailBlusterConf

      await fetchCustomFields(
        nextConf,
        setMailBlusterConf,
        undefined,
        undefined,
        loading,
        setLoading,
        'refreshCustomFields'
      )
    },
    [mailBlusterConf, setMailBlusterConf, loading, setLoading]
  )

  const handleConnectionSelected = useCallback(
    async connectionId => {
      await loadCustomFields(connectionId)
    },
    [loadCustomFields]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !mailBlusterConf?.customFields?.length) {
        loadCustomFields()
      }

      setStep(value)
    },
    [mailBlusterConf, loadCustomFields, setStep]
  )

  const note = `<h4>${__('Step of generate API token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
        'Goto',
        'bit-integrations'
      )} <a target="_blank" href="https://app.mailbluster.com/vM7N8vG0Pp/settings/api-keys">${__(
        'Generate API Token',
        'bit-integrations'
      )}</a></li>
      <li>${__(
        'Copy the <b>Token</b> and paste into <b>API Token</b> field of your authorization form.',
        'bit-integrations'
      )}</li>
      <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={mailBlusterConf}
      setConfig={setMailBlusterConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="MailBluster"
      tutorialLinks={tutorialLinks?.mailBluster || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.mailbluster.com/api/fields',
        key: 'Authorization',
        addTo: 'header',
        method: 'GET'
      }}
      noteDetails={{ note }}
      onConnectionSelected={handleConnectionSelected}
    />
  )
}
