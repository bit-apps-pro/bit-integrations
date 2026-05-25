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
import AgiledAuthorization from './AgiledAuthorization'
import { checkMappedFields, handleInput } from './AgiledCommonFunc'
import AgiledIntegLayout from './AgiledIntegLayout'

function Agiled({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const accountFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'size', label: __('Size', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'facebook', label: __('Facebook', 'bit-integrations'), required: false },
    { key: 'linkedin', label: __('Linkedin', 'bit-integrations'), required: false },
    { key: 'twitter', label: __('Twitter', 'bit-integrations'), required: false },
    { key: 'skype', label: __('Skype', 'bit-integrations'), required: false },
    { key: 'note', label: __('Note', 'bit-integrations'), required: false },
    { key: 'tax_no', label: __('Tax No', 'bit-integrations'), required: false }
  ]

  const contactFields = [
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'job_title', label: __('Job Title', 'bit-integrations'), required: false },
    { key: 'facebook', label: __('Facebook', 'bit-integrations'), required: false },
    { key: 'linkedin', label: __('Linkedin', 'bit-integrations'), required: false },
    { key: 'twitter', label: __('Twitter', 'bit-integrations'), required: false },
    { key: 'skype', label: __('Skype', 'bit-integrations'), required: false },
    { key: 'note', label: __('Note', 'bit-integrations'), required: false },
    { key: 'tax_no', label: __('Tax No', 'bit-integrations'), required: false },
    { key: 'last_contacted', label: __('Last Contacted', 'bit-integrations'), required: false }
  ]

  const dealFields = [
    { key: 'deal_name', label: __('Deal Name', 'bit-integrations'), required: true },
    { key: 'amount', label: __('Amount', 'bit-integrations'), required: false },
    { key: 'close_date', label: __('Close Date', 'bit-integrations'), required: false }
  ]

  const [agiledConf, setAgiledConf] = useState({
    name: 'Agiled CRM',
    type: 'Agiled CRM',
    auth_token: '',
    brand: '',
    field_map: [{ formField: '', agiledFormField: '' }],
    actionName: '',
    accountFields,
    contactFields,
    dealFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, agiledConf, navigate, '', '', setIsLoading)
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

    if (!checkMappedFields(agiledConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (agiledConf.actionName === 'deal') {
      if (!agiledConf.selectedCRMPipeline) {
        toast.error(__('Please select a pipeline', 'bit-integrations'))
        return
      }
      if (!agiledConf.selectedCRMPipelineStages) {
        toast.error(__('Please select a pipeline stage', 'bit-integrations'))
        return
      }
    }

    agiledConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <AgiledAuthorization
        agiledConf={agiledConf}
        setAgiledConf={setAgiledConf}
        step={step}
        setStep={setStep}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <AgiledIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, agiledConf, setAgiledConf, setLoading, setSnackbar)}
          agiledConf={agiledConf}
          setAgiledConf={setAgiledConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {agiledConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(agiledConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {/* STEP 3 */}
      {agiledConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={agiledConf}
          setDataConf={setAgiledConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Agiled
