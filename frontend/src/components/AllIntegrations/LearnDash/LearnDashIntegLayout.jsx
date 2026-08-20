import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import Mail from '../Mail/Mail'
import {
  fetchAllCourse,
  fetchAllCourseOfLesson,
  fetchAllCourseUnenroll,
  fetchAllGroup,
  fetchAllQuiz,
  fetchAllTopicOfLesson
} from './LearnDashCommonFunc'
import LearnDashFieldMap from './LearnDashFieldMap'
import Note from '../../Utilities/Note'

export default function LearnDeshIntegLayout({
  formFields,
  handleInput,
  learnDashConf,
  setLearnDashConf,
  isLoading,
  setIsLoading,
  setSnackbar,
  allIntegURL,
  isInfo,
  edit
}) {
  useEffect(() => {
    if (
      learnDashConf.mainAction === '1' ||
      learnDashConf.mainAction === '3' ||
      learnDashConf.mainAction === '5' ||
      learnDashConf.mainAction === '6' ||
      learnDashConf.mainAction === '8' ||
      learnDashConf.mainAction === '9' ||
      learnDashConf.mainAction === '14' ||
      learnDashConf.mainAction === '17'
    ) {
      fetchAllCourse(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)
    } else if (
      learnDashConf.mainAction === '2' ||
      learnDashConf.mainAction === '4' ||
      learnDashConf.mainAction === '10'
    ) {
      fetchAllGroup(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)
    } else if (learnDashConf.mainAction === '13') {
      fetchAllQuiz(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)
    }
  }, [learnDashConf.mainAction])

  const changeHandler = (val, status) => {
    const newConf = { ...learnDashConf }
    newConf[status] = val

    if (status === 'courseId') {
      fetchAllCourseOfLesson(newConf, setLearnDashConf, setIsLoading, setSnackbar)
    }
    if (status === 'lessonId') {
      fetchAllTopicOfLesson(newConf, setLearnDashConf, setIsLoading, setSnackbar)
    }
    setLearnDashConf({ ...newConf })
  }
  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="mainAction"
        value={learnDashConf.mainAction}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Actions', 'bit-integrations')}</option>
        {learnDashConf.allActions &&
          learnDashConf.allActions.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
      </select>
      <br />
      <br />
      {learnDashConf.mainAction === '1' && (
        <>
          <b className="wdt-200 d-in-b">{__('User Role :', 'bit-integrations')}</b>
          <select
            onChange={handleInput}
            name="userRole"
            value={learnDashConf.userRole}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select User Role', 'bit-integrations')}</option>
            {learnDashConf?.groupUserRole &&
              learnDashConf.groupUserRole.map(item => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
          </select>

          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Course:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={learnDashConf?.courseId}
              options={
                learnDashConf?.default?.allCourse &&
                learnDashConf.default.allCourse.map(item => ({
                  label: item.course_title,
                  value: item.course_id.toString()
                }))
              }
              onChange={val => changeHandler(val, 'courseId')}
            />
            <button
              onClick={() => fetchAllCourse(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Course List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {learnDashConf.mainAction === '2' && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select group:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            defaultValue={learnDashConf?.groupId}
            options={
              learnDashConf?.default?.allGroup &&
              learnDashConf.default.allGroup.map(item => ({
                label: item.group_title,
                value: item.group_id.toString()
              }))
            }
            onChange={val => changeHandler(val, 'groupId')}
          />
          <button
            onClick={() => fetchAllGroup(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch Group List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}

      {learnDashConf.mainAction === '3' && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select Course:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            defaultValue={learnDashConf?.courseId}
            options={
              learnDashConf?.default?.allCourse &&
              learnDashConf.default.allCourse.map(item => ({
                label: item.course_title,
                value: item.course_id.toString()
              }))
            }
            onChange={val => changeHandler(val, 'courseId')}
            singleSelect
          />
          <button
            onClick={() => fetchAllCourse(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch Subscriber List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}

      {learnDashConf.mainAction === '4' && (
        <>
          <b className="wdt-200 d-in-b">{__('All Groups :', 'bit-integrations')}</b>
          <select
            onChange={handleInput}
            name="leaderOfGroup"
            value={learnDashConf.leaderOfGroup}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select group', 'bit-integrations')}</option>
            {learnDashConf?.default?.allGroup &&
              learnDashConf.default.allGroup.map(item => (
                <option key={item.group_id} value={item.group_id}>
                  {item.group_title}
                </option>
              ))}
          </select>
          <button
            onClick={() => fetchAllGroup(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch Group List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
          <br />
          <br />
          <b className="wdt-200 d-in-b">{__('Group leader Role :', 'bit-integrations')}</b>
          <select
            onChange={handleInput}
            name="leaderRole"
            value={learnDashConf.leaderRole}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select Leader Role', 'bit-integrations')}</option>
            {learnDashConf?.groupOfLeader4 &&
              learnDashConf.groupOfLeader4.map(item => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
          </select>
        </>
      )}
      {learnDashConf.mainAction === '5' && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select Course:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            defaultValue={learnDashConf?.courseId}
            options={
              learnDashConf?.default?.allCourse &&
              learnDashConf.default.allCourse.map(item => ({
                label: item.course_title,
                value: item.course_id.toString()
              }))
            }
            onChange={val => changeHandler(val, 'courseId')}
            singleSelect
          />
          <button
            onClick={() => fetchAllCourse(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch Course List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}
      {learnDashConf.mainAction === '6' && (
        <>
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Course:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={learnDashConf?.courseId}
              options={
                learnDashConf?.default?.allCourse &&
                learnDashConf.default.allCourse.map(item => ({
                  label: item.course_title,
                  value: item.course_id.toString()
                }))
              }
              onChange={val => changeHandler(val, 'courseId')}
              singleSelect
            />
            <button
              onClick={() => fetchAllCourse(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Course List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Lesson:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={learnDashConf?.lessonId}
              options={
                learnDashConf?.default?.courseByLesson &&
                learnDashConf.default.courseByLesson.map(item => ({
                  label: item.lesson_title,
                  value: item.lesson_id.toString()
                }))
              }
              onChange={val => changeHandler(val, 'lessonId')}
              singleSelect
            />
            <button
              onClick={() =>
                fetchAllCourseOfLesson(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Lesson List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}
      {learnDashConf.mainAction === '7' && (
        <>
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Course:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={learnDashConf?.courseId}
              options={
                learnDashConf?.default?.allCourse &&
                learnDashConf.default.allCourse.map(item => ({
                  label: item.course_title,
                  value: item.course_id.toString()
                }))
              }
              onChange={val => changeHandler(val, 'courseId')}
              singleSelect
            />
            <button
              onClick={() => fetchAllCourse(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Course List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Lesson:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={learnDashConf?.lessonId}
              options={
                learnDashConf?.default?.courseByLesson &&
                learnDashConf.default.courseByLesson.map(item => ({
                  label: item.lesson_title,
                  value: item.lesson_id.toString()
                }))
              }
              onChange={val => changeHandler(val, 'lessonId')}
              singleSelect
            />
            <button
              onClick={() =>
                fetchAllCourseOfLesson(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Lesson List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}
      {learnDashConf.mainAction === '8' && (
        <>
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Course:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={learnDashConf?.courseId}
              options={
                learnDashConf?.default?.allCourse &&
                learnDashConf.default.allCourse.map(item => ({
                  label: item.course_title,
                  value: item.course_id.toString()
                }))
              }
              onChange={val => changeHandler(val, 'courseId')}
              singleSelect
            />
            <button
              onClick={() => fetchAllCourse(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Course List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Lesson:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={learnDashConf?.lessonId}
              options={
                learnDashConf?.default?.courseByLesson &&
                learnDashConf.default.courseByLesson.map(item => ({
                  label: item.lesson_title,
                  value: item.lesson_id.toString()
                }))
              }
              onChange={val => changeHandler(val, 'lessonId')}
              singleSelect
            />
            <button
              onClick={() =>
                fetchAllCourseOfLesson(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Lesson List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Topic:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={learnDashConf?.topicId}
              options={
                learnDashConf?.default?.allTopics &&
                learnDashConf.default.allTopics.map(item => ({
                  label: item.topic_title,
                  value: item.topic_id.toString()
                }))
              }
              onChange={val => changeHandler(val, 'topicId')}
              singleSelect
            />
            <button
              onClick={() =>
                fetchAllTopicOfLesson(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Lesson List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {learnDashConf.mainAction === '9' && (
        <>
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Course:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={learnDashConf?.courseId}
              options={
                learnDashConf?.default?.allCourse &&
                learnDashConf.default.allCourse.map(item => ({
                  label: item.course_title,
                  value: item.course_id.toString()
                }))
              }
              onChange={val => changeHandler(val, 'courseId')}
              singleSelect
            />
            <button
              onClick={() => fetchAllCourse(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Course List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Lesson:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={learnDashConf?.lessonId}
              options={
                learnDashConf?.default?.courseByLesson &&
                learnDashConf.default.courseByLesson.map(item => ({
                  label: item.lesson_title,
                  value: item.lesson_id.toString()
                }))
              }
              onChange={val => changeHandler(val, 'lessonId')}
              singleSelect
            />
            <button
              onClick={() =>
                fetchAllCourseOfLesson(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Lesson List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Topic:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={learnDashConf?.topicId}
              options={
                learnDashConf?.default?.allTopics &&
                learnDashConf.default.allTopics.map(item => ({
                  label: item.topic_title,
                  value: item.topic_id.toString()
                }))
              }
              onChange={val => changeHandler(val, 'topicId')}
              singleSelect
            />
            <button
              onClick={() =>
                fetchAllTopicOfLesson(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Lesson List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {learnDashConf.mainAction === '10' && (
        <>
          <b className="wdt-200 d-in-b">{__('All Groups :', 'bit-integrations')}</b>
          <select
            onChange={handleInput}
            name="groupId10"
            value={learnDashConf.groupId10}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select group', 'bit-integrations')}</option>
            {learnDashConf?.default?.allGroup &&
              learnDashConf.default.allGroup.map(item => (
                <option key={item.group_id} value={item.group_id}>
                  {item.group_title}
                </option>
              ))}
          </select>
          <button
            onClick={() => fetchAllGroup(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch Group List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
          <br />
        </>
      )}

      {learnDashConf.mainAction === '11' && (
        <>
          <b className="wdt-200 d-in-b">{__('All Groups :', 'bit-integrations')}</b>
          <select
            onChange={handleInput}
            name="groupId11"
            value={learnDashConf.groupId11}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select group', 'bit-integrations')}</option>
            {learnDashConf?.default?.allGroup &&
              learnDashConf.default.allGroup.map(item => (
                <option key={item.group_id} value={item.group_id}>
                  {item.group_title}
                </option>
              ))}
          </select>
          <button
            onClick={() => fetchAllGroup(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch Group List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
          <br />
        </>
      )}

      {learnDashConf.mainAction === '12' && (
        <>
          <b className="wdt-200 d-in-b">{__('All Groups :', 'bit-integrations')}</b>
          <select
            onChange={handleInput}
            name="groupId12"
            value={learnDashConf.groupId12}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select group', 'bit-integrations')}</option>
            {learnDashConf?.default?.allGroup &&
              learnDashConf.default.allGroup.map(item => (
                <option key={item.group_id} value={item.group_id}>
                  {item.group_title}
                </option>
              ))}
          </select>
          <button
            onClick={() => fetchAllGroup(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch Group List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
          <br />
        </>
      )}

      {learnDashConf.mainAction === '13' && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select Quiz:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            defaultValue={learnDashConf?.quizId}
            options={
              learnDashConf?.default?.allQuiz &&
              learnDashConf.default.allQuiz.map(item => ({
                label: item.quiz_title,
                value: item.quiz_id.toString()
              }))
            }
            onChange={val => changeHandler(val, 'quizId')}
            singleSelect
          />
          <button
            onClick={() => fetchAllQuiz(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch Lesson List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}
      {learnDashConf.mainAction === '14' && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select Course:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            defaultValue={learnDashConf?.courseId}
            options={
              learnDashConf?.default?.allCourse &&
              learnDashConf.default.allCourse.map(item => ({
                label: item.course_title,
                value: item.course_id.toString()
              }))
            }
            onChange={val => changeHandler(val, 'courseId')}
            singleSelect
          />
          <button
            onClick={() => fetchAllCourse(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch Course List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}


      {learnDashConf.mainAction === '16' && (
        <Mail
          allIntegURL={allIntegURL}
          isInfo={isInfo}
          edit={edit}
          isLearnDash
          learnDashConf={learnDashConf}
        />
      )}

      {learnDashConf.mainAction === '17' && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select Course:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            defaultValue={learnDashConf?.courseId}
            options={
              learnDashConf?.default?.allCourseUnenroll &&
              learnDashConf.default.allCourseUnenroll.map(item => ({
                label: item.course_title,
                value: item.course_id.toString()
              }))
            }
            onChange={val => changeHandler(val, 'courseId')}
            singleSelect
          />
          <button
            onClick={() =>
              fetchAllCourseUnenroll(learnDashConf, setLearnDashConf, setIsLoading, setSnackbar)
            }
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch course List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
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

      {learnDashConf.mainAction === '1' && (
        <>
          <div className="mt-4">
            <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('LearnDesh Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {learnDashConf.field_map.map((itm, i) => (
            <LearnDashFieldMap
              key={`dash-m-${i + 9}`}
              i={i}
              field={itm}
              learnDashConf={learnDashConf}
              formFields={formFields}
              setLearnDashConf={setLearnDashConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(learnDashConf.field_map.length, learnDashConf, setLearnDashConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>

          <br />
          <br />
        </>
      )}
      <br />
      <Note note={__('Some integrations will only work for logged-in users.', 'bit-integrations')} />
    </>
  )
}
