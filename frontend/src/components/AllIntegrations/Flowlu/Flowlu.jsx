/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import toast from 'react-hot-toast'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import FlowluAuthorization from './FlowluAuthorization'
import { checkMappedFields, handleInput } from './FlowluCommonFunc'
import FlowluIntegLayout from './FlowluIntegLayout'

function Flowlu({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [flowluConf, setFlowluConf] = useState({
    name: 'Flowlu',
    type: 'Flowlu',
    api_key: '',
    company_name: '',
    field_map: [{ formField: '', flowluFormField: '' }],
    actionName: '',
    actionId: '',
    flowluFields: [],
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, flowluConf, navigate, '', '', setIsLoading)
    resp.then(res => {
      if (res.success) {
        toast.success(res.data?.msg)
        navigate(allIntegURL)
      } else {
        toast.error(res.data || res)
      }
    })
  }

  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(flowluConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (flowluConf.actionName === 'account') {
      if (!flowluConf.selectedAccountType) {
        toast.error(__('Please select an Account Type', 'bit-integrations'))
        return
      }
    }
    if (flowluConf.actionName === 'opportunity') {
      if (!flowluConf.selectedPipeline) {
        toast.error(__('Please select a Opportunity Pipeline', 'bit-integrations'))
        return
      }
      if (!flowluConf.selectedOpportunityStage) {
        toast.error(__('Please select a Opportunity Stage', 'bit-integrations'))
        return
      }
    }

    flowluConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <FlowluAuthorization
        flowluConf={flowluConf}
        setFlowluConf={setFlowluConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <FlowluIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, flowluConf, setFlowluConf, setLoading, setSnackbar)}
          flowluConf={flowluConf}
          setFlowluConf={setFlowluConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {flowluConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(flowluConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {flowluConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={flowluConf}
          setDataConf={setFlowluConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Flowlu
