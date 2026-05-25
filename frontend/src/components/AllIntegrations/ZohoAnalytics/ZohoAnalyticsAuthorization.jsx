import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { refreshWorkspaces } from './ZohoAnalyticsCommonFunc'

export default function ZohoAnalyticsAuthorization({
  formID,
  analyticsConf,
  setAnalyticsConf,
  step,
  setStep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const dataCenterOptions = [
    { value: 'com', label: 'zoho.com' },
    { value: 'eu', label: 'zoho.eu' },
    { value: 'com.cn', label: 'zoho.com.cn' },
    { value: 'in', label: 'zoho.in' },
    { value: 'com.au', label: 'zoho.com.au' }
  ]

  const scopes =
    'ZohoAnalytics.metadata.read,ZohoAnalytics.data.read,ZohoAnalytics.data.create,ZohoAnalytics.data.update,ZohoAnalytics.usermanagement.read,ZohoAnalytics.share.create'

  const loadWorkspaces = useCallback(
    async connectionId => {
      const nextConf = connectionId
        ? { ...analyticsConf, connection_id: connectionId }
        : analyticsConf
      refreshWorkspaces(formID, nextConf, setAnalyticsConf, setIsLoading, setSnackbar)
    },
    [analyticsConf, formID, setAnalyticsConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !analyticsConf?.default?.workspaces) {
        loadWorkspaces()
      }
      setStep(value)
    },
    [analyticsConf?.default?.workspaces, loadWorkspaces, setStep]
  )

  const note = `<h4>${__('Zoho Analytics OAuth setup', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Create app in Zoho API Console.', 'bit-integrations')}</li>
    <li>${__('Add workspace owner email in connection form.', 'bit-integrations')}</li>
    <li>${__('Use callback URL shown in connection form.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={analyticsConf}
      setConfig={setAnalyticsConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Zoho Analytics"
      tutorialLinks={tutorialLinks?.analytics || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        scope: scopes,
        authCodeEndpoint: {
          url: 'https://accounts.zoho.{dataCenter}/oauth/v2/auth',
          queryParams: {
            prompt: 'Consent',
            access_type: 'offline'
          }
        },
        tokenEndpoint: {
          url: 'https://accounts.zoho.{dataCenter}/oauth/v2/token',
          method: 'POST'
        },
        refreshTokenUrl: 'https://accounts.zoho.{dataCenter}/oauth/v2/token',
        extraFields: [
          {
            name: 'dataCenter',
            type: 'select',
            required: true,
            label: __('Data Center', 'bit-integrations'),
            options: dataCenterOptions
          },
          {
            name: 'ownerEmail',
            type: 'email',
            required: true,
            label: __('Zoho Analytics Owner Email', 'bit-integrations'),
            placeholder: __('Owner Email', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadWorkspaces}
    />
  )
}
