import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import {
  fetchAllLesson,
  fetchAllMsLmsCourse,
  fetchAllQuiz,
  generateMappedField,
  MS_LMS_ACTIONS,
  msLmsUserFields
} from './MasterStudyLmsCommonFunc'
import MasterStudyLmsFieldMap from './MasterStudyLmsFieldMap'
import Note from '../../Utilities/Note'
import { allActions } from './MasterStudyLms'

export default function MasterStudyLmsIntegLayout({
  formFields,
  handleInput,
  msLmsConf,
  setMsLmsConf,
  isLoading,
  setIsLoading,
  setSnackbar,
  allIntegURL,
  isInfo,
  edit
}) {
  const { isPro } = useRecoilValue($appConfigState)

  const {
    COMPLETE_COURSE,
    COMPLETE_LESSON,
    COMPLETE_QUIZ,
    RESET_COURSE,
    RESET_LESSON,
    ENROLL_USER,
    UNENROLL_USER,
    MARK_COURSE_COMPLETE,
    MARK_LESSON_COMPLETE
  } = MS_LMS_ACTIONS

  const courseActions = [
    COMPLETE_COURSE,
    COMPLETE_LESSON,
    COMPLETE_QUIZ,
    RESET_COURSE,
    RESET_LESSON,
    ENROLL_USER,
    UNENROLL_USER,
    MARK_COURSE_COMPLETE,
    MARK_LESSON_COMPLETE
  ]
  const lessonActions = [COMPLETE_LESSON, RESET_LESSON, MARK_LESSON_COMPLETE]
  const emailActions = [ENROLL_USER, UNENROLL_USER, MARK_COURSE_COMPLETE, MARK_LESSON_COMPLETE]
  const loggedInActions = [COMPLETE_COURSE, COMPLETE_LESSON, COMPLETE_QUIZ, RESET_COURSE, RESET_LESSON]

  useEffect(() => {
    if (courseActions.includes(msLmsConf.mainAction)) {
      fetchAllMsLmsCourse(msLmsConf, setMsLmsConf, setIsLoading, setSnackbar)
    }
  }, [msLmsConf.mainAction])

  const changeHandler = (val, status) => {
    const newConf = { ...msLmsConf }
    if (val !== '') {
      newConf[status] = val
      if (lessonActions.includes(msLmsConf.mainAction)) {
        fetchAllLesson(newConf, setMsLmsConf, setIsLoading, setSnackbar)
      }
      if (msLmsConf.mainAction === COMPLETE_QUIZ) {
        fetchAllQuiz(newConf, setMsLmsConf, setIsLoading, setSnackbar)
      }
    } else {
      delete newConf[status]
    }
    setMsLmsConf({ ...newConf })
  }

  const handleMainAction = val => {
    const newConf = { ...msLmsConf, mainAction: val }
    newConf.field_map = emailActions.includes(val)
      ? generateMappedField(msLmsUserFields)
      : [{ formField: '', msLmsFormField: '' }]
    setMsLmsConf(newConf)
  }
  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
        <MultiSelect
          className="w-5"
          singleSelect
          closeOnSelect
          defaultValue={msLmsConf?.mainAction ?? null}
          options={allActions?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.key,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          onChange={handleMainAction}
        />
      </div>
      <br />
      <br />
      {courseActions.includes(msLmsConf.mainAction) && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select a Course:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            singleSelect
            defaultValue={msLmsConf?.courseId}
            options={
              msLmsConf?.default?.allCourse &&
              msLmsConf.default.allCourse.map(item => ({
                label: item.post_title,
                value: item.ID.toString()
              }))
            }
            onChange={val => changeHandler(val, 'courseId')}
          />
          <button
            onClick={() => fetchAllMsLmsCourse(msLmsConf, setMsLmsConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch course list', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}
      {lessonActions.includes(msLmsConf.mainAction) && msLmsConf?.courseId && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select Lesson:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            singleSelect
            defaultValue={msLmsConf?.lessonId}
            options={
              msLmsConf?.default?.allLesson &&
              msLmsConf.default.allLesson.map(item => ({
                label: item.post_title,
                value: item.ID.toString()
              }))
            }
            onChange={val => changeHandler(val, 'lessonId')}
          />
          <button
            onClick={() => fetchAllLesson(msLmsConf, setMsLmsConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch lesson list', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}
      {msLmsConf.mainAction === COMPLETE_QUIZ && msLmsConf?.courseId && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select Quiz:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            singleSelect
            defaultValue={msLmsConf?.quizId}
            options={
              msLmsConf?.default?.allQuiz &&
              msLmsConf.default.allQuiz.map(item => ({
                label: item.post_title,
                value: item.ID.toString()
              }))
            }
            onChange={val => changeHandler(val, 'quizId')}
          />
          <button
            onClick={() => fetchAllQuiz(msLmsConf, setMsLmsConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch quiz list', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}

      {emailActions.includes(msLmsConf.mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map User Email', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('MasterStudy LMS Fields', 'bit-integrations')}</b>
            </div>
          </div>
          {msLmsConf?.field_map?.map((itm, idx) => (
            <MasterStudyLmsFieldMap
              key={`mslms-fm-${idx}`}
              i={idx}
              field={itm}
              msLmsFields={msLmsUserFields}
              msLmsConf={msLmsConf}
              formFields={formFields}
              setMsLmsConf={setMsLmsConf}
            />
          ))}
        </div>
      )}

      <br />
      <br />
      {isLoading && (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            transform: 'scale(0.7)'
          }}
        />
      )}
      {loggedInActions.includes(msLmsConf.mainAction) && (
        <Note note={__('This integration will only work for logged-in users.', 'bit-integrations')} />
      )}
      {emailActions.includes(msLmsConf.mainAction) && (
        <Note
          note={__(
            'This action targets the user matching the provided email. The user must already exist.',
            'bit-integrations'
          )}
        />
      )}
    </>
  )
}
