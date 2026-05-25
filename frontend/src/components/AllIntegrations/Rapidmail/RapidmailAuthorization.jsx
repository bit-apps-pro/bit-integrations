/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllRecipient } from './RapidmailCommonFunc'

export default function RapidmailAuthorization({
  rapidmailConf,
  setRapidmailConf,
  step,
  setstep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !rapidmailConf?.default) {
        getAllRecipient(rapidmailConf, setRapidmailConf, setIsLoading, setSnackbar)
      }
      setstep(value)
    },
    [rapidmailConf, setRapidmailConf, setIsLoading, setSnackbar, setstep]
  )

  const note = `
    <h4>${__('Step of creating username and password:', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
        'Goto',
        'bit-integrations'
      )}Goto <a href="https://my.rapidmail.com/api/v3/userlist.html#/">Generate API User</a> and create an api user.</li>
      <li>${__(
        'Copy the <b>Username</b> and paste into <b>Username</b> field of your authorization form.',
        'bit-integrations'
      )}</li>
      <li>${__(
        'Copy the <b>Password</b> and paste into <b>Password</b> field of your authorization form.',
        'bit-integrations'
      )}</li>
      <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
  </ul>
  `

  return (
    <Authorization
      config={rapidmailConf}
      setConfig={setRapidmailConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Rapidmail"
      tutorialLinks={tutorialLinks?.rapidmail || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://apiv3.emailsys.net/v1/apiusers',
        method: 'GET',
        ssl_verify: false
      }}
      noteDetails={{ note }}
    />
  )
}
