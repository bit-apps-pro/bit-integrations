import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import AutonamiAuthorization from './AutonamiAuthorization'
import { checkMappedFields, getAutonamiFields } from './AutonamiCommonFunc'
import AutonamiIntegLayout from './AutonamiIntegLayout'

export default function Autonami({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [autonamiConf, setAutonamiConf] = useState({
    name: 'Autonami',
    type: 'Autonami',
    field_map: [{ formField: '', autonamiField: '' }],
    actions: {}
  })

  const nextPage = val => {
    if (val == 2 && autonamiConf.name !== '') {
      getAutonamiFields(autonamiConf, setAutonamiConf, setIsLoading, setSnackbar)
      setStep(val)
    } else if (val == 3) {
      if (!checkMappedFields(autonamiConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }
      if (autonamiConf.field_map.length > 0) {
        setStep(val)
      }
    }

    document.getElementById('btcd-settings-wrp').scrollTop = 0
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <AutonamiAuthorization
        formID={formID}
        autonamiConf={autonamiConf}
        setAutonamiConf={setAutonamiConf}
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
        <AutonamiIntegLayout
          formID={formID}
          formFields={formFields}
          autonamiConf={autonamiConf}
          setAutonamiConf={setAutonamiConf}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={autonamiConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: autonamiConf,
            navigate,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={autonamiConf}
        setDataConf={setAutonamiConf}
        formFields={formFields}
      />
    </div>
  )
}
