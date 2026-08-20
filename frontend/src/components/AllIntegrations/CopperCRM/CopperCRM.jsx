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
import CopperCRMAuthorization from './CopperCRMAuthorization'
import { checkMappedFields, handleInput } from './CopperCRMCommonFunc'
import CopperCRMIntegLayout from './CopperCRMIntegLayout'

function CopperCRM({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const companyFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'email_domain', label: __('Email', 'bit-integrations'), required: false },
    { key: 'details', label: __('Description', 'bit-integrations'), required: false },
    { key: 'street', label: __('Street', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'phone_numbers', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'websites', label: __('Website', 'bit-integrations'), required: false }
  ]

  const personFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'details', label: __('Description', 'bit-integrations'), required: false },
    { key: 'email_domain', label: __('Email', 'bit-integrations'), required: false },
    { key: 'phone_numbers', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'street', label: __('Street', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'websites', label: __('Website', 'bit-integrations'), required: false }
  ]

  const opportunityFields = [
    { key: 'name', label: __('Opportunity Name', 'bit-integrations'), required: true },
    { key: 'close_date', label: __('Close Date', 'bit-integrations'), required: false },
    { key: 'details', label: __('Opportunity Details', 'bit-integrations'), required: false },
    { key: 'monetary_value', label: __('Value', 'bit-integrations'), required: false }
  ]

  const taskFields = [
    { key: 'name', label: __('Task Name', 'bit-integrations'), required: true },
    { key: 'due_date', label: __('Due Date', 'bit-integrations'), required: false },
    { key: 'reminder_date', label: __('Reminder Date', 'bit-integrations'), required: false },
    { key: 'details', label: __('Description', 'bit-integrations'), required: false }
  ]

  const [copperCRMConf, setCopperCRMConf] = useState({
    name: 'CopperCRM',
    type: 'CopperCRM',
    api_key: '',
    api_email: '',
    field_map: [{ formField: '', coppercrmFormField: '' }],
    actionName: '',
    companyFields,
    personFields,
    opportunityFields,
    taskFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      copperCRMConf,
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

    if (!checkMappedFields(copperCRMConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (copperCRMConf.actionName === 'opportunity') {
      if (!copperCRMConf.selectedCRMPeople) {
        toast.error(__('Please select a people', 'bit-integrations'))
        return
      }
      if (!copperCRMConf.selectedCRMPipelines && copperCRMConf.actionName === 'opportunity') {
        toast.error(__('Please select a Pipeline', 'bit-integrations'))
        return
      }
    }

    copperCRMConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <CopperCRMAuthorization
        copperCRMConf={copperCRMConf}
        setCopperCRMConf={setCopperCRMConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <CopperCRMIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, copperCRMConf, setCopperCRMConf, setLoading, setSnackbar)}
          copperCRMConf={copperCRMConf}
          setCopperCRMConf={setCopperCRMConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {copperCRMConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(copperCRMConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {copperCRMConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={copperCRMConf}
          setDataConf={setCopperCRMConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default CopperCRM
