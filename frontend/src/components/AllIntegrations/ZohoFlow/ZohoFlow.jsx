// eslint-disable-next-line import/no-extraneous-dependencies
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import WebHooksLayouts from '../IntegrationHelpers/WebHook/WebHooksIntegration'
import WebHooksStepTwo from '../IntegrationHelpers/WebHook/WebHooksStepTwo'
import TutorialLink from '../../Utilities/TutorialLink'

function ZohoFlow({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [isLoading, setIsLoading] = useState(false)
const [zohoFlow, setZohoFlow] = useState({
    name: 'Zoho Flow Web Hooks',
    type: 'Zoho Flow',
    method: 'POST',
    url: '',
    apiConsole: 'https://flow.zoho.com/#/workspace/default/flows/create'
  })

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={2} active={step} />
      </div>

      {/* STEP 1 */}
      <div
        className="btcd-stp-page"
        style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
                <TutorialLink linkKey="zohoFlowLinks" />

        <WebHooksLayouts
          formID={formID}
          formFields={formFields}
          webHooks={zohoFlow}
          setWebHooks={setZohoFlow}
          step={step}
          setStep={setStep}
          setSnackbar={setSnackbar}
          create
        />
      </div>

      {/* STEP 2 */}
      <div className="btcd-stp-page" style={{ width: step === 2 && 900, height: step === 2 && 'auto' }}>
        <WebHooksStepTwo
          step={step}
          saveConfig={() =>
            saveIntegConfig(flow, setFlow, allIntegURL, zohoFlow, navigate, '', '', setIsLoading)
          }
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default ZohoFlow
