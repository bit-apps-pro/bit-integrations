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
import NutshellCRMAuthorization from './NutshellCRMAuthorization'
import { checkMappedFields, handleInput } from './NutshellCRMCommonFunc'
import NutshellCRMIntegLayout from './NutshellCRMIntegLayout'

function NutshellCRM({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const peopleFields = [
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
    { key: 'email', label: __('Email Address', 'bit-integrations'), required: true },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone Number', 'bit-integrations'), required: false },
    { key: 'address_1', label: __('Address 1', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'postalCode', label: __('Postal Code', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false }
  ]

  const companyFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'url', label: __('URL', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone Number', 'bit-integrations'), required: false },
    { key: 'address_1', label: __('Address 1', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'postalCode', label: __('Postal Code', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false }
  ]

  const leadFields = [
    { key: 'description', label: __('Lead Description', 'bit-integrations'), required: true },
    { key: 'dueTime', label: __('Due Time', 'bit-integrations'), required: false },
    { key: 'confidence', label: __('Confidence', 'bit-integrations'), required: false }
  ]

  const [nutshellCRMConf, setNutshellCRMConf] = useState({
    name: 'NutshellCRM',
    type: 'NutshellCRM',
    user_name: '',
    api_token: '',
    field_map: [{ formField: '', nutshellCRMFormField: '' }],
    actionName: '',
    actionId: '',
    peopleFields,
    companyFields,
    leadFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      nutshellCRMConf,
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

    if (!checkMappedFields(nutshellCRMConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    nutshellCRMConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <NutshellCRMAuthorization
        nutshellCRMConf={nutshellCRMConf}
        setNutshellCRMConf={setNutshellCRMConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <NutshellCRMIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, nutshellCRMConf, setNutshellCRMConf, setLoading, setSnackbar)}
          nutshellCRMConf={nutshellCRMConf}
          setNutshellCRMConf={setNutshellCRMConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {nutshellCRMConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(nutshellCRMConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {nutshellCRMConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={nutshellCRMConf}
          setDataConf={setNutshellCRMConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default NutshellCRM
