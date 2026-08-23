/* eslint-disable no-unused-expressions */
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { getAllCourses, getAllLesson } from './TutorLmsCommonFunc'
import UserEmailFieldMap from '../IntegrationHelpers/UserEmailFieldMap'
import UserSourceSelect from '../IntegrationHelpers/UserSourceSelect'
import Note from '../../Utilities/Note'

export default function TutorLmsIntegLayout({
  formFields,
  tutorlmsConf,
  setTutorlmsConf,
  isLoading,
  setIsLoading
}) {
  const action = [
    { value: 'enroll-course', label: __('Enroll the user in a course', 'bit-integrations') },
    { value: 'unenroll-course', label: __('Unenroll user from a course', 'bit-integrations') },
    {
      value: 'complete-course',
      label: __('Mark a course complete for the user', 'bit-integrations')
    },
    {
      value: 'complete-lesson',
      label: __('Mark a lesson complete for the user', 'bit-integrations')
    },
    { value: 'reset-course', label: __('Reset the user progress in a course', 'bit-integrations') }
  ]

  const handleAction = e => {
    const newConf = { ...tutorlmsConf }
    const { name, value } = e.target
    if (e.target.value !== '') {
      newConf[name] = value
    } else {
      delete newConf[name]
    }
    if (name === 'actionName') {
      if (newConf?.selectedCourse) delete newConf.selectedCourse
      if (newConf?.selectedLesson) delete newConf.selectedLesson
      if (newConf?.selectedAllCourse) delete newConf.selectedAllCourse
      setTutorlmsConf({ ...newConf })

      if (
        value === 'enroll-course' ||
        value === 'unenroll-course' ||
        value === 'complete-course' ||
        value === 'reset-course'
      ) {
        getAllCourses(newConf, setTutorlmsConf, setIsLoading, value)
      } else if (value === 'complete-lesson') {
        getAllLesson(newConf, setTutorlmsConf, setIsLoading)
      }
    } else {
      setTutorlmsConf({ ...newConf })
    }
  }

  const setChanges = (val, type) => {
    const newConf = { ...tutorlmsConf }
    if (val) {
      if (type === 'selectedCourse' && val.includes('all-course')) {
        newConf.selectedAllCourse = newConf.default.courses
      }
      newConf[type] = val ? val.split(',') : []
    } else {
      newConf?.selectedAllCourse && delete newConf.selectedAllCourse
    }
    setTutorlmsConf({ ...newConf })
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <select
          onChange={handleAction}
          name="actionName"
          value={tutorlmsConf?.actionName}
          className="btcd-paper-inp w-5">
          <option value="">{__('Select Action', 'bit-integrations')}</option>
          {action.map(({ label, value }) => (
            <option key={label} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <br />

      {tutorlmsConf?.actionName && (
        <>
          <UserSourceSelect conf={tutorlmsConf} setConf={setTutorlmsConf} mapKey="tutorField" />
          <br />
        </>
      )}

      {(tutorlmsConf?.actionName === 'enroll-course' ||
        tutorlmsConf?.actionName === 'unenroll-course' ||
        tutorlmsConf?.actionName === 'complete-course' ||
        tutorlmsConf?.actionName === 'reset-course') && (
        <div className="flx">
          <b className="wdt-200 d-in-b">{__('Select Course:', 'bit-integrations')}</b>
          <MultiSelect
            defaultValue={tutorlmsConf?.selectedCourse}
            className="btcd-paper-drpdwn w-5"
            options={
              tutorlmsConf?.default?.courses &&
              tutorlmsConf.default.courses.map(course => ({
                label: course.courseTitle,
                value: course.courseId.toString()
              }))
            }
            onChange={val => setChanges(val, 'selectedCourse')}
            singleSelect={
              tutorlmsConf?.actionName === 'complete-course' ||
              tutorlmsConf?.actionName === 'reset-course'
            }
          />
          <button
            onClick={() =>
              getAllCourses(tutorlmsConf, setTutorlmsConf, setIsLoading, tutorlmsConf?.actionName)
            }
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `${__('Refresh Courses', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}
      {tutorlmsConf?.actionName === 'complete-lesson' && (
        <div className="flx">
          <b className="wdt-200 d-in-b">{__('Select Lessons:', 'bit-integrations')}</b>
          <MultiSelect
            defaultValue={tutorlmsConf?.selectedLesson}
            className="btcd-paper-drpdwn w-5"
            options={
              tutorlmsConf?.default?.lessons &&
              tutorlmsConf.default.lessons.map(lesson => ({
                label: lesson.lessonTitle,
                value: lesson.lessonId.toString()
              }))
            }
            onChange={val => setChanges(val, 'selectedLesson')}
            singleSelect
          />
          <button
            onClick={() => getAllLesson(tutorlmsConf, setTutorlmsConf, setIsLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `${__('Refresh Courses', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}

      {tutorlmsConf?.actionName && tutorlmsConf?.userSource === 'email' && (
        <UserEmailFieldMap
          conf={tutorlmsConf}
          setConf={setTutorlmsConf}
          formFields={formFields}
          mapKey="tutorField"
          actionLabel={__('Tutor LMS Fields', 'bit-integrations')}
        />
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
      {tutorlmsConf?.userSource === 'email' ? (
        <Note
          note={__(
            'This action runs for the user matching the mapped email. The user must already exist on your site, otherwise the action fails.',
            'bit-integrations'
          )}
        />
      ) : (
        <Note note={__('This integration will only work for logged-in users.', 'bit-integrations')} />
      )}
    </>
  )
}
