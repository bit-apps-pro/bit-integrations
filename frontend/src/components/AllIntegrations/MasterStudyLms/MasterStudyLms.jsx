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
import {
  handleInput,
  checkMappedFields,
  isUserEmailMapped,
  MS_LMS_ACTIONS
} from './MasterStudyLmsCommonFunc'
import MasterStudyLmsAuthorization from './MasterStudyLmsAuthorization'
import MasterStudyLmsIntegLayout from './MasterStudyLmsIntegLayout'
import TutorialLink from '../../Utilities/TutorialLink'

export const allActions = [
  { key: MS_LMS_ACTIONS.COMPLETE_COURSE, label: __('Course complete for the user', 'bit-integrations') },
  { key: MS_LMS_ACTIONS.COMPLETE_LESSON, label: __('Lesson complete for the user', 'bit-integrations') },
  { key: MS_LMS_ACTIONS.COMPLETE_QUIZ, label: __('Quiz complete for the user', 'bit-integrations') },
  { key: MS_LMS_ACTIONS.RESET_COURSE, label: __('Reset user course', 'bit-integrations') },
  { key: MS_LMS_ACTIONS.RESET_LESSON, label: __('Reset user lesson', 'bit-integrations') },
  {
    key: MS_LMS_ACTIONS.ENROLL_USER,
    label: __('Enroll user in a course', 'bit-integrations'),
    is_pro: true
  },
  {
    key: MS_LMS_ACTIONS.UNENROLL_USER,
    label: __('Unenroll user from a course', 'bit-integrations'),
    is_pro: true
  },
  {
    key: MS_LMS_ACTIONS.MARK_COURSE_COMPLETE,
    label: __('Mark a course complete for the user', 'bit-integrations'),
    is_pro: true
  },
  {
    key: MS_LMS_ACTIONS.MARK_LESSON_COMPLETE,
    label: __('Mark a lesson complete for the user', 'bit-integrations'),
    is_pro: true
  }
]

function MasterStudyLms({ formFields, setFlow, flow, allIntegURL, isInfo, edit }) {
  const navigate = useNavigate()
  const { formID } = useParams()

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [msLmsConf, setMsLmsConf] = useState({
    name: 'MasterStudyLms',
    type: 'MasterStudyLms',
    mainAction: '',
    field_map: [{ formField: '', msLmsFormField: '' }],
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
      case MS_LMS_ACTIONS.COMPLETE_COURSE:
        return msLmsConf.courseId === undefined
      case MS_LMS_ACTIONS.RESET_COURSE:
        return msLmsConf.courseId === undefined
      case MS_LMS_ACTIONS.COMPLETE_LESSON:
        return msLmsConf.lessonId === undefined
      case MS_LMS_ACTIONS.RESET_LESSON:
        return msLmsConf.lessonId === undefined
      case MS_LMS_ACTIONS.COMPLETE_QUIZ:
        return msLmsConf.quizId === undefined
      case MS_LMS_ACTIONS.ENROLL_USER:
      case MS_LMS_ACTIONS.UNENROLL_USER:
      case MS_LMS_ACTIONS.MARK_COURSE_COMPLETE:
        return msLmsConf.courseId === undefined || !isUserEmailMapped(msLmsConf)
      case MS_LMS_ACTIONS.MARK_LESSON_COMPLETE:
        return (
          msLmsConf.courseId === undefined ||
          msLmsConf.lessonId === undefined ||
          !isUserEmailMapped(msLmsConf)
        )
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
