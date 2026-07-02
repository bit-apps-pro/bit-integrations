import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ConvertForceAuthorization from './ConvertForceAuthorization'
import { checkMappedFields } from './ConvertForceCommonFunc'
import ConvertForceIntegLayout from './ConvertForceIntegLayout'

export default function ConvertForce({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [convertForceConf, setConvertForceConf] = useState({
    name: 'ConvertForce Popup Builder',
    type: 'ConvertForce',
    field_map: [{ formField: '', convertForceField: '' }],
    utilities: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!convertForceConf.mainAction) {
        setSnackbar({
          show: true,
          msg: __('Please select an action to continue.', 'bit-integrations')
        })
        return
      }

      if (!checkMappedFields(convertForceConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }
    }

    setStep(val)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">{/* <Steps step={3} active={step} /> */}</div>

      <ConvertForceAuthorization
        convertForceConf={convertForceConf}
        setConvertForceConf={setConvertForceConf}
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
        <ConvertForceIntegLayout
          formFields={formFields}
          convertForceConf={convertForceConf}
          setConvertForceConf={setConvertForceConf}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={!convertForceConf.mainAction}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, convertForceConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={convertForceConf}
        setDataConf={setConvertForceConf}
        formFields={formFields}
      />
    </div>
  )
}
