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
import SmartSuiteAuthorization from './SmartSuiteAuthorization'
import { checkMappedFields, generateMappedField } from './SmartSuiteCommonFunc'
import SmartSuiteIntegLayout from './SmartSuiteIntegLayout'

function SmartSuite({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const smartSuiteFields = []
  const [smartSuiteConf, setSmartSuiteConf] = useState({
    name: 'SmartSuite',
    type: 'SmartSuite',
    workspaceId: '',
    apiToken: '',
    field_map: generateMappedField(smartSuiteFields),
    actionName: '',
    smartSuiteFields,
    solutionFields,
    tableFields,
    actionLists
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      smartSuiteConf,
      navigate,
      '',
      '',
      setIsLoading
    )
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

    if (!checkMappedFields(smartSuiteConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (
      (smartSuiteConf.actionName === 'table' || smartSuiteConf.actionName === 'record') &&
      !smartSuiteConf.selectedSolution
    ) {
      toast.error(__('Please select a solution', 'bit-integrations'))
      return
    }
    if (smartSuiteConf.actionName === 'record' && !smartSuiteConf.selectedTable) {
      toast.error(__('Please select a table', 'bit-integrations'))
      return
    }
    smartSuiteConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <SmartSuiteAuthorization
        smartSuiteConf={smartSuiteConf}
        setSmartSuiteConf={setSmartSuiteConf}
        step={step}
        setStep={setStep}
        setLoading={setLoading}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <SmartSuiteIntegLayout
          formFields={formFields}
          smartSuiteConf={smartSuiteConf}
          setSmartSuiteConf={setSmartSuiteConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {smartSuiteConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(smartSuiteConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {/* STEP 3 */}
      {smartSuiteConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={smartSuiteConf}
          setDataConf={setSmartSuiteConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

const solutionFields = [
  { label: 'Name', key: 'name', required: true },
  { label: 'Logo Icon', key: 'logo_icon', required: false }
]
const tableFields = [{ label: 'Name', key: 'name', required: true }]
const actionLists = [
  { name: 'solution', label: __('Create Solution', 'bit-integrations'), is_pro: false },
  { name: 'table', label: __('Create Table', 'bit-integrations'), is_pro: true },
  { name: 'record', label: __('Create Record', 'bit-integrations'), is_pro: true }
]
export default SmartSuite
