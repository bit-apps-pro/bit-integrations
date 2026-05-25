import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllFields } from './MauticCommonFunc'

export default function MauticAuthorization({
  mauticConf,
  setMauticConf,
  step,
  setstep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const loadFields = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...mauticConf, connection_id: connectionId } : mauticConf
      await getAllFields(nextConf, setMauticConf, setIsLoading, setSnackbar)
    },
    [mauticConf, setMauticConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !mauticConf?.default?.fields) {
        loadFields()
      }

      setstep(value)
    },
    [mauticConf, loadFields, setstep]
  )

  const note = `<h4>${__('Mautic OAuth2 Setup', 'bit-integrations')}</h4>
  <ol>
    <li>${__('Open your Mautic account and create an OAuth2 API credential.', 'bit-integrations')}</li>
    <li>${__('Set the callback URL exactly as shown below.', 'bit-integrations')}</li>
    <li>${__('Use your Mautic base URL (example: https://mautic.example.com).', 'bit-integrations')}</li>
  </ol>`

  return (
    <Authorization
      config={mauticConf}
      setConfig={setMauticConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Mautic"
      tutorialLinks={tutorialLinks?.mautic || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        authCodeEndpoint: {
          url: '{baseUrl}/oauth/v2/authorize'
        },
        tokenEndpoint: {
          url: '{baseUrl}/oauth/v2/token',
          method: 'POST'
        },
        refreshTokenUrl: '{baseUrl}/oauth/v2/token',
        extraFields: [
          {
            name: 'baseUrl',
            label: __('Mautic Base URL', 'bit-integrations'),
            required: true,
            placeholder: __('https://mautic.example.com', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadFields}
    />
  )
}
