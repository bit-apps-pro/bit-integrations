import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function ClinchPadAuthorization({
  clinchPadConf,
  setClinchPadConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('Get API token', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Go to your ClinchPad account settings.', 'bit-integrations')}</li>
      <li>${__('Open API token section and copy the token.', 'bit-integrations')}</li>
      <li>${__('Paste the token and authorize.', 'bit-integrations')}</li>
    </ul>
    <small class="d-blk mt-3">
      ${__('To get API token, visit', 'bit-integrations')}
      <a class="btcd-link" href="https://clinchpad.com/#settings" target="_blank" rel="noreferrer">
        ${__('ClinchPad Settings', 'bit-integrations')}
      </a>
    </small>
  `

  return (
    <Authorization
      config={clinchPadConf}
      setConfig={setClinchPadConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="ClinchPad"
      tutorialLinks={tutorialLinks?.clinchPad || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://www.clinchpad.com/api/v1/users',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: authData => ({
          Authorization: `Basic ${btoa(`api-key:${authData.api_key || ''}`)}`
        })
      }}
      noteDetails={{ note }}
    />
  )
}
