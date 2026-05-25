/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SalesmateAuthorization from './SalesmateAuthorization'
import { checkMappedFields, handleInput } from './SalesmateCommonFunc'
import SalesmateIntegLayout from './SalesmateIntegLayout'

function Salesmate({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [salesmateConf, setSalesmateConf] = useState({
    name: 'Salesmate',
    type: 'Salesmate',
    session_token: '',
    link_name: '',
    field_map: [{ formField: '', salesmateFormField: '' }],
    actionName: '',
    actionId: '',
    salesmateFields: [],
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      salesmateConf,
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

    if (!checkMappedFields(salesmateConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (!salesmateConf.selectedCRMOwner) {
      toast.error(__('Please select a Owner', 'bit-integrations'))
      return
    }

    if (Number(salesmateConf.actionId) === 4) {
      if (!salesmateConf.selectedCRMContact) {
        toast.error(__('Please select a Contact', 'bit-integrations'))
        return
      }
      if (!salesmateConf.selectedCRMPipeline) {
        toast.error(__('Please select a Pipeline', 'bit-integrations'))
        return
      }
      if (!salesmateConf.selectedCRMStage) {
        toast.error(__('Please select a Stage', 'bit-integrations'))
        return
      }
    }

    salesmateConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <SalesmateAuthorization
        salesmateConf={salesmateConf}
        setSalesmateConf={setSalesmateConf}
        step={step}
        setStep={setStep}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <SalesmateIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, salesmateConf, setSalesmateConf, setLoading, setSnackbar)}
          salesmateConf={salesmateConf}
          setSalesmateConf={setSalesmateConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {salesmateConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(salesmateConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {/* STEP 3 */}
      {salesmateConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={salesmateConf}
          setDataConf={setSalesmateConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Salesmate
