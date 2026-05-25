import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { refreshModules } from './ZohoRecruitCommonFunc'

export default function ZohoRecruitAuthorization({
  formID,
  recruitConf,
  setRecruitConf,
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

  const scopes = 'ZohoRecruit.users.ALL,ZohoRecruit.modules.all'

  const loadModules = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...recruitConf, connection_id: connectionId } : recruitConf
      refreshModules(formID, nextConf, setRecruitConf, setIsLoading, setSnackbar)
    },
    [formID, recruitConf, setRecruitConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2) {
        loadModules()
      }
      setstep(value)
    },
    [loadModules, setstep]
  )

  const note = `<h4>${__('Zoho Recruit OAuth setup', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Create app in Zoho API Console.', 'bit-integrations')}</li>
    <li>${__('Choose account data center.', 'bit-integrations')}</li>
    <li>${__('Use callback URL shown in connection form.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={recruitConf}
      setConfig={setRecruitConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Zoho Recruit"
      tutorialLinks={tutorialLinks?.zohoRecruit || {}}
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
      onConnectionSelected={loadModules}
    />
  )
}
