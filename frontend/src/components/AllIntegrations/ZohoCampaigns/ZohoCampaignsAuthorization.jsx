import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { refreshLists } from './ZohoCampaignsCommonFunc'

export default function ZohoCampaignsAuthorization({
  formID,
  campaignsConf,
  setCampaignsConf,
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

  const scopes = 'ZohoCampaigns.contact.READ,ZohoCampaigns.contact.CREATE,ZohoCampaigns.contact.UPDATE'

  const loadLists = useCallback(
    async connectionId => {
      const nextConf = connectionId
        ? { ...campaignsConf, connection_id: connectionId }
        : campaignsConf
      refreshLists(formID, nextConf, setCampaignsConf, setIsLoading, setSnackbar)
    },
    [campaignsConf, formID, setCampaignsConf, setIsLoading, setSnackbar]
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

  const note = `<h4>${__('Zoho Campaigns OAuth setup', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Create app in Zoho API Console.', 'bit-integrations')}</li>
    <li>${__('Use account data center for auth endpoints.', 'bit-integrations')}</li>
    <li>${__('Use callback URL shown in connection form.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={campaignsConf}
      setConfig={setCampaignsConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Zoho Campaigns"
      tutorialLinks={tutorialLinks?.zohoCampaigns || {}}
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
