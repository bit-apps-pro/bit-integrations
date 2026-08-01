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
import SmailyAuthorization from './SmailyAuthorization'
import { checkMappedFields, handleInput } from './SmailyCommonFunc'
import SmailyIntegLayout from './SmailyIntegLayout'

function Smaily({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({ auth: false })

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const staticFields = [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'birthday', label: __('Birthday', 'bit-integrations'), required: false }
  ]

  const [smailyConf, setSmailyConf] = useState({
    name: 'Smaily',
    type: 'Smaily',
    subdomain: '',
    api_user_name: '',
    api_user_password: '',
    field_map: [{ formField: '', smailyFormField: '' }],
    staticFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, smailyConf, navigate, '', '', setIsLoading)
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

    if (!checkMappedFields(smailyConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    smailyConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <SmailyAuthorization
        smailyConf={smailyConf}
        setSmailyConf={setSmailyConf}
        step={step}
        setStep={setStep}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <SmailyIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, smailyConf, setSmailyConf, setLoading, setSnackbar)}
          smailyConf={smailyConf}
          setSmailyConf={setSmailyConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={!checkMappedFields(smailyConf)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={smailyConf}
        setDataConf={setSmailyConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Smaily
