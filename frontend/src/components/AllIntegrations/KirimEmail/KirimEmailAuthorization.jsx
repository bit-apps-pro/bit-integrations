import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllList } from './KirimEmailCommonFunc'

export default function KirmilEmailAuthorization({
  kirimEmailConf,
  setKirimEmailConf,
  step,
  setstep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const loadLists = useCallback(
    async connectionId => {
      const nextConf = connectionId ? { ...kirimEmailConf, connection_id: connectionId } : kirimEmailConf

      await getAllList(nextConf, setKirimEmailConf, setIsLoading, setSnackbar)
    },
    [kirimEmailConf, setKirimEmailConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !kirimEmailConf?.default?.allLists?.length) {
        loadLists()
      }

      setstep(value)
    },
    [kirimEmailConf?.default?.allLists?.length, loadLists, setstep]
  )

  const note = `<h4>${__('Get Kirim Email credentials', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Log in to your Kirim Email account.', 'bit-integrations')}</li>
      <li>${__('Copy your username and App API key.', 'bit-integrations')}</li>
      <li>${__('Authorize and save the connection.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={kirimEmailConf}
      setConfig={setKirimEmailConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Kirim Email"
      tutorialLinks={tutorialLinks?.kirimEmail || {}}
      authDetails={{
        authType: AUTH_TYPES.CUSTOM,
        apiEndpoint: 'https://api.kirim.email/v3/list',
        method: 'GET',
        encryptKeys: ['api_key'],
        extraFields: [
          {
            name: 'userName',
            label: __('Your username', 'bit-integrations'),
            placeholder: __('username...', 'bit-integrations'),
            required: true
          },
          {
            name: 'api_key',
            label: __('App api key', 'bit-integrations'),
            placeholder: __('Api key...', 'bit-integrations'),
            required: true
          }
        ]
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}
