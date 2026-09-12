/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { isUserSourceIncomplete } from '../IntegrationHelpers/userSource'
import AcademyLmsAuthorization from './AcademyLmsAuthorization'
import { handleInput } from './AcademyLmsCommonFunc'
import AcademyLmsIntegLayout from './AcademyLmsIntegLayout'

function AcademyLms({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [academyLmsConf, setAcademyLmsConf] = useState({
    name: 'Academy Lms',
    type: 'Academy Lms',
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
      conf: academyLmsConf,
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

      <AcademyLmsAuthorization
        academyLmsConf={academyLmsConf}
        setAcademyLmsConf={setAcademyLmsConf}
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
        <AcademyLmsIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, academyLmsConf, setAcademyLmsConf, setIsLoading, setSnackbar)}
          academyLmsConf={academyLmsConf}
          setAcademyLmsConf={setAcademyLmsConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={isLoading || isUserSourceIncomplete(academyLmsConf)}
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
        dataConf={academyLmsConf}
        setDataConf={setAcademyLmsConf}
        formFields={formFields}
      />
    </div>
  )
}

export default AcademyLms
