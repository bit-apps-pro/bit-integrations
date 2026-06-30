import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SenseiLMSAuthorization from './SenseiLMSAuthorization'
import { checkMappedFields } from './SenseiLMSCommonFunc'
import SenseiLMSIntegLayout from './SenseiLMSIntegLayout'

export default function SenseiLMS({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [senseiLMSConf, setSenseiLMSConf] = useState({
    name: 'Sensei LMS',
    type: 'SenseiLMS',
    field_map: [{ formField: '', senseiLMSField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(senseiLMSConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (senseiLMSConf.name !== '' && senseiLMSConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2" />

      <SenseiLMSAuthorization
        senseiLMSConf={senseiLMSConf}
        setSenseiLMSConf={setSenseiLMSConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <SenseiLMSIntegLayout
          formID={formID}
          formFields={formFields}
          senseiLMSConf={senseiLMSConf}
          setSenseiLMSConf={setSenseiLMSConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={senseiLMSConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, senseiLMSConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={senseiLMSConf}
        setDataConf={setSenseiLMSConf}
        formFields={formFields}
      />
    </div>
  )
}
