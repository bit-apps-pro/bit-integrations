import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ZohoAnalyticsAuthorization from './ZohoAnalyticsAuthorization'
import { handleInput } from './ZohoAnalyticsCommonFunc'
import ZohoAnalyticsIntegLayout from './ZohoAnalyticsIntegLayout'

export default function ZohoAnalytics({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [analyticsConf, setAnalyticsConf] = useState({
    name: 'Zoho Analytics',
    type: 'Zoho Analytics',
    field_map: [{ formField: '', zohoFormField: '' }],
    actions: {}
  })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (
      analyticsConf.workspace !== '' &&
      analyticsConf.table !== '' &&
      analyticsConf.field_map.length > 0
    ) {
      setStep(3)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <ZohoAnalyticsAuthorization
        formID={formID}
        analyticsConf={analyticsConf}
        setAnalyticsConf={setAnalyticsConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div className="btcd-stp-page" style={{ width: step === 2 && 900, height: step === 2 && 'auto' }}>
        <ZohoAnalyticsIntegLayout
          formID={formID}
          formFields={formFields}
          handleInput={e =>
            handleInput(e, analyticsConf, setAnalyticsConf, formID, setIsLoading, setSnackbar)
          }
          analyticsConf={analyticsConf}
          setAnalyticsConf={setAnalyticsConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={nextPage}
          disabled={
            analyticsConf.workspace === '' ||
            analyticsConf.table === '' ||
            analyticsConf.field_map.length < 1
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
        saveConfig={() => saveIntegConfig(flow, setFlow, allIntegURL, analyticsConf, navigate)}
      />
    </div>
  )
}
