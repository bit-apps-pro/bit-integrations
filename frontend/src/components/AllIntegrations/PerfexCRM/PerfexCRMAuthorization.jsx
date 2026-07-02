/* eslint-disable jsx-a11y/anchor-is-valid */
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function PerfexCRMAuthorization({
  perfexCRMConf,
  setPerfexCRMConf,
  step,
  setStep,
  isInfo
}) {
  const note = `
    <h4>${__('Get API Token', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
        "Go to your Perfex CRM's Admin area and select the following menu item: <b>SETUP → MODULES</b>.",
        'bit-integrations'
      )}</li>
      <li>${__(
        'Select the extracted upload.zip at Module installation selection prompt and press <b>INSTALL</b>.',
        'bit-integrations'
      )}</li>
      <li>${__(
        'Find the newly installed module in the list, press <b>ACTIVATE</b> and enter your license key.',
        'bit-integrations'
      )}</li>
      <li>${__(
        "Go to your Perfex's CRM backend as an admin, go to <b>API → API Management</b>, and create a new token.",
        'bit-integrations'
      )}</li>
    </ul>`

  return (
    <Authorization
      config={perfexCRMConf}
      setConfig={setPerfexCRMConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Perfex CRM"
      tutorialLinks={tutorialLinks?.perfexCRM || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: '{domain}/api/staffs',
        method: 'GET',
        key: 'authtoken',
        addTo: 'header',
        extraFields: [
          {
            name: 'domain',
            label: __('Access API URL', 'bit-integrations'),
            required: true,
            placeholder: __('https://example.com', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
