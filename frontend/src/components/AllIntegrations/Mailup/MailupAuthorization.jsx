import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { fetchAllList } from './MailupCommonFunc'

export default function MailupAuthorization({
  mailupConf,
  setMailupConf,
  step,
  setStep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const loadLists = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...mailupConf, connection_id: connectionId } : mailupConf
      fetchAllList(nextConf, setMailupConf, setIsLoading, setSnackbar)
    },
    [mailupConf, setMailupConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !mailupConf?.allList?.length) {
        loadLists()
      }

      setStep(value)
    },
    [loadLists, mailupConf?.allList?.length, setStep]
  )

  const note = `<h4>${__('Get Mailup client id and secret', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Go to Mailup developer settings and create or open your app.', 'bit-integrations')}</li>
    <li>${__('Copy Client ID and Client Secret.', 'bit-integrations')}</li>
    <li>${__('Use callback URL shown in connection form.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={mailupConf}
      setConfig={setMailupConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="MailUp"
      tutorialLinks={tutorialLinks?.mailup || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'header',
        authCodeEndpoint: {
          url: 'https://services.mailup.com/Authorization/OAuth/LogOn',
          queryParams: {
            response_type: 'code'
          }
        },
        tokenEndpoint: {
          url: 'https://services.mailup.com/Authorization/OAuth/Token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://services.mailup.com/Authorization/OAuth/Token'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}
