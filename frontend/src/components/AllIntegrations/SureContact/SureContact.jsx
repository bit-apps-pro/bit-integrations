import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SureContactAuthorization from './SureContactAuthorization'
import { checkMappedFields } from './SureContactCommonFunc'
import SureContactIntegLayout from './SureContactIntegLayout'
import 'react-multiple-select-dropdown-lite/dist/index.css'

function SureContact({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [sureContactConf, setSureContactConf] = useState({
    sureContactFields: [],
    field_map: [{ sureContactField: '', formField: '' }],
    name: 'SureContact',
    type: 'SureContact',
    utilities: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      sureContactConf,
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

    if (!checkMappedFields(sureContactConf)) {
      toast.error(__('Please select an action and map mandatory fields', 'bit-integrations'))

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

      <SureContactAuthorization
        sureContactConf={sureContactConf}
        setSureContactConf={setSureContactConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { height: 500, overflow: 'visible', width: 900 }) }}>
        <SureContactIntegLayout
          formFields={formFields}
          sureContactConf={sureContactConf}
          setSureContactConf={setSureContactConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

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
        dataConf={sureContactConf}
        setDataConf={setSureContactConf}
        formFields={formFields}
      />
    </div>
  )
}

export default SureContact
