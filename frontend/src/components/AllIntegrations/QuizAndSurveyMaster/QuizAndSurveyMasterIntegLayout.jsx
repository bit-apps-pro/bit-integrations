import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import QuizAndSurveyMasterActions from './QuizAndSurveyMasterActions'
import {
  generateMappedField,
  refreshQuizAndSurveyMasterQuestionTypes,
  refreshQuizAndSurveyMasterSettingKeys
} from './QuizAndSurveyMasterCommonFunc'
import QuizAndSurveyMasterFieldMap from './QuizAndSurveyMasterFieldMap'
import {
  CreateQuestionFields,
  hasUtilities,
  modules,
  needsQuestionType,
  needsSettingSection,
  QuestionIdField,
  QuizIdField,
  QuizIdNameFields,
  QuizNameField,
  QuizSettingsFields,
  ResultIdField,
  settingSections,
  UpdateQuestionFields
} from './staticData'

export default function QuizAndSurveyMasterIntegLayout({
  formFields,
  quizAndSurveyMasterConf,
  setQuizAndSurveyMasterConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setField = (key, value) => {
    setQuizAndSurveyMasterConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const handleMainAction = value => {
    setQuizAndSurveyMasterConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        switch (value) {
          case 'create_quiz':
            draftConf.quizAndSurveyMasterFields = QuizNameField
            break
          case 'update_quiz_name':
          case 'duplicate_quiz':
            draftConf.quizAndSurveyMasterFields = QuizIdNameFields
            break
          case 'delete_quiz':
            draftConf.quizAndSurveyMasterFields = QuizIdField
            break
          case 'update_quiz_settings':
            draftConf.quizAndSurveyMasterFields = QuizSettingsFields
            break
          case 'create_question':
            draftConf.quizAndSurveyMasterFields = CreateQuestionFields
            break
          case 'update_question':
            draftConf.quizAndSurveyMasterFields = UpdateQuestionFields
            break
          case 'delete_question':
            draftConf.quizAndSurveyMasterFields = QuestionIdField
            break
          case 'delete_result':
            draftConf.quizAndSurveyMasterFields = ResultIdField
            break
          default:
            draftConf.quizAndSurveyMasterFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.quizAndSurveyMasterFields)
      })
    )

    if (needsQuestionType.includes(value)) {
      refreshQuizAndSurveyMasterQuestionTypes(setQuizAndSurveyMasterConf, setIsLoading)
    }
  }

  const handleSection = value => {
    setField('selectedSection', value)
    refreshQuizAndSurveyMasterSettingKeys(value, setQuizAndSurveyMasterConf, setIsLoading)
  }

  const questionTypeOptions = Array.isArray(quizAndSurveyMasterConf?.allQuestionTypes)
    ? quizAndSurveyMasterConf.allQuestionTypes.map(type => ({
        label: type.label,
        value: type.value?.toString()
      }))
    : []

  const settingKeyOptions = Array.isArray(quizAndSurveyMasterConf?.allSettingKeys)
    ? quizAndSurveyMasterConf.allSettingKeys.map(key => ({
        label: key.label,
        value: key.value?.toString()
      }))
    : []

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={quizAndSurveyMasterConf?.mainAction ?? null}
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

      {needsSettingSection.includes(quizAndSurveyMasterConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Settings Section:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedSection"
              defaultValue={quizAndSurveyMasterConf?.selectedSection ?? null}
              className="btcd-paper-drpdwn w-5"
              options={settingSections}
              onChange={val => handleSection(val)}
              singleSelect
              closeOnSelect
            />
          </div>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Setting Key:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedSettingKey"
              defaultValue={quizAndSurveyMasterConf?.selectedSettingKey ?? null}
              className="btcd-paper-drpdwn w-5"
              options={settingKeyOptions}
              onChange={val => setField('selectedSettingKey', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() =>
                refreshQuizAndSurveyMasterSettingKeys(
                  quizAndSurveyMasterConf?.selectedSection,
                  setQuizAndSurveyMasterConf,
                  setIsLoading
                )
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Setting Keys', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading || !quizAndSurveyMasterConf?.selectedSection}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsQuestionType.includes(quizAndSurveyMasterConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Question Type:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedQuestionType"
              defaultValue={quizAndSurveyMasterConf?.selectedQuestionType ?? null}
              className="btcd-paper-drpdwn w-5"
              options={questionTypeOptions}
              onChange={val => setField('selectedQuestionType', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() =>
                refreshQuizAndSurveyMasterQuestionTypes(setQuizAndSurveyMasterConf, setIsLoading)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Question Types', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

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

      {quizAndSurveyMasterConf?.mainAction && quizAndSurveyMasterConf.quizAndSurveyMasterFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Quiz And Survey Master Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {quizAndSurveyMasterConf?.field_map?.map((itm, i) => (
            <QuizAndSurveyMasterFieldMap
              key={`qsm-m-${i + 9}`}
              i={i}
              field={itm}
              quizAndSurveyMasterConf={quizAndSurveyMasterConf}
              formFields={formFields}
              setQuizAndSurveyMasterConf={setQuizAndSurveyMasterConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  quizAndSurveyMasterConf.field_map.length,
                  quizAndSurveyMasterConf,
                  setQuizAndSurveyMasterConf
                )
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {quizAndSurveyMasterConf?.mainAction &&
        hasUtilities.includes(quizAndSurveyMasterConf?.mainAction) && (
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
            <div className="btcd-hr mt-1" />
            <QuizAndSurveyMasterActions
              quizAndSurveyMasterConf={quizAndSurveyMasterConf}
              setQuizAndSurveyMasterConf={setQuizAndSurveyMasterConf}
              formFields={formFields}
              setSnackbar={setSnackbar}
            />
          </div>
        )}
    </>
  )
}
