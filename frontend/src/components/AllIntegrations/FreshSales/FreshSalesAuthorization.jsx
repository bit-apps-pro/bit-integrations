import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function FreshSalesAuthorization({
  freshSalesConf,
  setFreshSalesConf,
  step,
  setstep,
  isInfo
}) {
  const note = `
    <h4>${__('Step of generate API token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
    'Goto',
    'bit-integrations'
  )} <a href="https://www.myfreshworks.com/crm/sales/personal-settings/api-settings">${__(
    'Generate API Token',
    'bit-integrations'
  )}</a></li>
      <li>${__(
    'Copy the <b>Token</b> and paste into <b>API Token</b> field of your authorization form.',
    'bit-integrations'
  )}</li>
      <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
  </ul>
  <small className="d-blk mt-3">
    ${__('Example: name.myfreshworks.com/crm/sales', 'bit-integrations')}
  </small>
  `

  return (
    <Authorization
      config={freshSalesConf}
      setConfig={setFreshSalesConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Freshsales"
      tutorialLinks={tutorialLinks?.freshSales || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://{bundle_alias}/api/settings/sales_accounts/fields',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: {
          Authorization: 'Token token={api_key}'
        },
        extraFields: [
          {
            name: 'bundle_alias',
            label: __('Bundle Alias(Your Account URL)', 'bit-integrations'),
            required: true,
            placeholder: __('name.myfreshworks.com/crm/sales', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
