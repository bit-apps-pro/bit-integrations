import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  courseActions,
  gradeTypeActions,
  gradeTypeOptions,
  lessonActions,
  lessonStatusActions,
  lessonStatusOptions,
  markCompleteActions,
  markCompleteOptions,
  modules,
  postStatusOptions,
  quizActions,
  senseiLMSStaticData,
  statusActions
} from './staticData'
import { generateMappedField, refreshCourses, refreshLessons, refreshQuizzes } from './SenseiLMSCommonFunc'
import SenseiLMSFieldMap from './SenseiLMSFieldMap'

export default function SenseiLMSIntegLayout({
  formFields,
  senseiLMSConf,
  setSenseiLMSConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setVal = (key, val) =>
    setSenseiLMSConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val
      })
    )

  const handleMainAction = value => {
    setSenseiLMSConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.senseiLMSFields = senseiLMSStaticData[value] || []
        draftConf.field_map = generateMappedField(draftConf.senseiLMSFields)
      })
    )

    if (courseActions.includes(value)) {
      refreshCourses(setSenseiLMSConf, setIsLoading)
    } else if (lessonActions.includes(value)) {
      refreshLessons(setSenseiLMSConf, setIsLoading)
    } else if (quizActions.includes(value)) {
      refreshQuizzes(setSenseiLMSConf, setIsLoading)
    }
  }

  const resourceDropdown = (label, confKey, listKey, refreshFn) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={confKey}
          defaultValue={senseiLMSConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={
            Array.isArray(senseiLMSConf?.[listKey])
              ? senseiLMSConf[listKey].map(item => ({
                  label: item.label,
                  value: item.value?.toString()
                }))
              : []
          }
          onChange={val => setVal(confKey, val)}
          singleSelect
          closeOnSelect
        />
        <button
          onClick={() => refreshFn(setSenseiLMSConf, setIsLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
          type="button"
          disabled={isLoading}>
          &#x21BB;
        </button>
      </div>
    </>
  )

  const staticDropdown = (label, confKey, options) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={confKey}
          defaultValue={senseiLMSConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setVal(confKey, val)}
          singleSelect
          closeOnSelect
        />
      </div>
    </>
  )

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={senseiLMSConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {courseActions.includes(senseiLMSConf?.mainAction) &&
        resourceDropdown(__('Course:', 'bit-integrations'), 'selectedCourse', 'allCourses', refreshCourses)}

      {lessonActions.includes(senseiLMSConf?.mainAction) &&
        resourceDropdown(__('Lesson:', 'bit-integrations'), 'selectedLesson', 'allLessons', refreshLessons)}

      {quizActions.includes(senseiLMSConf?.mainAction) &&
        resourceDropdown(__('Quiz:', 'bit-integrations'), 'selectedQuiz', 'allQuizzes', refreshQuizzes)}

      {statusActions.includes(senseiLMSConf?.mainAction) &&
        staticDropdown(__('Status:', 'bit-integrations'), 'selectedStatus', postStatusOptions)}

      {lessonStatusActions.includes(senseiLMSConf?.mainAction) &&
        staticDropdown(__('Status:', 'bit-integrations'), 'selectedLessonStatus', lessonStatusOptions)}

      {markCompleteActions.includes(senseiLMSConf?.mainAction) &&
        staticDropdown(__('Mark Complete:', 'bit-integrations'), 'selectedMarkComplete', markCompleteOptions)}

      {gradeTypeActions.includes(senseiLMSConf?.mainAction) &&
        staticDropdown(__('Grade Type:', 'bit-integrations'), 'selectedGradeType', gradeTypeOptions)}

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

      {senseiLMSConf?.mainAction && senseiLMSConf.senseiLMSFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Sensei LMS Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {senseiLMSConf?.field_map?.map((itm, i) => (
            <SenseiLMSFieldMap
              key={`sensei-m-${i + 9}`}
              i={i}
              field={itm}
              senseiLMSConf={senseiLMSConf}
              formFields={formFields}
              setSenseiLMSConf={setSenseiLMSConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(senseiLMSConf.field_map.length, senseiLMSConf, setSenseiLMSConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}
    </>
  )
}
