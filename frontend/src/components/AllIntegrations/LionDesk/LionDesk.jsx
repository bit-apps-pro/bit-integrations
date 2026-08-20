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
import LionDeskAuthorization from './LionDeskAuthorization'
import { checkMappedFields, handleInput } from './LionDeskCommonFunc'
import LionDeskIntegLayout from './LionDeskIntegLayout'

function LionDesk({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const campaignFields = [{ key: 'name', label: 'Name', required: true }]
  const contactFields = [
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'mobile_phone', label: __('Mobile Phone', 'bit-integrations'), required: false },
    { key: 'home_phone', label: __('Home Phone', 'bit-integrations'), required: false },
    { key: 'office_phone', label: __('Office Phone', 'bit-integrations'), required: false },
    { key: 'fax', label: __('Fax', 'bit-integrations'), required: false },
    { key: 'company', label: __('Company', 'bit-integrations'), required: false },
    { key: 'birthday', label: __('Birthday', 'bit-integrations'), required: false },
    { key: 'anniversary', label: __('Anniversary', 'bit-integrations'), required: false },
    { key: 'spouse_name', label: __('Spouse Name', 'bit-integrations'), required: false },
    { key: 'spouse_email', label: __('Spouse Email', 'bit-integrations'), required: false },
    { key: 'spouse_phone', label: __('Spouse Phone', 'bit-integrations'), required: false },
    { key: 'spouse_birthday', label: __('Spouse Birthday', 'bit-integrations'), required: false },
    { key: 'type', label: __('Address type', 'bit-integrations'), required: false },
    { key: 'street_address_1', label: __('Street Address 1', 'bit-integrations'), required: false },
    { key: 'street_address_2', label: __('Street Address 2', 'bit-integrations'), required: false },
    { key: 'zip', label: __('Zip', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false }
  ]

  const [lionDeskConf, setLionDeskConf] = useState({
    name: 'LionDesk',
    type: 'LionDesk',
    clientId: '',
    clientSecret: '',
    field_map: [{ formField: '', lionDeskFormField: '' }],
    actionName: '',
    actionId: '',
    campaignFields,
    contactFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      lionDeskConf,
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

    if (!checkMappedFields(lionDeskConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    lionDeskConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <LionDeskAuthorization
        lionDeskConf={lionDeskConf}
        setLionDeskConf={setLionDeskConf}
        step={step}
        setStep={setStep}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <LionDeskIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, lionDeskConf, setLionDeskConf, setLoading, setSnackbar)}
          lionDeskConf={lionDeskConf}
          setLionDeskConf={setLionDeskConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {lionDeskConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(lionDeskConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {/* STEP 3 */}
      {lionDeskConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={lionDeskConf}
          setDataConf={setLionDeskConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default LionDesk
