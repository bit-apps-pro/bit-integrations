import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import DoubleScaleCrmAuthorization from './DoubleScaleCrmAuthorization'
import { getConfError } from './DoubleScaleCrmCommonFunc'
import DoubleScaleCrmIntegLayout from './DoubleScaleCrmIntegLayout'

export default function DoubleScaleCrm({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [doubleScaleCrmConf, setDoubleScaleCrmConf] = useState({
    name: 'DoubleScale CRM',
    type: 'DoubleScaleCrm',
    field_map: [{ formField: '', doubleScaleCrmField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const confError = getConfError(doubleScaleCrmConf)

      if (confError) {
        setSnackbar({ show: true, msg: confError })
        return
      }

      if (doubleScaleCrmConf.name !== '' && doubleScaleCrmConf.field_map.length > 0) {
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

      <DoubleScaleCrmAuthorization
        formID={formID}
        doubleScaleCrmConf={doubleScaleCrmConf}
        setDoubleScaleCrmConf={setDoubleScaleCrmConf}
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
        <DoubleScaleCrmIntegLayout
          formID={formID}
          formFields={formFields}
          doubleScaleCrmConf={doubleScaleCrmConf}
          setDoubleScaleCrmConf={setDoubleScaleCrmConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={doubleScaleCrmConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, doubleScaleCrmConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={doubleScaleCrmConf}
        setDataConf={setDoubleScaleCrmConf}
        formFields={formFields}
      />
    </div>
  )
}
