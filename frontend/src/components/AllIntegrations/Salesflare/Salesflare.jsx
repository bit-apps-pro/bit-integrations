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
import SalesflareAuthorization from './SalesflareAuthorization'
import { checkMappedFields, handleInput } from './SalesflareCommonFunc'
import SalesflareIntegLayout from './SalesflareIntegLayout'

function Salesflare({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const accountFields = [
    { key: 'name', label: __('Account name', 'bit-integrations'), required: true },
    { key: 'website', label: __('Account website', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'size', label: __('Size', 'bit-integrations'), required: false },
    { key: 'email', label: __('Account email', 'bit-integrations'), required: false },
    { key: 'phone_number', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'street', label: __('Street', 'bit-integrations'), required: false },
    { key: 'zip', label: __('Zip/Postal Code', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'region', label: __('State/Region', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false }
  ]

  const contactFields = [
    { key: 'firstname', label: __('First Name', 'bit-integrations'), required: true },
    { key: 'Prefix', label: __('Prefix', 'bit-integrations'), required: false },
    { key: 'middle', label: __('Middle Name', 'bit-integrations'), required: false },
    { key: 'lastname', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email Address', 'bit-integrations'), required: true },
    { key: 'suffix', label: __('Suffix', 'bit-integrations'), required: false },
    { key: 'phone_number', label: __('Phone Number', 'bit-integrations'), required: false },
    { key: 'role', label: __('Role', 'bit-integrations'), required: false },
    { key: 'organisation', label: __('Organisation', 'bit-integrations'), required: false },
    { key: 'street', label: __('Street', 'bit-integrations'), required: false },
    { key: 'zip', label: __('Zip/Postal Code', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'region', label: __('State/Region', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false }
  ]

  const opportunitiyFields = [
    { key: 'name', label: __('Opportunity name', 'bit-integrations'), required: true },
    { key: 'value', label: __('Value', 'bit-integrations'), required: false },
    { key: 'start_date', label: __('Start Date', 'bit-integrations'), required: false },
    { key: 'close_date', label: __('Close Date', 'bit-integrations'), required: false }
  ]

  const [salesflareConf, setSalesflareConf] = useState({
    name: 'Salesflare',
    type: 'Salesflare',
    api_key: '',
    field_map: [{ formField: '', salesflareFormField: '' }],
    actionName: '',
    actionId: '',
    accountFields,
    contactFields,
    opportunitiyFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      salesflareConf,
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

    if (!checkMappedFields(salesflareConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (salesflareConf.actionName === 'opportunities') {
      if (!salesflareConf.selectedAccount) {
        toast.error(__('Please select an Account', 'bit-integrations'))
        return
      }
      if (!salesflareConf.selectedPipeline) {
        toast.error(__('Please select a Pipeline', 'bit-integrations'))
        return
      }
      if (salesflareConf.selectedPipeline && !salesflareConf.selectedStage) {
        toast.error(__('Please select a Stage', 'bit-integrations'))
        return
      }
    }

    salesflareConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <SalesflareAuthorization
        salesflareConf={salesflareConf}
        setSalesflareConf={setSalesflareConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <SalesflareIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, salesflareConf, setSalesflareConf, setLoading, setSnackbar)}
          salesflareConf={salesflareConf}
          setSalesflareConf={setSalesflareConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {salesflareConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(salesflareConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {salesflareConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={salesflareConf}
          setDataConf={setSalesflareConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Salesflare
