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
import BentoAuthorization from './BentoAuthorization'
import { checkMappedFields } from './BentoCommonFunc'
import BentoIntegLayout from './BentoIntegLayout'

function Bento({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [bentoConf, setBentoConf] = useState({
    name: 'Bento',
    type: 'Bento',
    publishable_key: '',
    secret_key: '',
    site_uuid: '',
    field_map: [{ formField: '', bentoFormField: '' }],
    action: '',
    actions: [
      { value: 'add_people', label: __('Add People', 'bit-integrations'), is_pro: false },
      { value: 'add_event', label: __('Add Event', 'bit-integrations'), is_pro: true }
    ]
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, bentoConf, navigate, '', '', setIsLoading)
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

    bentoConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <BentoAuthorization
        bentoConf={bentoConf}
        setBentoConf={setBentoConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <BentoIntegLayout
          formFields={formFields}
          bentoConf={bentoConf}
          setBentoConf={setBentoConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {bentoConf?.action && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(bentoConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {bentoConf?.action && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={bentoConf}
          setDataConf={setBentoConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Bento
