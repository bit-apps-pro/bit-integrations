import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import QuizMakerActions from './QuizMakerActions'
import {
  generateMappedField,
  refreshQuizMakerQuestionCategories,
  refreshQuizMakerQuestions,
  refreshQuizMakerQuizCategories,
  refreshQuizMakerUsers
} from './QuizMakerCommonFunc'
import QuizMakerFieldMap from './QuizMakerFieldMap'
import {
  CategoryFields,
  hasUtilities,
  modules,
  needsQuestionCategory,
  needsQuestionList,
  needsQuestionStatus,
  needsQuestionType,
  needsQuizCategory,
  needsQuizStatus,
  needsReviewScore,
  needsUser,
  publishStatusOptions,
  QuestionCategoryIdField,
  QuestionCategoryUpdateFields,
  QuestionFields,
  QuestionIdField,
  QuestionReportFields,
  QuestionReportIdField,
  questionTypeOptions,
  QuestionUpdateFields,
  QuizCategoryIdField,
  QuizCategoryUpdateFields,
  QuizFields,
  QuizIdField,
  QuizUpdateFields,
  ResultFields,
  ResultIdField,
  ReviewFields,
  ReviewIdField,
  reviewScoreOptions
} from './staticData'

const fieldSets = {
  create_quiz: QuizFields,
  update_quiz: QuizUpdateFields,
  change_quiz_status: QuizIdField,
  delete_quiz: QuizIdField,
  create_question: QuestionFields,
  update_question: QuestionUpdateFields,
  change_question_status: QuestionIdField,
  delete_question: QuestionIdField,
  create_quiz_category: CategoryFields,
  update_quiz_category: QuizCategoryUpdateFields,
  delete_quiz_category: QuizCategoryIdField,
  create_question_category: CategoryFields,
  update_question_category: QuestionCategoryUpdateFields,
  delete_question_category: QuestionCategoryIdField,
  create_result: ResultFields,
  mark_result_as_read: ResultIdField,
  delete_result: ResultIdField,
  create_review: ReviewFields,
  delete_review: ReviewIdField,
  create_question_report: QuestionReportFields,
  resolve_question_report: QuestionReportIdField,
  delete_question_report: QuestionReportIdField
}

export default function QuizMakerIntegLayout({
  formID,
  formFields,
  quizMakerConf,
  setQuizMakerConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setField = (key, value) =>
    setQuizMakerConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )

  const handleMainAction = value => {
    setQuizMakerConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.quizMakerFields = fieldSets[value] || []
        draftConf.field_map = generateMappedField(draftConf.quizMakerFields)
      })
    )

    if (needsQuizCategory.includes(value)) {
      refreshQuizMakerQuizCategories(setQuizMakerConf, setIsLoading)
    }
    if (needsQuestionList.includes(value)) {
      refreshQuizMakerQuestions(setQuizMakerConf, setIsLoading)
    }
    if (needsQuestionCategory.includes(value)) {
      refreshQuizMakerQuestionCategories(setQuizMakerConf, setIsLoading)
    }
    if (needsUser.includes(value)) {
      refreshQuizMakerUsers(setQuizMakerConf, setIsLoading)
    }
  }

  const mainAction = quizMakerConf?.mainAction

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={mainAction ?? null}
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

      {needsQuizCategory.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Quiz Category:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedQuizCategory"
              defaultValue={quizMakerConf?.selectedQuizCategory ?? null}
              className="btcd-paper-drpdwn w-5"
              options={quizMakerConf?.allQuizCategories ?? []}
              onChange={val => setField('selectedQuizCategory', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshQuizMakerQuizCategories(setQuizMakerConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Quiz Categories', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsQuestionList.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Questions:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedQuestions"
              defaultValue={quizMakerConf?.selectedQuestions ?? null}
              className="btcd-paper-drpdwn w-5"
              options={quizMakerConf?.allQuestions ?? []}
              onChange={val => setField('selectedQuestions', val)}
            />
            <button
              onClick={() => refreshQuizMakerQuestions(setQuizMakerConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Questions', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsQuestionCategory.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Question Category:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedQuestionCategory"
              defaultValue={quizMakerConf?.selectedQuestionCategory ?? null}
              className="btcd-paper-drpdwn w-5"
              options={quizMakerConf?.allQuestionCategories ?? []}
              onChange={val => setField('selectedQuestionCategory', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshQuizMakerQuestionCategories(setQuizMakerConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{
                '--tooltip-txt': `'${__('Refresh Question Categories', 'bit-integrations')}'`
              }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsUser.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('User:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedUser"
              defaultValue={quizMakerConf?.selectedUser ?? null}
              className="btcd-paper-drpdwn w-5"
              options={quizMakerConf?.allUsers ?? []}
              onChange={val => setField('selectedUser', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshQuizMakerUsers(setQuizMakerConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Users', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsQuestionType.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Question Type:', 'bit-integrations')}</b>
            <MultiSelect
              title="questionType"
              defaultValue={quizMakerConf?.questionType ?? null}
              className="btcd-paper-drpdwn w-5"
              options={questionTypeOptions}
              onChange={val => setField('questionType', val)}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {needsQuizStatus.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Status:', 'bit-integrations')}</b>
            <MultiSelect
              title="quizStatus"
              defaultValue={quizMakerConf?.quizStatus ?? null}
              className="btcd-paper-drpdwn w-5"
              options={publishStatusOptions}
              onChange={val => setField('quizStatus', val)}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {needsQuestionStatus.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Status:', 'bit-integrations')}</b>
            <MultiSelect
              title="questionStatus"
              defaultValue={quizMakerConf?.questionStatus ?? null}
              className="btcd-paper-drpdwn w-5"
              options={publishStatusOptions}
              onChange={val => setField('questionStatus', val)}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {needsReviewScore.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Rating:', 'bit-integrations')}</b>
            <MultiSelect
              title="reviewScore"
              defaultValue={quizMakerConf?.reviewScore ?? null}
              className="btcd-paper-drpdwn w-5"
              options={reviewScoreOptions}
              onChange={val => setField('reviewScore', val)}
              singleSelect
              closeOnSelect
            />
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

      {mainAction && quizMakerConf.quizMakerFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Quiz Maker Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {quizMakerConf?.field_map?.map((itm, i) => (
            <QuizMakerFieldMap
              key={`quiz-maker-m-${i + 9}`}
              i={i}
              field={itm}
              quizMakerConf={quizMakerConf}
              formFields={formFields}
              setQuizMakerConf={setQuizMakerConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(quizMakerConf.field_map.length, quizMakerConf, setQuizMakerConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {mainAction && quizMakerConf.quizMakerFields && hasUtilities.includes(mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <QuizMakerActions
            quizMakerConf={quizMakerConf}
            setQuizMakerConf={setQuizMakerConf}
            formFields={formFields}
            setSnackbar={setSnackbar}
          />
        </div>
      )}
    </>
  )
}
