import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { refreshLists } from './ZohoMarketingHubCommonFunc'

export default function ZohoMarketingAuthorization({
  formID,
  marketingHubConf,
  setMarketingHubConf,
  step,
  setstep,
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

  const scopes = 'ZohoMarketingHub.lead.READ,ZohoMarketingHub.lead.CREATE,ZohoMarketingHub.lead.UPDATE'

  const loadLists = useCallback(
    async connectionId => {
      const nextConf = connectionId
        ? { ...marketingHubConf, connection_id: connectionId }
        : marketingHubConf
      refreshLists(formID, nextConf, setMarketingHubConf, setIsLoading, setSnackbar)
    },
    [formID, marketingHubConf, setMarketingHubConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2) {
        loadLists()
      }
      setstep(value)
    },
    [loadLists, setstep]
  )

  const note = `<h4>${__('Zoho Marketing Hub OAuth setup', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Create app in Zoho API Console.', 'bit-integrations')}</li>
    <li>${__('Choose matching data center.', 'bit-integrations')}</li>
    <li>${__('Use callback URL shown in connection form.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={marketingHubConf}
      setConfig={setMarketingHubConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Zoho Marketing Automation (Zoho Marketing Hub)"
      tutorialLinks={tutorialLinks?.zohoMarketingHub || {}}
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
          }
        ]
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}
