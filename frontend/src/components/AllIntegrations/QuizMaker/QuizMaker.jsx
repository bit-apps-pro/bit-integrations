import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import QuizMakerAuthorization from './QuizMakerAuthorization'
import { checkMappedFields } from './QuizMakerCommonFunc'
import QuizMakerIntegLayout from './QuizMakerIntegLayout'
import { needsQuestionStatus, needsQuestionType, needsQuizStatus, needsReviewScore } from './staticData'

export default function QuizMaker({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [quizMakerConf, setQuizMakerConf] = useState({
    name: 'QuizMaker',
    type: 'QuizMaker',
    field_map: [{ formField: '', quizMakerField: '' }],
    actions: {},
    mainAction: ''
  })

  const requiredSelectMissing = () => {
    const { mainAction } = quizMakerConf

    if (
      needsQuestionCategory.includes(mainAction) &&
      mainAction === 'create_question' &&
      !quizMakerConf?.selectedQuestionCategory
    ) {
      return __('Please select a question category to continue.', 'bit-integrations')
    }
    if (needsQuestionType.includes(mainAction) && !quizMakerConf?.questionType) {
      return __('Please select a question type to continue.', 'bit-integrations')
    }
    if (needsQuizStatus.includes(mainAction) && !quizMakerConf?.quizStatus) {
      return __('Please select a status to continue.', 'bit-integrations')
    }
    if (needsQuestionStatus.includes(mainAction) && !quizMakerConf?.questionStatus) {
      return __('Please select a status to continue.', 'bit-integrations')
    }
    if (needsReviewScore.includes(mainAction) && !quizMakerConf?.reviewScore) {
      return __('Please select a rating to continue.', 'bit-integrations')
    }

    return ''
  }

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const missing = requiredSelectMissing()

      if (missing) {
        setSnackbar({ show: true, msg: missing })
        return
      }

      if (!checkMappedFields(quizMakerConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (quizMakerConf.name !== '' && quizMakerConf.field_map.length > 0) {
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

      <QuizMakerAuthorization
        formID={formID}
        quizMakerConf={quizMakerConf}
        setQuizMakerConf={setQuizMakerConf}
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
        <QuizMakerIntegLayout
          formID={formID}
          formFields={formFields}
          quizMakerConf={quizMakerConf}
          setQuizMakerConf={setQuizMakerConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={quizMakerConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, quizMakerConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={quizMakerConf}
        setDataConf={setQuizMakerConf}
        formFields={formFields}
      />
    </div>
  )
}
