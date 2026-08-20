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
import NimbleAuthorization from './NimbleAuthorization'
import { checkMappedFields } from './NimbleCommonFunc'
import NimbleIntegLayout from './NimbleIntegLayout'

function Nimble({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [nimbleConf, setNimbleConf] = useState({
    name: 'Nimble',
    type: 'Nimble',
    api_key: '',
    field_map: [{ formField: '', nimbleFormField: '' }],
    actionName: '',
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, nimbleConf, navigate, '', '', setIsLoading)
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

    if (!checkMappedFields(nimbleConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    nimbleConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <NimbleAuthorization
        nimbleConf={nimbleConf}
        setNimbleConf={setNimbleConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <NimbleIntegLayout
          formFields={formFields}
          nimbleConf={nimbleConf}
          setNimbleConf={setNimbleConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {nimbleConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(nimbleConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {nimbleConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={nimbleConf}
          setDataConf={setNimbleConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Nimble
