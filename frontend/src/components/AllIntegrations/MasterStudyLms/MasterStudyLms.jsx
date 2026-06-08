import { useEffect, useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { useRecoilValue } from 'recoil'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { handleInput, checkMappedFields } from './MasterStudyLmsCommonFunc'
import MasterStudyLmsAuthorization from './MasterStudyLmsAuthorization'
import MasterStudyLmsIntegLayout from './MasterStudyLmsIntegLayout'
import TutorialLink from '../../Utilities/TutorialLink'

function MasterStudyLms({ formFields, setFlow, flow, allIntegURL, isInfo, edit }) {
  const navigate = useNavigate()
  const { formID } = useParams()

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const allActions = [
    { key: '1', label: __('Course complete for the user', 'bit-integrations') },
    { key: '2', label: __('Lesson complete for the user', 'bit-integrations') },
    { key: '3', label: __('Quiz complete for the user', 'bit-integrations') },
    { key: '4', label: __('Reset user course', 'bit-integrations') },
    { key: '5', label: __('Reset user lesson', 'bit-integrations') }
  ]

  const [msLmsConf, setMsLmsConf] = useState({
    name: 'MasterStudyLms',
    type: 'MasterStudyLms',
    mainAction: '',
    field_map: [{ formField: '', msLmsFormField: '' }],
    allActions,
    actions: {}
  })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (msLmsConf.mainAction !== '') {
      setStep(3)
    }
  }

  function isDisabled() {
    switch (msLmsConf.mainAction) {
      case '1':
        return msLmsConf.courseId === undefined
      case '4':
        return msLmsConf.courseId === undefined
      case '2':
        return msLmsConf.lessonId === undefined
      case '5':
        return msLmsConf.lessonId === undefined
      case '3':
        return msLmsConf.quizId === undefined
      default:
        return false
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <MasterStudyLmsAuthorization
        formID={formID}
        msLmsConf={msLmsConf}
        setMsLmsConf={setMsLmsConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <MasterStudyLmsIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, msLmsConf, setMsLmsConf, setIsLoading, setSnackbar, formID)}
          msLmsConf={msLmsConf}
          setMsLmsConf={setMsLmsConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
          allIntegURL={allIntegURL}
          isInfo={isInfo}
          edit={edit}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={!msLmsConf.mainAction || isLoading || isDisabled()}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>
      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            navigate,
            conf: msLmsConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={msLmsConf}
        setDataConf={setMsLmsConf}
        formFields={formFields}
      />
    </div>
  )
}

export default MasterStudyLms
