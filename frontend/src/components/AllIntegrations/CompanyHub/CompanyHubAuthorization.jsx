/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { getAllCompanies, getAllContacts } from './CompanyHubCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function CompanyHubAuthorization({
  companyHubConf,
  setCompanyHubConf,
  step,
  setStep,
  isInfo
}) {
  const loadMetadata = useCallback(
    connectionId => {
      const nextConf = connectionId
        ? { ...companyHubConf, connection_id: connectionId }
        : companyHubConf

      getAllCompanies(nextConf, setCompanyHubConf, () => {})
      getAllContacts(nextConf, setCompanyHubConf, () => {})
    },
    [companyHubConf, setCompanyHubConf]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && (!companyHubConf?.companies || !companyHubConf?.contacts)) {
        loadMetadata()
      }
      setStep(value)
    },
    [companyHubConf, loadMetadata, setStep]
  )

  const note = `
      <h4>${__('To get Sub Domain & API Key', 'bit-integrations')}</h4>
      <ul>
          <li>${__('First go to your CompanyHub dashboard.', 'bit-integrations')}</li>
          <li>${__('Click Settings from the left-bottom corner.', 'bit-integrations')}</li>
          <li>${__('Then click Integrations and generate API key.', 'bit-integrations')}</li>
      </ul>
      <small class="d-blk mt-3">
        ${__('To get Sub Domain & API Key, please visit', 'bit-integrations')}
        <a class="btcd-link" href="https://app.companyhub.com/settings/integration" target="_blank">
          ${__(' CompanyHub Sub Domain & API Key', 'bit-integrations')}
        </a>
      </small>`

  return (
    <Authorization
      config={companyHubConf}
      setConfig={setCompanyHubConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="CompanyHub"
      tutorialLinks={tutorialLinks?.companyHub || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.companyhub.com/v1/me',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: {
          Authorization: '{sub_domain} {api_key}',
          'Content-Type': 'application/json'
        },
        extraFields: [
          {
            name: 'sub_domain',
            label: __('Sub Domain', 'bit-integrations'),
            required: true,
            placeholder: __('your-sub-domain', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadMetadata}
    />
  )
}
