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
import CompanyHubAuthorization from './CompanyHubAuthorization'
import { checkMappedFields } from './CompanyHubCommonFunc'
import CompanyHubIntegLayout from './CompanyHubIntegLayout'

function CompanyHub({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const contactFields = [
    { label: __('First Name', 'bit-integrations'), key: 'FirstName', required: false },
    { label: __('Last Name', 'bit-integrations'), key: 'LastName', required: true },
    { label: __('Email Address', 'bit-integrations'), key: 'Email', required: false },
    { label: __('Company', 'bit-integrations'), key: 'Company', required: false },
    { label: __('Phone Number', 'bit-integrations'), key: 'Phone', required: false },
    { label: __('Job Title', 'bit-integrations'), key: 'Designation', required: false },
    { label: __('Description', 'bit-integrations'), key: 'Description', required: false },
    { label: __('Source', 'bit-integrations'), key: 'Source', required: false },
    {
      label: __('Next Follow Up Date', 'bit-integrations'),
      key: 'NextFollowUpDate',
      required: false
    },
    { label: __('Twitter', 'bit-integrations'), key: 'Twitter', required: false },
    { label: __('LinkedIn', 'bit-integrations'), key: 'LinkedIn', required: false },
    { label: __('GooglePlus', 'bit-integrations'), key: 'GooglePlus', required: false },
    { label: __('Facebook', 'bit-integrations'), key: 'Facebook', required: false },
    { label: __('Skype', 'bit-integrations'), key: 'Skype', required: false },
    { label: __('Street', 'bit-integrations'), key: 'Street', required: false },
    { label: __('City', 'bit-integrations'), key: 'City', required: false },
    { label: __('State', 'bit-integrations'), key: 'State', required: false },
    { label: __('Country', 'bit-integrations'), key: 'Country', required: false },
    { label: __('Postal Code', 'bit-integrations'), key: 'PostalCode', required: false },
    { label: __('Postal Code', 'bit-integrations'), key: 'PostalCode', required: false }
  ]
  const companyFields = [
    { label: __('Company Name', 'bit-integrations'), key: 'Name', required: true },
    { label: __('Website', 'bit-integrations'), key: 'Website', required: false },
    { label: __('Phone Number', 'bit-integrations'), key: 'Phone', required: false },
    { label: __('Description', 'bit-integrations'), key: 'Description', required: false },
    { label: __('Billing Street', 'bit-integrations'), key: 'BillingStreet', required: false },
    { label: __('Billing City', 'bit-integrations'), key: 'BillingCity', required: false },
    { label: __('Billing State', 'bit-integrations'), key: 'BillingState', required: false },
    { label: __('Billing Country', 'bit-integrations'), key: 'BillingCountry', required: false },
    {
      label: __('Billing Postal Code', 'bit-integrations'),
      key: 'BillingPostalCode',
      required: false
    },
    { label: __('Shipping Street', 'bit-integrations'), key: 'ShippingStreet', required: false },
    { label: __('Shipping City', 'bit-integrations'), key: 'ShippingCity', required: false },
    { label: __('Shipping State', 'bit-integrations'), key: 'ShippingState', required: false },
    { label: __('Shipping Country', 'bit-integrations'), key: 'ShippingCountry', required: false },
    {
      label: __('Shipping Postal Code', 'bit-integrations'),
      key: 'ShippingPostalCode',
      required: false
    }
  ]
  const dealFields = [
    { label: __('Deal Name', 'bit-integrations'), key: 'Name', required: true },
    { label: __('Amount', 'bit-integrations'), key: 'Amount', required: false },
    { label: __('Close Date', 'bit-integrations'), key: 'CloseDate', required: false }
  ]

  const [companyHubConf, setCompanyHubConf] = useState({
    name: 'CompanyHub',
    type: 'CompanyHub',
    sub_domain: '',
    api_key: '',
    field_map: [{ formField: '', companyHubFormField: '' }],
    actionName: '',
    contactFields,
    companyFields,
    dealFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      companyHubConf,
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

    if (!checkMappedFields(companyHubConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (companyHubConf.actionName === 'deal') {
      if (!companyHubConf.selectedStage) {
        toast.error(__('Please select a Deal Stage', 'bit-integrations'))
        return
      }
    }

    companyHubConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <CompanyHubAuthorization
        companyHubConf={companyHubConf}
        setCompanyHubConf={setCompanyHubConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <CompanyHubIntegLayout
          formFields={formFields}
          companyHubConf={companyHubConf}
          setCompanyHubConf={setCompanyHubConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {companyHubConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(companyHubConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {companyHubConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={companyHubConf}
          setDataConf={setCompanyHubConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default CompanyHub
