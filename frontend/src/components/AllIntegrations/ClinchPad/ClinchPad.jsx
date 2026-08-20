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
import ClinchPadAuthorization from './ClinchPadAuthorization'
import { checkMappedFields, handleInput } from './ClinchPadCommonFunc'
import ClinchPadIntegLayout from './ClinchPadIntegLayout'

function ClinchPad({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const organizationFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'address', label: __('Address', 'bit-integrations'), required: false }
  ]

  const contactFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'designation', label: __('Designation', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'address', label: __('Address', 'bit-integrations'), required: false }
  ]

  const leadFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'size', label: __('Size', 'bit-integrations'), required: false }
  ]

  const [clinchPadConf, setClinchPadConf] = useState({
    name: 'ClinchPad',
    type: 'ClinchPad',
    api_key: '',
    field_map: [{ formField: '', clinchPadFormField: '' }],
    actionName: '',
    organizationFields,
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
      clinchPadConf,
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

    if (!checkMappedFields(clinchPadConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (clinchPadConf.actionName === 'lead') {
      if (!clinchPadConf.selectedCRMPipeline) {
        toast.error(__('Please select a pipeline', 'bit-integrations'))
        return
      }
    }

    clinchPadConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <ClinchPadAuthorization
        clinchPadConf={clinchPadConf}
        setClinchPadConf={setClinchPadConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <ClinchPadIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, clinchPadConf, setClinchPadConf, setLoading, setSnackbar)}
          clinchPadConf={clinchPadConf}
          setClinchPadConf={setClinchPadConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {clinchPadConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(clinchPadConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {clinchPadConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={clinchPadConf}
          setDataConf={setClinchPadConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default ClinchPad
