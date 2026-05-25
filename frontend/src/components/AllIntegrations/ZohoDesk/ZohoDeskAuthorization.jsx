import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { refreshOrganizations } from './ZohoDeskCommonFunc'

export default function ZohoDeskAuthorization({
  formID,
  deskConf,
  setDeskConf,
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

  const scopes =
    'Desk.settings.READ,Desk.basic.READ,Desk.search.READ,Desk.contacts.READ,Desk.contacts.CREATE,Desk.contacts.UPDATE,Desk.tickets.CREATE,Desk.tickets.UPDATE'

  const loadOrganizations = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...deskConf, connection_id: connectionId } : deskConf
      refreshOrganizations(formID, nextConf, setDeskConf, setIsLoading, setSnackbar)
    },
    [deskConf, formID, setDeskConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2) {
        loadOrganizations()
      }
      setstep(value)
    },
    [loadOrganizations, setstep]
  )

  const note = `<h4>${__('Zoho Desk OAuth setup', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Create app in Zoho API Console.', 'bit-integrations')}</li>
    <li>${__('Choose correct data center.', 'bit-integrations')}</li>
    <li>${__('Use callback URL shown in connection form.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={deskConf}
      setConfig={setDeskConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Zoho Desk"
      tutorialLinks={tutorialLinks?.zohoDesk || {}}
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
      onConnectionSelected={loadOrganizations}
    />
  )
}
