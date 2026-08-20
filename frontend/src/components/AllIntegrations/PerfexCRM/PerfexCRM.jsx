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
import PerfexCRMAuthorization from './PerfexCRMAuthorization'
import { checkMappedFields, handleInput } from './PerfexCRMCommonFunc'
import PerfexCRMIntegLayout from './PerfexCRMIntegLayout'

function PerfexCRM({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const customerFields = [
    { key: 'company', label: __('Company', 'bit-integrations'), required: true },
    { key: 'vat', label: __('VAT Number', 'bit-integrations'), required: false },
    { key: 'phonenumber', label: __('Phone Number', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'address', label: __('Address', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'zip', label: __('Zip', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'billing_street', label: __('Billing Street', 'bit-integrations'), required: false },
    { key: 'billing_city', label: __('Billing City', 'bit-integrations'), required: false },
    { key: 'billing_state', label: __('Billing State', 'bit-integrations'), required: false },
    { key: 'billing_zip', label: __('Billing Zip', 'bit-integrations'), required: false },
    { key: 'billing_country', label: __('Billing Country', 'bit-integrations'), required: false },
    { key: 'shipping_street', label: __('Shipping Street', 'bit-integrations'), required: false },
    { key: 'shipping_city', label: __('Shipping City', 'bit-integrations'), required: false },
    { key: 'shipping_state', label: __('Shipping State', 'bit-integrations'), required: false },
    { key: 'shipping_zip', label: __('Shipping Zip', 'bit-integrations'), required: false },
    { key: 'shipping_country', label: __('Shipping Country', 'bit-integrations'), required: false }
  ]

  const contactFields = [
    { key: 'firstname', label: __('First Name', 'bit-integrations'), required: true },
    { key: 'lastname', label: __('Last Name', 'bit-integrations'), required: true },
    { key: 'email', label: __('Email Address', 'bit-integrations'), required: true },
    { key: 'title', label: __('Position', 'bit-integrations'), required: false },
    { key: 'phonenumber', label: __('Phone Number', 'bit-integrations'), required: false },
    { key: 'password', label: __('Password', 'bit-integrations'), required: false }
  ]

  const leadFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'title', label: __('Position', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email Address', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'phonenumber', label: __('Phone Number', 'bit-integrations'), required: false },
    { key: 'company', label: __('Company', 'bit-integrations'), required: false },
    { key: 'address', label: __('Address', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'zip', label: __('Zip', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'custom_contact_date', label: __('Date Contacted', 'bit-integrations'), required: false }
  ]

  const projectFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'start_date', label: __('Start Date', 'bit-integrations'), required: true },
    { key: 'deadline', label: __('Dead Line', 'bit-integrations'), required: false },
    { key: 'project_cost ', label: __('project Cost', 'bit-integrations'), required: false },
    { key: 'estimated_hours', label: __('Estimated Hours', 'bit-integrations'), required: false },
    { key: 'description', label: __('Project Description', 'bit-integrations'), required: false }
  ]

  const [perfexCRMConf, setPerfexCRMConf] = useState({
    name: 'PerfexCRM',
    type: 'PerfexCRM',
    api_token: '',
    domain: '',
    field_map: [{ formField: '', perfexCRMFormField: '' }],
    actionName: '',
    selectedLeadSourceId: 1,
    selectedLeadStatusId: 1,
    actionId: '',
    customerFields,
    contactFields,
    leadFields,
    projectFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      perfexCRMConf,
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

    if (!checkMappedFields(perfexCRMConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (perfexCRMConf.actionName === 'contact' && !perfexCRMConf.selectedCustomer) {
      toast.error(__('Please select a Customer', 'bit-integrations'))
      return
    }
    if (
      perfexCRMConf.actionName === 'lead' &&
      (!perfexCRMConf.selectedLeadStatusId ||
        !perfexCRMConf.selectedLeadSourceId ||
        !perfexCRMConf.selectedStaff)
    ) {
      toast.error(__('Lead Status Id and Lead Source Id are required!', 'bit-integrations'))
      return
    }
    if (perfexCRMConf.actionName === 'project') {
      if (!perfexCRMConf.selectedProjectStatus) {
        toast.error(__('Please select Project status', 'bit-integrations'))
        return
      }
      if (!perfexCRMConf.selectedProjectType) {
        toast.error(__('Please select Project Related With...', 'bit-integrations'))
        return
      }
      if (!perfexCRMConf.selectedbillingType) {
        toast.error(__('Please select a Billing type', 'bit-integrations'))
        return
      }
      if (!perfexCRMConf.selectedCustomer) {
        toast.error(__('Please select a Customer', 'bit-integrations'))
        return
      }
      if (Number(perfexCRMConf.selectedbillingType) === 1 && !perfexCRMConf.totalRate) {
        toast.error(__('Please select a Total Rate', 'bit-integrations'))
        return
      }
      if (Number(perfexCRMConf.selectedbillingType) === 2 && !perfexCRMConf.ratePerHour) {
        toast.error(__('Please select a Rate Per Hour', 'bit-integrations'))
        return
      }
    }

    perfexCRMConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <PerfexCRMAuthorization
        perfexCRMConf={perfexCRMConf}
        setPerfexCRMConf={setPerfexCRMConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <PerfexCRMIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, perfexCRMConf, setPerfexCRMConf, setLoading, setSnackbar)}
          perfexCRMConf={perfexCRMConf}
          setPerfexCRMConf={setPerfexCRMConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {perfexCRMConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(perfexCRMConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {perfexCRMConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={perfexCRMConf}
          setDataConf={setPerfexCRMConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default PerfexCRM
