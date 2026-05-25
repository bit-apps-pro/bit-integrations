/* eslint-disable jsx-a11y/anchor-is-valid */
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import Authorization from '../../Connections/Authorization'

export default function SystemeIOAuthorization({
  systemeIOConf,
  setSystemeIOConf,
  step,
  setStep,
  isInfo
}) {
  const activeInstructions = `
            <h4>${__('To Get API Key & API Secret', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your SystemeIO dashboard.', 'bit-integrations')}</li>
                <li>${__('Click go to "Settings" from Right Top corner', 'bit-integrations')}</li>
                <li>${__(
                  'Then Click "Public API Keys" from the "Settings Menu"',
                  'bit-integrations'
                )}</li>
                <li>${__('Then Click "Create Api key"', 'bit-integrations')}</li>
                <li>${__('Then copy "API Token"', 'bit-integrations')}</li>
            </ul>`

  return (
    <Authorization
      config={systemeIOConf}
      setConfig={setSystemeIOConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="SystemeIO"
      tutorialLinks={tutorialLinks?.systemeIO || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.systeme.io/api/contacts',
        method: 'GET',
        key: 'x-api-key'
      }}
      noteDetails={{
        note: activeInstructions
      }}
    />
  )
}
