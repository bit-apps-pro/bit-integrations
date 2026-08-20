import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState } from 'recoil'
import { $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { getLessonByCourse, getTopicByLesson } from './LearndashHelper/LearnDashCommonFunction'

const LearnDashHelper = ({ flow, setFlowData, edit = false }) => {
  const id = !edit ? flow?.triggerData?.formID : flow.triggered_entity_id

  const [newFlow, setNewFlow] = useRecoilState($newFlow)
  const setFlowDataDepend = (val, type, isLoad = true) => {
    const tmpFlow = { ...flow }
    if (!edit) {
      tmpFlow.triggerData[type] = val
    } else {
      tmpFlow.flow_details[type] = val
    }
    if (type === 'selectedCourse') {
      getLessonByCourse(val, tmpFlow, setNewFlow, edit)
    } else if (type === 'selectedLesson') {
      const courseId = !edit
        ? tmpFlow?.triggerData?.selectedCourse
        : tmpFlow?.flow_details?.selectedCourse
      if (isLoad) {
        getTopicByLesson(val, courseId, tmpFlow, setNewFlow, edit)
      }
    } else {
      setNewFlow({ ...tmpFlow })
    }
  }
  // const courses = !edit ? newFlow?.triggerData?.courses: flow.flow_details.courses
  const triggerData = !edit ? newFlow?.triggerData : flow.flow_details
  return (
    <>
      {id === '1' && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Select a Course', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData.selectedCourse}
            options={triggerData?.courses?.map(list => ({
              label: list.course_title,
              value: list.course_id.toString()
            }))}
            onChange={val => setFlowData(val, 'selectedCourse')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
      {id === '2' && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Select a Course', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.unenrollCourse}
            options={triggerData?.courses?.map(list => ({
              label: list.course_title,
              value: list.course_id.toString()
            }))}
            onChange={val => setFlowData(val, 'unenrollCourse')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
      {id === '3' && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Select a Course', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.completeCourse}
            options={triggerData?.courses?.map(list => ({
              label: list.course_title,
              value: list.course_id.toString()
            }))}
            onChange={val => setFlowData(val, 'completeCourse')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
      {(id === '4' || id === '11') && (
        <>
          <div className={edit ? 'flx mt-3' : ''}>
            <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
              {__('Select a Course', 'bit-integrations')}
            </b>
            <MultiSelect
              className="msl-wrp-options"
              defaultValue={triggerData?.selectedCourse}
              options={triggerData?.courses?.map(list => ({
                label: list.course_title,
                value: list.course_id.toString()
              }))}
              onChange={val => setFlowDataDepend(val, 'selectedCourse')}
              singleSelect
              style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
            />
          </div>
          <div className={edit ? 'flx mt-3' : ''}>
            <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
              {__('Select a Lesson', 'bit-integrations')}
            </b>
            <MultiSelect
              className="msl-wrp-options"
              defaultValue={triggerData?.selectedLesson}
              options={triggerData?.lessons?.map(list => ({
                label: list.lesson_title,
                value: list.lesson_id.toString()
              }))}
              onChange={val => setFlowDataDepend(val, 'selectedLesson', false)}
              singleSelect
              style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
            />
          </div>
        </>
      )}

      {id === '5' && (
        <>
          <div className={edit ? 'flx mt-3' : ''}>
            <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
              {__('Select a Course', 'bit-integrations')}
            </b>
            <MultiSelect
              className="msl-wrp-options"
              defaultValue={triggerData?.selectedCourse}
              options={triggerData?.courses?.map(list => ({
                label: list.course_title,
                value: list.course_id.toString()
              }))}
              onChange={val => setFlowDataDepend(val, 'selectedCourse')}
              singleSelect
              style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
            />
          </div>
          <div className={edit ? 'flx mt-3' : ''}>
            <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
              {__('Select a Lesson', 'bit-integrations')}
            </b>
            <MultiSelect
              className="msl-wrp-options"
              defaultValue={triggerData?.selectedLesson}
              options={triggerData?.lessons?.map(list => ({
                label: list.lesson_title,
                value: list.lesson_id.toString()
              }))}
              onChange={val => setFlowDataDepend(val, 'selectedLesson')}
              singleSelect
              style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
            />
          </div>
          <div className={edit ? 'flx mt-3' : ''}>
            <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
              {__('Select a Topic', 'bit-integrations')}
            </b>
            <MultiSelect
              className="msl-wrp-options"
              defaultValue={triggerData?.selectedTopic}
              options={triggerData?.topics?.map(list => ({
                label: list.topic_title,
                value: list.topic_id.toString()
              }))}
              onChange={val => setFlowData(val, 'selectedTopic')}
              singleSelect
              style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
            />
          </div>
        </>
      )}
      {(id === '6' || id === '7' || id === '8') && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Select a Quiz', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.selectedQuiz}
            options={triggerData?.quizes?.map(list => ({
              label: list.quiz_title,
              value: list.quiz_id.toString()
            }))}
            onChange={val => setFlowData(val, 'selectedQuiz')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
      {(id === '9' || id === '10') && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Select a Group', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.selectedGroup}
            options={triggerData?.groups?.map(list => ({
              label: list.group_title,
              value: list.group_id.toString()
            }))}
            onChange={val => setFlowData(val, 'selectedGroup')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
    </>
  )
}

export default LearnDashHelper
