import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import VikRentCarAuthorization from './VikRentCarAuthorization'
import { checkMappedFields, getMissingSelectMessage } from './VikRentCarCommonFunc'
import VikRentCarIntegLayout from './VikRentCarIntegLayout'

export default function VikRentCar({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [vikRentCarConf, setVikRentCarConf] = useState({
    name: 'VikRentCar',
    type: 'VikRentCar',
    field_map: [{ formField: '', vikRentCarField: '' }],
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const missingSelectMessage = getMissingSelectMessage(vikRentCarConf)

      if (missingSelectMessage) {
        setSnackbar({ show: true, msg: missingSelectMessage })
        return
      }

      if (!checkMappedFields(vikRentCarConf)) {
        setSnackbar({
          show: true,
          msg: __('Some field map rows are empty. Map each row or remove it.', 'bit-integrations')
        })
        return
      }

      if (vikRentCarConf.name !== '' && vikRentCarConf.field_map.length > 0) {
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

      <VikRentCarAuthorization
        vikRentCarConf={vikRentCarConf}
        setVikRentCarConf={setVikRentCarConf}
        step={step}
        nextPage={nextPage}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <VikRentCarIntegLayout
          formFields={formFields}
          vikRentCarConf={vikRentCarConf}
          setVikRentCarConf={setVikRentCarConf}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={vikRentCarConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, vikRentCarConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={vikRentCarConf}
        setDataConf={setVikRentCarConf}
        formFields={formFields}
      />
    </div>
  )
}
