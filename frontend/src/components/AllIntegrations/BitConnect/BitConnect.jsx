import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields, checkRequiredSelect } from './BitConnectCommonFunc'
import BitConnectAuthorization from './BitConnectAuthorization'
import BitConnectIntegLayout from './BitConnectIntegLayout'

export default function BitConnect({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [bitConnectConf, setBitConnectConf] = useState({
    name: 'Bit Connect',
    type: 'BitConnect',
    field_map: [{ formField: '', bitConnectField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const missingSelect = checkRequiredSelect(bitConnectConf)

      if (missingSelect) {
        setSnackbar({ show: true, msg: missingSelect })
        return
      }

      if (!checkMappedFields(bitConnectConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (bitConnectConf.name !== '' && bitConnectConf.field_map.length > 0) {
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

      <BitConnectAuthorization
        formID={formID}
        bitConnectConf={bitConnectConf}
        setBitConnectConf={setBitConnectConf}
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
        <BitConnectIntegLayout
          formID={formID}
          formFields={formFields}
          bitConnectConf={bitConnectConf}
          setBitConnectConf={setBitConnectConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={bitConnectConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, bitConnectConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={bitConnectConf}
        setDataConf={setBitConnectConf}
        formFields={formFields}
      />
    </div>
  )
}
