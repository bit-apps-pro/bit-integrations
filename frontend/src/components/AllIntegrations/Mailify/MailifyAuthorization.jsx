import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { refreshMailifyList } from './MailifyCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function MailifyAuthorization({
  mailifyConf,
  setMailifyConf,
  step,
  setstep,
  setSnackbar,
  isInfo,
  setIsLoading
}) {
  const loadLists = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...mailifyConf, connection_id: connectionId } : mailifyConf
      refreshMailifyList(nextConf, setMailifyConf, setIsLoading, setSnackbar)
    },
    [mailifyConf, setMailifyConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !mailifyConf?.default?.mailifyLists) {
        loadLists()
      }
      setstep(value)
    },
    [loadLists, mailifyConf?.default?.mailifyLists, setstep]
  )

  const ActiveInstructions = `
            <h4>${__('Get Account Id and Api key', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your Mailify dashboard.', 'bit-integrations')}</li>
                <li>${__(
                  'Click on the "Settings" from Top-Right corner dropdown',
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'Then Click "Developers", Then click "Add an Api Key"',
                  'bit-integrations'
                )}</li>
            </ul>`

  return (
    <Authorization
      config={mailifyConf}
      setConfig={setMailifyConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Mailify (Sarbacane)"
      tutorialLinks={tutorialLinks?.mailify || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://mailifyapis.com/v1/users',
        method: 'GET'
      }}
      noteDetails={{ note: ActiveInstructions }}
      onConnectionSelected={loadLists}
    />
  )
}
