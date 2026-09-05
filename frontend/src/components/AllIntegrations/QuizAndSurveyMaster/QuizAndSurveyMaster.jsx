import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import QuizAndSurveyMasterAuthorization from './QuizAndSurveyMasterAuthorization'
import { checkMappedFields } from './QuizAndSurveyMasterCommonFunc'
import QuizAndSurveyMasterIntegLayout from './QuizAndSurveyMasterIntegLayout'

export default function QuizAndSurveyMaster({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [quizAndSurveyMasterConf, setQuizAndSurveyMasterConf] = useState({
    name: 'QuizAndSurveyMaster',
    type: 'QuizAndSurveyMaster',
    field_map: [{ formField: '', quizAndSurveyMasterField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (
        quizAndSurveyMasterConf.mainAction === 'update_quiz_settings' &&
        (!quizAndSurveyMasterConf?.selectedSection || !quizAndSurveyMasterConf?.selectedSettingKey)
      ) {
        setSnackbar({
          show: true,
          msg: __('Please select a settings section and key to continue.', 'bit-integrations')
        })
        return
      }

      if (
        quizAndSurveyMasterConf.mainAction === 'create_question' &&
        !quizAndSurveyMasterConf?.selectedQuestionType
      ) {
        setSnackbar({
          show: true,
          msg: __('Please select a question type to continue.', 'bit-integrations')
        })
        return
      }

      if (!checkMappedFields(quizAndSurveyMasterConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (quizAndSurveyMasterConf.name !== '' && quizAndSurveyMasterConf.field_map.length > 0) {
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

      <QuizAndSurveyMasterAuthorization
        formID={formID}
        quizAndSurveyMasterConf={quizAndSurveyMasterConf}
        setQuizAndSurveyMasterConf={setQuizAndSurveyMasterConf}
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
        <QuizAndSurveyMasterIntegLayout
          formID={formID}
          formFields={formFields}
          quizAndSurveyMasterConf={quizAndSurveyMasterConf}
          setQuizAndSurveyMasterConf={setQuizAndSurveyMasterConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={quizAndSurveyMasterConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(
            flow,
            setFlow,
            allIntegURL,
            quizAndSurveyMasterConf,
            navigate,
            '',
            '',
            setIsLoading
          )
        }
        isLoading={isLoading}
        dataConf={quizAndSurveyMasterConf}
        setDataConf={setQuizAndSurveyMasterConf}
        formFields={formFields}
      />
    </div>
  )
}
