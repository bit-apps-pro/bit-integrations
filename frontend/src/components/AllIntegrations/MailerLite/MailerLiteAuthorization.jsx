/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { getConnection } from '../../../Utils/connectionApi'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function MailerLiteAuthorization({
  mailerLiteConf,
  setMailerLiteConf,
  step,
  setstep,
  isInfo
}) {
  const syncVersionFromConnection = useCallback(
    async connectionId => {
      const connectionRes = await getConnection(connectionId)
      const version = connectionRes?.success ? connectionRes?.data?.auth_details?.version : ''

      if (version) {
        setMailerLiteConf(prev => ({ ...prev, version }))
      }
    },
    [setMailerLiteConf]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && mailerLiteConf?.connection_id && !mailerLiteConf?.version) {
        syncVersionFromConnection(mailerLiteConf.connection_id)
      }
      setstep(value)
    },
    [mailerLiteConf?.connection_id, mailerLiteConf?.version, setstep, syncVersionFromConnection]
  )

  const note = `
    <h4>${__('Step of generate API token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Goto', 'bit-integrations')} <a href="https://dashboard.mailerlite.com/integrations/api" target="_blank">${__(
        'MailerLite Token Page',
        'bit-integrations'
      )}</a>.</li>
      <li>${__('Choose your API version (Classic or New).', 'bit-integrations')}</li>
      <li>${__(
        'Copy the token and paste it into the API Key field, then click Authorize.',
        'bit-integrations'
      )}</li>
    </ul>
  `

  return (
    <Authorization
      config={mailerLiteConf}
      setConfig={setMailerLiteConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="MailerLite"
      tutorialLinks={tutorialLinks?.mailerLite || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: data =>
          data?.version === 'v2'
            ? 'https://connect.mailerlite.com/api/subscribers'
            : 'https://api.mailerlite.com/api/v2/me',
        method: 'GET',
        key: 'X-Mailerlite-Apikey',
        addTo: 'header',
        headers: data =>
          data?.version === 'v2'
            ? {
                Authorization: 'Bearer {api_key}',
                Accept: 'application/json'
              }
            : {},
        extraFields: [
          {
            name: 'version',
            label: __('MailerLite Version', 'bit-integrations'),
            required: true,
            type: 'select',
            placeholder: __('Select version', 'bit-integrations'),
            options: [
              { label: __('MailerLite Classic (v1)', 'bit-integrations'), value: 'v1' },
              { label: __('MailerLite New (v2)', 'bit-integrations'), value: 'v2' }
            ]
          }
        ]
      }}
      noteDetails={{ note }}
      onConnectionSelected={syncVersionFromConnection}
    />
  )
}
