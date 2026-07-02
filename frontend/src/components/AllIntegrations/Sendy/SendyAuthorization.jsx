import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllBrand } from './SendyCommonFunc'

export default function SendyAuthorization({
  sendyConf,
  setSendyConf,
  step,
  setstep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const loadBrands = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...sendyConf, connection_id: connectionId } : sendyConf
      getAllBrand(nextConf, setSendyConf, setIsLoading, setSnackbar)
    },
    [sendyConf, setSendyConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !sendyConf?.default?.brandList) {
        loadBrands()
      }
      setstep(value)
    },
    [loadBrands, sendyConf?.default?.brandList, setstep]
  )

  const note = `
  <small class="d-blk mt-5">
    ${__('To get API , Please Visit', 'bit-integrations')}
    <a class="btcd-link" href="https://app.sendy.com/api-key" target="_blank" rel="noreferrer">
      ${__('Sendy API Console', 'bit-integrations')}
    </a>
  </small>
  `

  return (
    <Authorization
      config={sendyConf}
      setConfig={setSendyConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Sendy"
      tutorialLinks={tutorialLinks?.sendy || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: '{sendy_url}/api/brands/get-brands.php',
        method: 'POST',
        payload: { api_key: '{api_key}' },
        key: 'X-BI-Auth',
        addTo: 'header',
        extraFields: [
          {
            name: 'sendy_url',
            label: __('Sendy URL', 'bit-integrations'),
            required: true,
            placeholder: __('https://your-sendy-domain.com', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadBrands}
    />
  )
}
