/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import { refreshCustomFields } from './MailRelayCommonFunc'

export default function MailRelayAuthorization({
  mailRelayConf,
  setMailRelayConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo,
  setSnackbar
}) {
  const loadCustomFields = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...mailRelayConf, connection_id: connectionId } : mailRelayConf
      refreshCustomFields(nextConf, setMailRelayConf, loading, setLoading, setSnackbar)
    },
    [loading, mailRelayConf, setLoading, setMailRelayConf, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !mailRelayConf?.customFields?.length) {
        loadCustomFields()
      }
      setStep(value)
    },
    [loadCustomFields, mailRelayConf?.customFields?.length, setStep]
  )

  const domain = mailRelayConf?.domain || ''

  return (
    <Authorization
      config={mailRelayConf}
      setConfig={setMailRelayConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="MailRelay"
      tutorialLinks={tutorialLinks?.mailRelay || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://{domain}.ipzmarketing.com/api/v1/custom_fields',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: {
          'X-AUTH-TOKEN': '{api_key}',
          'Content-Type': 'application/json'
        },
        extraFields: [
          {
            name: 'domain',
            label: __('Your Domain Name', 'bit-integrations'),
            required: true,
            placeholder: __('e.g. youraccount', 'bit-integrations')
          }
        ],
        encryptKeys: ['value']
      }}
      noteDetails={{
        note: `<small class="d-blk mt-3">${__('Example domain:', 'bit-integrations')} bitapps</small>${
          domain
            ? `<small class="d-blk mt-2">${__('To get API token, visit', 'bit-integrations')} <a class="btcd-link" href="https://${domain}.ipzmarketing.com/admin/api_keys" target="_blank" rel="noreferrer">${__('MailRelay API Token', 'bit-integrations')}</a></small>`
            : ''
        }`
      }}
      onConnectionSelected={loadCustomFields}
    />
  )
}
