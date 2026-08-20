/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import TutorLmsAuthorization from './TutorLmsAuthorization'
import TutorLmsIntegLayout from './TutorLmsIntegLayout'
import { handleInput } from './TutorLmsCommonFunc'

function TutorLms({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [tutorlmsConf, setTutorlmsConf] = useState({
    name: 'Tutor LMS',
    type: 'Tutor Lms',
    field_map: [{ formField: '', tutorField: '' }],
    actions: {},
    actionData: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: tutorlmsConf,
      navigate,
      setIsLoading,
      setSnackbar
    })
  }
  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <TutorLmsAuthorization
        tutorlmsConf={tutorlmsConf}
        setTutorlmsConf={setTutorlmsConf}
        step={step}
        setStep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{
          ...(step === 2 && {
            width: 900,
            height: 'auto',
            minHeight: step === 2 && '500px',
            overflow: 'visible'
          })
        }}>
        <TutorLmsIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, tutorlmsConf, setTutorlmsConf, setIsLoading, setSnackbar)}
          tutorlmsConf={tutorlmsConf}
          setTutorlmsConf={setTutorlmsConf}
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
        dataConf={tutorlmsConf}
        setDataConf={setTutorlmsConf}
        formFields={formFields}
      />
    </div>
  )
}

export default TutorLms
