import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import BrilliantDirectoriesAuthorization from './BrilliantDirectoriesAuthorization'
import { checkMappedFields } from './BrilliantDirectoriesCommonFunc'
import BrilliantDirectoriesIntegLayout from './BrilliantDirectoriesIntegLayout'
import 'react-multiple-select-dropdown-lite/dist/index.css'

function BrilliantDirectories({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [brilliantDirectoriesConf, setBrilliantDirectoriesConf] = useState({
    brilliantDirectoriesFields: [],
    field_map: [{ brilliantDirectoriesField: '', formField: '' }],
    name: 'Brilliant Directories',
    type: 'BrilliantDirectories',
    utilities: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      brilliantDirectoriesConf,
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

    if (!checkMappedFields(brilliantDirectoriesConf)) {
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

      <BrilliantDirectoriesAuthorization
        brilliantDirectoriesConf={brilliantDirectoriesConf}
        setBrilliantDirectoriesConf={setBrilliantDirectoriesConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { height: 'auto', overflow: 'visible', width: 900 }) }}>
        <BrilliantDirectoriesIntegLayout
          formFields={formFields}
          brilliantDirectoriesConf={brilliantDirectoriesConf}
          setBrilliantDirectoriesConf={setBrilliantDirectoriesConf}
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
        dataConf={brilliantDirectoriesConf}
        setDataConf={setBrilliantDirectoriesConf}
        formFields={formFields}
      />
    </div>
  )
}

export default BrilliantDirectories
