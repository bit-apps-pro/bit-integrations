import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { refreshAudience, refreshModules } from './MailChimpCommonFunc'

export default function MailChimpAuthorization({
  formID,
  mailChimpConf,
  setMailChimpConf,
  step,
  setstep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const loadAudience = useCallback(
    async connectionId => {
      const nextConf = connectionId
        ? { ...mailChimpConf, connection_id: connectionId }
        : mailChimpConf

      refreshModules(setMailChimpConf, setIsLoading, setSnackbar)
      refreshAudience(formID, nextConf, setMailChimpConf, setIsLoading, setSnackbar)
    },
    [formID, mailChimpConf, setMailChimpConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !mailChimpConf?.default?.audiencelist) {
        loadAudience()
      }

      setstep(value)
    },
    [loadAudience, mailChimpConf?.default?.audiencelist, setstep]
  )

  const note = `<h4>${__('Get Mailchimp client id and secret', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Open Mailchimp developer API keys/apps page.', 'bit-integrations')}</li>
    <li>${__('Create or open an app and copy Client ID and Client Secret.', 'bit-integrations')}</li>
    <li>${__('Use the callback URL shown in the connection form.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={mailChimpConf}
      setConfig={setMailChimpConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Mail Chimp"
      tutorialLinks={tutorialLinks?.mailchimp || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        authCodeEndpoint: {
          url: 'https://login.mailchimp.com/oauth2/authorize',
          queryParams: {
            response_type: 'code'
          }
        },
        tokenEndpoint: {
          url: 'https://login.mailchimp.com/oauth2/token',
          method: 'POST'
        }
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadAudience}
    />
  )
}
