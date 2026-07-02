/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function LMFWCAuthorization({
  licenseManagerConf,
  setLicenseManagerConf,
  step,
  setStep,
  isInfo
}) {
  const ActiveInstructions = `
            <b>${__('Requirements', 'bit-integrations')}</b>
            <p>${__('WordPress permalinks must be enabled at', 'bit-integrations')}: <b>${__(
              'Settings',
              'bit-integrations'
            )}</b> > <b>${__('Permalinks', 'bit-integrations')}</b></p>
            <h4>${__('To Get Consumer key & Consumer secret', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to "WooCommerce"', 'bit-integrations')}</li>
                <li>${__('Then go to "Settings" page', 'bit-integrations')}</li>
                <li>${__(
                  'Click on "License Manager " from right top corner menu',
                  'bit-integrations'
                )}</li>
                <li>${__('Then click "REST API" from the top sub menu', 'bit-integrations')}</li>
                <li>${__('Then click "Add key" button at the top of the page', 'bit-integrations')}</li>
                <li>${__('FIll the form & click "Generate API Key"', 'bit-integrations')}</li>
            </ul>`

  return (
    <Authorization
      config={licenseManagerConf}
      setConfig={setLicenseManagerConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="License Manager For WooCommerce"
      tutorialLinks={tutorialLinks?.lmfwc || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: '{base_url}/wp-json/lmfwc/v2/licenses',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: authData => ({
          Authorization: `Basic ${btoa(`${authData?.api_key || ''}:${authData?.api_secret || ''}`)}`,
          'Content-Type': 'application/json'
        }),
        extraFields: [
          {
            name: 'base_url',
            label: __('Homepage URL', 'bit-integrations'),
            required: true,
            placeholder: __('Homepage URL...', 'bit-integrations')
          },
          {
            name: 'api_secret',
            label: __('Consumer Secret', 'bit-integrations'),
            required: true,
            placeholder: __('Consumer secret...', 'bit-integrations')
          }
        ],
        encryptKeys: ['value', 'api_secret']
      }}
      noteDetails={{ note: ActiveInstructions }}
    />
  )
}
