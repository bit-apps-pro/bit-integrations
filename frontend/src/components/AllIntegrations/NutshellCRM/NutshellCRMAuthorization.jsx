/* eslint-disable jsx-a11y/anchor-is-valid */
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function NutshellCRMAuthorization({
  nutshellCRMConf,
  setNutshellCRMConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('Get API Token', 'bit-integrations')}</h4>
    <ul>
      <li>${__("Go to your Nutshell CRM's user dashboard", 'bit-integrations')}</li>
      <li>${__('Then select "Settings"', 'bit-integrations')}</li>
      <li>${__('Then go to "API Keys → Add API Key"', 'bit-integrations')}</li>
      <li>${__('Use User Name as Username and API Token as Password in this form.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={nutshellCRMConf}
      setConfig={setNutshellCRMConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Nutshell CRM"
      tutorialLinks={tutorialLinks?.nutshellCRM || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://app.nutshell.com/api/v1/json',
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        payload: '{"method":"getUser","id":"randomstring"}'
      }}
      noteDetails={{ note }}
    />
  )
}
