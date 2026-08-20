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
import CapsuleCRMAuthorization from './CapsuleCRMAuthorization'
import { checkMappedFields, handleInput } from './CapsuleCRMCommonFunc'
import CapsuleCRMIntegLayout from './CapsuleCRMIntegLayout'

function CapsuleCRM({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const organisationFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'emailAddresses', label: __('Email', 'bit-integrations'), required: false },
    { key: 'about', label: __('About', 'bit-integrations'), required: false },
    { key: 'street', label: __('Street', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'zip', label: __('Zip Code', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'phoneNumbers', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'websites', label: __('Website', 'bit-integrations'), required: false }
  ]

  const personFields = [
    { key: 'firstName', label: __('First Name', 'bit-integrations'), required: true },
    { key: 'lastName', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'jobTitle', label: __('Job Title', 'bit-integrations'), required: false },
    { key: 'emailAddresses', label: __('Email', 'bit-integrations'), required: false },
    { key: 'about', label: __('About', 'bit-integrations'), required: false },
    { key: 'street', label: __('Street', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'zip', label: __('Zip Code', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'phoneNumbers', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'websites', label: __('Website', 'bit-integrations'), required: false }
  ]

  const opportunityFields = [
    { key: 'name', label: __('Opportunity Name', 'bit-integrations'), required: true },
    { key: 'description', label: __('Opportunity Details', 'bit-integrations'), required: false },
    { key: 'value', label: __('Bid Amount', 'bit-integrations'), required: false },
    {
      key: 'expectedCloseOn',
      label: __('Expected Close Date', 'bit-integrations'),
      required: false
    },
    { key: 'closedOn', label: __('Actual Close Date', 'bit-integrations'), required: false }
  ]

  const projectFields = [
    { key: 'name', label: __('Project Name', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    {
      key: 'expectedCloseOn',
      label: __('Expected Close Date', 'bit-integrations'),
      required: false
    }
  ]

  const [capsulecrmConf, setCapsuleCRMConf] = useState({
    name: 'CapsuleCRM',
    type: 'CapsuleCRM',
    api_key: '',
    api_url: '',
    field_map: [{ formField: '', capsulecrmFormField: '' }],
    actionName: '',
    organisationFields,
    personFields,
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
      capsulecrmConf,
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

    if (!checkMappedFields(capsulecrmConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (capsulecrmConf.actionName === 'opportunity' || capsulecrmConf.actionName === 'project') {
      if (!capsulecrmConf.selectedCRMParty) {
        toast.error(__('Please select a party', 'bit-integrations'))
        return
      }
      if (!capsulecrmConf.selectedCRMMilestones && capsulecrmConf.actionName === 'opportunity') {
        toast.error(__('Please select a Milestone', 'bit-integrations'))
        return
      }
    }

    capsulecrmConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <CapsuleCRMAuthorization
        capsulecrmConf={capsulecrmConf}
        setCapsuleCRMConf={setCapsuleCRMConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <CapsuleCRMIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, capsulecrmConf, setCapsuleCRMConf, setLoading, setSnackbar)}
          capsulecrmConf={capsulecrmConf}
          setCapsuleCRMConf={setCapsuleCRMConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {capsulecrmConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(capsulecrmConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {capsulecrmConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={capsulecrmConf}
          setDataConf={setCapsuleCRMConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default CapsuleCRM
