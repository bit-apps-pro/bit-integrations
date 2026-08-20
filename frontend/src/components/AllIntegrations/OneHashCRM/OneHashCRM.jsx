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
import OneHashCRMAuthorization from './OneHashCRMAuthorization'
import { checkMappedFields, handleInput } from './OneHashCRMCommonFunc'
import OneHashCRMIntegLayout from './OneHashCRMIntegLayout'

function OneHashCRM({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const customerFields = [
    { key: 'customer_name', label: __('Full Name', 'bit-integrations'), required: true },
    { key: 'mobile_no', label: __('Mobile Number', 'bit-integrations'), required: false },
    { key: 'email_id', label: __('Email Address', 'bit-integrations'), required: false },
    { key: 'primary_address', label: __('Primary Address', 'bit-integrations'), required: false },
    {
      key: 'customer_primary_contact',
      label: __('customer Primary Contact', 'bit-integrations'),
      required: false
    },
    {
      key: 'customer_primary_address',
      label: __('customer Primary Address', 'bit-integrations'),
      required: false
    }
  ]

  const contactFields = [
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
    { key: 'middle_name', label: __('Middle Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'email_id', label: __('Email Address', 'bit-integrations'), required: false },
    { key: 'designation', label: __('Designation', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone Number', 'bit-integrations'), required: false },
    { key: 'mobile_no', label: __('Mobile Number', 'bit-integrations'), required: false },
    { key: 'gender', label: __('Gender', 'bit-integrations'), required: false },
    { key: 'department', label: __('Department', 'bit-integrations'), required: false },
    { key: 'company_name', label: __('Company Name', 'bit-integrations'), required: false }
  ]

  const leadFields = [
    { key: 'lead_name', label: __('Person Name', 'bit-integrations'), required: true },
    { key: 'company_name', label: __('Organization Name', 'bit-integrations'), required: true },
    { key: 'email_id', label: __('Email Address', 'bit-integrations'), required: false },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone Number', 'bit-integrations'), required: false },
    { key: 'mobile_no', label: __('Mobile Number', 'bit-integrations'), required: false },
    { key: 'fax', label: __('Fax', 'bit-integrations'), required: false },
    { key: 'designation', label: __('Designation', 'bit-integrations'), required: false },
    { key: 'gender', label: __('Gender', 'bit-integrations'), required: false },
    { key: 'campaign_name', label: __('Campaign Name', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'notes', label: __('Notes', 'bit-integrations'), required: false },
    { key: 'address_title', label: __('Address Title', 'bit-integrations'), required: false },
    { key: 'address_line1', label: __('Address Line 1', 'bit-integrations'), required: false },
    { key: 'address_line2', label: __('Address Line 2', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'county', label: __('County', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'pincode', label: __('Postal Code', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false }
  ]

  const [oneHashCRMConf, setOneHashCRMConf] = useState({
    name: 'OneHashCRM',
    type: 'OneHashCRM',
    api_key: '',
    api_secret: '',
    domain: '',
    field_map: [{ formField: '', oneHashCRMFormField: '' }],
    actionName: '',
    actionId: '',
    customerFields,
    contactFields,
    leadFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      oneHashCRMConf,
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

    if (!checkMappedFields(oneHashCRMConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (oneHashCRMConf.actionName === 'customer' && !oneHashCRMConf.selectedCustomerType) {
      toast.error(__('Please select Customer Type', 'bit-integrations'))
      return
    }
    if (oneHashCRMConf.actionName === 'lead' && !oneHashCRMConf.selectedLeadStatus) {
      toast.error(__('Please select Lead Status', 'bit-integrations'))
      return
    }

    oneHashCRMConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <OneHashCRMAuthorization
        oneHashCRMConf={oneHashCRMConf}
        setOneHashCRMConf={setOneHashCRMConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <OneHashCRMIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, oneHashCRMConf, setOneHashCRMConf, setLoading, setSnackbar)}
          oneHashCRMConf={oneHashCRMConf}
          setOneHashCRMConf={setOneHashCRMConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {oneHashCRMConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(oneHashCRMConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {oneHashCRMConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={oneHashCRMConf}
          setDataConf={setOneHashCRMConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default OneHashCRM
