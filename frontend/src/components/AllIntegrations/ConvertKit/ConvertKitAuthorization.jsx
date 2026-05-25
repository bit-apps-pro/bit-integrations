import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __, sprintf } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { refreshConvertKitForm } from './ConvertKitCommonFunc'

export default function ConvertKitAuthorization({
  convertKitConf,
  setConvertKitConf,
  step,
  setstep,
  setSnackbar,
  isInfo,
  setIsLoading
}) {
  const loadForms = useCallback(
    connectionId => {
      const nextConf = connectionId
        ? { ...convertKitConf, connection_id: connectionId }
        : convertKitConf

      refreshConvertKitForm(nextConf, setConvertKitConf, setIsLoading, setSnackbar)
    },
    [convertKitConf, setConvertKitConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !convertKitConf?.default?.convertKitForms) {
        loadForms()
      }
      setstep(value)
    },
    [convertKitConf, loadForms, setstep]
  )

  const note = `
            <h4>${__('Get api secret key', 'bit-integrations')}</h4>
            <ul>
                <li>${sprintf(
                  __('First go to your %s dashboard.', 'bit-integrations'),
                  'Kit(ConvertKit)'
                )}</li>
                <li>${__('Click "Settings", Then click "Advanced"', 'bit-integrations')}</li>
            </ul>`

  return (
    <Authorization
      config={convertKitConf}
      setConfig={setConvertKitConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="ConvertKit"
      tutorialLinks={tutorialLinks?.convertKit || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.convertkit.com/v3/account',
        method: 'GET',
        key: 'api_secret',
        addTo: 'query'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadForms}
    />
  )
}
