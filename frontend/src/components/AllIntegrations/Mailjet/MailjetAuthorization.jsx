/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllLists } from './MailjetCommonFunc'

export default function MailjetAuthorization({
  mailjetConf,
  setMailjetConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const loadLists = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...mailjetConf, connection_id: connectionId } : mailjetConf
      await getAllLists(nextConf, setMailjetConf, loading, setLoading, 'fetch')
    },
    [mailjetConf, setMailjetConf, loading, setLoading]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !(mailjetConf?.lists || []).length) {
        loadLists()
      }
      setStep(value)
    },
    [mailjetConf, loadLists, setStep]
  )

  const note = `
    <h4>${__('To Get API key & Secret Key', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Open your Mailjet account API keys page.', 'bit-integrations')}</li>
      <li>${__('Use API Key as Username and Secret Key as Password in this form.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={mailjetConf}
      setConfig={setMailjetConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Mailjet"
      tutorialLinks={tutorialLinks?.mailjet || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://api.mailjet.com/v3/REST/contactslist?Limit=1',
        method: 'GET'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}
