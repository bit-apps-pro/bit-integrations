import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { refreshCustomFields } from './KeapCommonFunc'

export default function KeapAuthorization({
  formID,
  keapConf,
  setKeapConf,
  step,
  setstep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const loadCustomFields = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...keapConf, connection_id: connectionId } : keapConf
      refreshCustomFields(formID, nextConf, setKeapConf, setIsLoading, setSnackbar)
    },
    [formID, keapConf, setKeapConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !keapConf?.customFields) {
        loadCustomFields()
      }

      setstep(value)
    },
    [keapConf?.customFields, loadCustomFields, setstep]
  )

  const note = `<h4>${__('Get Keap client id and secret', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Go to Keap developer apps page.', 'bit-integrations')}</li>
    <li>${__('Create or open app and copy Client ID and Client Secret.', 'bit-integrations')}</li>
    <li>${__('Use callback URL shown in connection form.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={keapConf}
      setConfig={setKeapConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Keap"
      tutorialLinks={tutorialLinks?.keap || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'header',
        scope: 'full',
        authCodeEndpoint: {
          url: 'https://accounts.infusionsoft.com/app/oauth/authorize',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        },
        tokenEndpoint: {
          url: 'https://api.infusionsoft.com/token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://api.infusionsoft.com/token'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadCustomFields}
    />
  )
}
