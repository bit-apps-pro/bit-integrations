import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { fetchAllForm } from './BitFormCommonFunc'

export default function BitFormAuthorization({
  bitFormConf,
  setBitFormConf,
  step,
  setstep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const loadForms = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...bitFormConf, connection_id: connectionId } : bitFormConf

      fetchAllForm(nextConf, setBitFormConf, setIsLoading, setSnackbar)
    },
    [bitFormConf, setBitFormConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !bitFormConf?.default?.forms) {
        loadForms()
      }
      setstep(value)
    },
    [bitFormConf, loadForms, setstep]
  )

  const note = `
      <h4>${__('To get your Bit Form API key', 'bit-integrations')}</h4>
      <ul>
        <li>${__('Open your Bit Form WordPress dashboard.', 'bit-integrations')}</li>
        <li>${__('Go to Integrations and copy your Client ID (API key).', 'bit-integrations')}</li>
      </ul>`

  return (
    <Authorization
      config={bitFormConf}
      setConfig={setBitFormConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Bit Form"
      tutorialLinks={tutorialLinks?.bitForm || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: '{domainName}/wp-json/bitform/v1/forms',
        method: 'GET',
        key: 'Bitform-Api-Key',
        addTo: 'header',
        ssl_verify: false,
        extraFields: [
          {
            name: 'domainName',
            label: __('Domain Name', 'bit-integrations'),
            required: true,
            placeholder: __('https://example.com', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadForms}
    />
  )
}
