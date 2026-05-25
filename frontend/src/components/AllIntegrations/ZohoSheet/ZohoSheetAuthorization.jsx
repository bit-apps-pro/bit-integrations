import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllWorkbooks } from './ZohoSheetCommonFunc'

export default function ZohoSheetAuthorization({
  zohoSheetConf,
  setZohoSheetConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const dataCenterOptions = [
    { value: 'com', label: 'zoho.com' },
    { value: 'eu', label: 'zoho.eu' },
    { value: 'com.cn', label: 'zoho.com.cn' },
    { value: 'in', label: 'zoho.in' },
    { value: 'com.au', label: 'zoho.com.au' }
  ]

  const scope = 'ZohoSheet.dataAPI.READ,ZohoSheet.dataAPI.UPDATE'

  const loadWorkbooks = useCallback(
    async connectionId => {
      const nextConf = connectionId
        ? { ...zohoSheetConf, connection_id: connectionId }
        : zohoSheetConf
      if (!nextConf?.workbooks?.length) {
        getAllWorkbooks(nextConf, setZohoSheetConf, loading, setLoading)
      }
    },
    [loading, setLoading, setZohoSheetConf, zohoSheetConf]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !zohoSheetConf?.workbooks?.length) {
        loadWorkbooks()
      }
      setStep(value)
    },
    [loadWorkbooks, setStep, zohoSheetConf?.workbooks?.length]
  )

  const note = `<h4>${__('Zoho Sheet OAuth setup', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Create app in Zoho API Console.', 'bit-integrations')}</li>
    <li>${__('Select account data center.', 'bit-integrations')}</li>
    <li>${__('Use callback URL shown in connection form.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={zohoSheetConf}
      setConfig={setZohoSheetConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Zoho Sheet"
      tutorialLinks={tutorialLinks?.zohoSheet || {}}
      authDetails={{
        authType: AUTH_TYPES.OAUTH2,
        grantType: 'authorization_code',
        clientAuthentication: 'body',
        scope,
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
      onConnectionSelected={loadWorkbooks}
    />
  )
}
