import { useEffect, useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import CustomApiAuthorization from './CustomApiAuthorization'
import CustomApiIntegrationLayout from './CustomApiIntegrationLayout'

function CustomApi({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [customApiConf, setCustomApiConf] = useState({
    name: 'CustomApi',
    type: 'CustomApi',
    url: '',
    field_map: [{ formField: '', customApiFormField: '' }],
    actions: {}
  })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setStep(3)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <CustomApiAuthorization
        formID={formID}
        customApiConf={customApiConf}
        setCustomApiConf={setCustomApiConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: '1000px', overflow: 'visible' }) }}>
        <CustomApiIntegrationLayout
          formID={formID}
          formFields={formFields}
          customApiConf={customApiConf}
          setCustomApiConf={setCustomApiConf}
          create
          step
          setStep
        />
        <button onClick={() => nextPage(3)} className="btn btcd-btn-lg purple sh-sm flx" type="button">
          {__('Next', 'bit-integrations')}
          &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            navigate,
            conf: customApiConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={customApiConf}
        setDataConf={setCustomApiConf}
        formFields={formFields}
      />
    </div>
  )
}

export default CustomApi
