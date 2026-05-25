import { useEffect, useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ZohoMarketingHubAuthorization from './ZohoMarketingHubAuthorization'
import {
  checkMappedFields,
  handleInput,
  refreshLists
} from './ZohoMarketingHubCommonFunc'
import ZohoMarketingHubIntegLayout from './ZohoMarketingHubIntegLayout'

function ZohoMarketingHub({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [marketingHubConf, setMarketingHubConf] = useState({
    name: 'Zoho Marketing Automation(Zoho Marketing Hub)',
    type: 'Zoho Marketing Automation(Zoho Marketing Hub)',
    clientId: '',
    clientSecret: '',
    list: '',
    field_map: [{ formField: '', zohoFormField: '' }]
  })

  const nextPage = val => {
    if (val === 3) {
      if (!checkMappedFields(marketingHubConf)) {
        setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
        return
      }

      if (
        marketingHubConf.list !== '' &&
        marketingHubConf.table !== '' &&
        marketingHubConf.field_map.length > 0
      ) {
        setstep(val)
      }
    } else {
      setstep(val)
      if (val === 2 && !marketingHubConf.list) {
        refreshLists(formID, marketingHubConf, setMarketingHubConf, setIsLoading, setSnackbar)
      }
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <ZohoMarketingHubAuthorization
        formID={formID}
        marketingHubConf={marketingHubConf}
        setMarketingHubConf={setMarketingHubConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div className="btcd-stp-page" style={{ width: step === 2 && 900, height: step === 2 && 'auto' }}>
        <ZohoMarketingHubIntegLayout
          formID={formID}
          formFields={formFields}
          handleInput={e =>
            handleInput(e, formID, marketingHubConf, setMarketingHubConf, setIsLoading, setSnackbar)
          }
          marketingHubConf={marketingHubConf}
          setMarketingHubConf={setMarketingHubConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={
            marketingHubConf.list === '' ||
            marketingHubConf.table === '' ||
            marketingHubConf.field_map.length < 1
          }
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, marketingHubConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
      />
    </div>
  )
}

export default ZohoMarketingHub
