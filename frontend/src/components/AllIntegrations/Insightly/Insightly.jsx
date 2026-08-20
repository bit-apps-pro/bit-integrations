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
import InsightlyAuthorization from './InsightlyAuthorization'
import { checkMappedFields, checkRequiredFields, handleInput } from './InsightlyCommonFunc'
import InsightlyIntegLayout from './InsightlyIntegLayout'

function Insightly({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const organisationFields = [
    { key: 'ORGANISATION_NAME', label: __('Name', 'bit-integrations'), required: true },
    { key: 'PHONE', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'PHONE_FAX', label: __('Fax', 'bit-integrations'), required: false },
    { key: 'WEBSITE', label: __('Website', 'bit-integrations'), required: false },
    { key: 'SOCIAL_FACEBOOK', label: __('Facebook', 'bit-integrations'), required: false },
    { key: 'SOCIAL_LINKEDIN', label: __('Linkedin', 'bit-integrations'), required: false },
    { key: 'SOCIAL_TWITTER', label: __('Twitter', 'bit-integrations'), required: false },
    {
      key: 'ADDRESS_BILLING_STREET',
      label: __('Address Billing Street', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_BILLING_CITY',
      label: __('Address Billing City', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_BILLING_STATE',
      label: __('Address Billing State', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_BILLING_COUNTRY',
      label: __('Address Billing Country', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_BILLING_POSTCODE',
      label: __('Address Billing Postcode', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_SHIP_STREET',
      label: __('Address Shipping Street', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_SHIP_STATE',
      label: __('Address Shipping State', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_SHIP_POSTCODE',
      label: __('Address Shipping Postcode', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_SHIP_COUNTRY',
      label: __('Address Shipping Country', 'bit-integrations'),
      required: false
    }
  ]

  const taskFields = [
    { key: 'TITLE', label: __('Task Name', 'bit-integrations'), required: true },
    { key: 'DUE_DATE', label: __('Due Date', 'bit-integrations'), required: false },
    { key: 'COMPLETED_DATE_UTC', label: __('Completed Date', 'bit-integrations'), required: false },
    { key: 'DETAILS', label: __('Description', 'bit-integrations'), required: false },
    { key: 'PERCENT_COMPLETE', label: __('Progress ( % )', 'bit-integrations'), required: false },
    { key: 'START_DATE', label: __('Start Date', 'bit-integrations'), required: false }
  ]

  const leadFields = [
    { key: 'FIRST_NAME', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'LAST_NAME', label: __('Last Name', 'bit-integrations'), required: true },
    { key: 'TITLE', label: __('Title', 'bit-integrations'), required: false },
    { key: 'ORGANISATION_NAME', label: __('Organization', 'bit-integrations'), required: false },
    { key: 'LEAD_RATING', label: __('Lead Rating', 'bit-integrations'), required: false },
    { key: 'EMAIL', label: __('Email Address', 'bit-integrations'), required: false },
    { key: 'PHONE', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'MOBILE', label: __('Mobile Phone', 'bit-integrations'), required: false },
    { key: 'FAX', label: __('Fax', 'bit-integrations'), required: false },
    { key: 'WEBSITE', label: __('Website', 'bit-integrations'), required: false },
    { key: 'INDUSTRY', label: __('Industry', 'bit-integrations'), required: false },
    {
      key: 'EMPLOYEE_COUNT',
      label: __('Number of Employees', 'bit-integrations'),
      required: false
    },
    { key: 'ADDRESS_STREET', label: __('Address Street', 'bit-integrations'), required: false },
    { key: 'ADDRESS_CITY', label: __('Address City', 'bit-integrations'), required: false },
    { key: 'ADDRESS_STATE', label: __('Address State', 'bit-integrations'), required: false },
    { key: 'ADDRESS_POSTCODE', label: __('Address Postcode', 'bit-integrations'), required: false },
    { key: 'ADDRESS_COUNTRY', label: __('Address Country', 'bit-integrations'), required: false },
    { key: 'LEAD_DESCRIPTION', label: __('Description', 'bit-integrations'), required: false }
  ]

  const contactFields = [
    { key: 'FIRST_NAME', label: __('First Name', 'bit-integrations'), required: true },
    { key: 'EMAIL_ADDRESS', label: __('Email', 'bit-integrations'), required: true },
    { key: 'LAST_NAME', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'TITLE', label: __('Title', 'bit-integrations'), required: false },
    { key: 'PHONE', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'PHONE_FAX', label: __('Fax', 'bit-integrations'), required: false },
    { key: 'DATE_OF_BIRTH', label: __('Date of Birth', 'bit-integrations'), required: false },
    { key: 'SOCIAL_FACEBOOK', label: __('Facebook', 'bit-integrations'), required: false },
    { key: 'SOCIAL_LINKEDIN', label: __('Linkedin', 'bit-integrations'), required: false },
    { key: 'SOCIAL_TWITTER', label: __('Twitter', 'bit-integrations'), required: false },
    {
      key: 'ADDRESS_MAIL_STREET',
      label: __('Address Mail Street', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_MAIL_CITY',
      label: __('Address Mail City', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_MAIL_STATE',
      label: __('Address Mail State', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_MAIL_COUNTRY',
      label: __('Address Mail Country', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_MAIL_POSTCODE',
      label: __('Address Mail Postcode', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_OTHER_STREET',
      label: __('Address Other Street', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_OTHER_STATE',
      label: __('Address Other State', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_OTHER_POSTCODE',
      label: __('Address Other Postcode', 'bit-integrations'),
      required: false
    },
    {
      key: 'ADDRESS_OTHER_COUNTRY',
      label: __('Address Other Country', 'bit-integrations'),
      required: false
    }
  ]

  const opportunityFields = [
    { key: 'OPPORTUNITY_NAME', label: __('Opportunity Name', 'bit-integrations'), required: true },
    {
      key: 'OPPORTUNITY_DETAILS',
      label: __('Opportunity Details', 'bit-integrations'),
      required: false
    },
    { key: 'BID_AMOUNT', label: __('Bid Amount', 'bit-integrations'), required: false },
    {
      key: 'ACTUAL_CLOSE_DATE',
      label: __('Actual Close Date', 'bit-integrations'),
      required: false
    },
    {
      key: 'PROBABILITY',
      label: __('Probability Of Winning', 'bit-integrations'),
      required: false
    },
    {
      key: 'FORECAST_CLOSE_DATE',
      label: __('Forecast Close Date', 'bit-integrations'),
      required: false
    }
  ]

  const projectFields = [
    { key: 'PROJECT_NAME', label: __('Project Name', 'bit-integrations'), required: true },
    { key: 'PROJECT_DETAILS', label: __('Description', 'bit-integrations'), required: false }
  ]

  const [insightlyConf, setInsightlyConf] = useState({
    name: 'Insightly',
    type: 'Insightly',
    api_key: '',
    api_url: '',
    field_map: [{ formField: '', insightlyFormField: '' }],
    actionName: '',
    organisationFields,
    contactFields,
    taskFields,
    leadFields,
    opportunityFields,
    projectFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      insightlyConf,
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

    if (!checkMappedFields(insightlyConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (insightlyConf.actionName === 'opportunity' || insightlyConf.actionName === 'project') {
      if (!insightlyConf.selectedCRMPipeline) {
        toast.error(__('Please select a pipeline', 'bit-integrations'))
        return
      }
      if (!insightlyConf.selectedCRMPipelineStages) {
        toast.error(__('Please select a pipeline stage', 'bit-integrations'))
        return
      }
    }

    if (insightlyConf.actionName === 'lead' && !checkRequiredFields(insightlyConf)) {
      toast.error(__('Please select Lead Status or Lead Source', 'bit-integrations'))
      return
    }

    insightlyConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <InsightlyAuthorization
        insightlyConf={insightlyConf}
        setInsightlyConf={setInsightlyConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <InsightlyIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, insightlyConf, setInsightlyConf, setLoading, setSnackbar)}
          insightlyConf={insightlyConf}
          setInsightlyConf={setInsightlyConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {insightlyConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(insightlyConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {insightlyConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={insightlyConf}
          setDataConf={setInsightlyConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Insightly
