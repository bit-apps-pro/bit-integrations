import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { refreshApplications } from './ZohoCreatorCommonFunc'

export default function ZohoCreatorAuthorization({
  formID,
  creatorConf,
  setCreatorConf,
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
    'ZohoCreator.dashboard.READ,ZohoCreator.meta.application.READ,ZohoCreator.meta.form.READ,ZohoCreator.form.CREATE,ZohoCreator.report.CREATE,ZohoCreator.report.UPDATE'

  const loadApplications = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...creatorConf, connection_id: connectionId } : creatorConf

      if (!nextConf.department) {
        refreshApplications(formID, nextConf, setCreatorConf, setIsLoading, setSnackbar)
      }
    },
    [creatorConf, formID, setCreatorConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !creatorConf.department) {
        loadApplications()
      }

      setStep(value)
    },
    [creatorConf.department, loadApplications, setStep]
  )

  const note = `<h4>${__('Zoho Creator OAuth setup', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Create app in Zoho API Console.', 'bit-integrations')}</li>
    <li>${__('Set account screen name as Account Owner field.', 'bit-integrations')}</li>
    <li>${__('Use callback URL shown in connection form.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={creatorConf}
      setConfig={setCreatorConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Zoho Creator"
      tutorialLinks={tutorialLinks?.zohoCreator || {}}
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
            name: 'accountOwner',
            required: true,
            label: __('Owner Name (Zoho Creator screen name)', 'bit-integrations'),
            placeholder: __('Your Zoho Creator screen name', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadApplications}
    />
  )
}
