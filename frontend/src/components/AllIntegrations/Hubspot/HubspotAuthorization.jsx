/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function HubspotAuthorization({
  hubspotConf,
  setHubspotConf,
  step,
  setstep,
  isInfo
}) {
  const note = `
    <h4>${__('Step of generating Access Token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
        'Login to your HubSpot account, click the <b>Settings</b> icon settings in the main navigation bar..',
        'bit-integrations'
      )}</li>
      <li>${__(
        'In the left sidebar menu, navigate to <b>Integrations > Private App</b>.',
        'bit-integrations'
      )}</li>
      <li>${__('Give name and description and select all necessary scope.', 'bit-integrations')}</li>
      <li>${__('Then create Access token.', 'bit-integrations')}</li>
  </ul>
  `

  return (
    <Authorization
      config={hubspotConf}
      setConfig={setHubspotConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="HubSpot"
      tutorialLinks={tutorialLinks?.hubspot || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.hubapi.com/crm/v3/objects/contacts',
        method: 'GET'
      }}
      noteDetails={{ note }}
    />
  )
}
