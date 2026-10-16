import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import PushbulletAuthorization from './PushbulletAuthorization'
import { checkMappedFields } from './PushbulletCommonFunc'
import PushbulletIntegLayout from './PushbulletIntegLayout'
import 'react-multiple-select-dropdown-lite/dist/index.css'

function Pushbullet({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [pushbulletConf, setPushbulletConf] = useState({
    field_map: [],
    name: 'Pushbullet',
    type: 'Pushbullet',
    utilities: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      pushbulletConf,
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

    if (!checkMappedFields(pushbulletConf)) {
      toast.error(
        __('Please select an action and fill the required options and fields', 'bit-integrations')
      )

      return
    }
    setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <PushbulletAuthorization
        pushbulletConf={pushbulletConf}
        setPushbulletConf={setPushbulletConf}
        step={step}
        setstep={setstep}
      />

      <div
        className="btcd-stp-page"
        style={{
          ...(step === 2 && { height: 'auto', minHeight: 500, overflow: 'visible', width: 900 })
        }}>
        {step === 2 && (
          <PushbulletIntegLayout
            formFields={formFields}
            pushbulletConf={pushbulletConf}
            setPushbulletConf={setPushbulletConf}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        <button
          onClick={() => nextPage(3)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={pushbulletConf}
        setDataConf={setPushbulletConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Pushbullet
