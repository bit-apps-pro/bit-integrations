import { create } from 'mutative'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'
import { newAnswerRow } from './QuizMakerCommonFunc'
import { answerCorrectnessOptions } from './staticData'

export default function QuizMakerAnswerMap({ formFields, quizMakerConf, setQuizMakerConf }) {
  const { isPro } = useRecoilValue($appConfigState)
  const answers = quizMakerConf?.answer_map || []
  const isUpdate = quizMakerConf?.mainAction === 'update_question'

  const updateAnswers = recipe =>
    setQuizMakerConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.answer_map = draftConf.answer_map || []
        recipe(draftConf.answer_map)
      })
    )

  const addAnswer = index => updateAnswers(rows => rows.splice(index, 0, newAnswerRow()))

  const removeAnswer = index => updateAnswers(rows => rows.splice(index, 1))

  const setAnswerValue = (id, key, value) =>
    updateAnswers(rows => {
      const row = rows.find(item => item.id === id)

      if (!row) {
        return
      }

      row[key] = value

      if (key === 'formField') {
        row.customValue = ''
      }
    })

  return (
    <div className="mt-4">
      <b className="wdt-100">{__('Answers', 'bit-integrations')}</b>
      <div className="btcd-hr mt-1" />
      <small className="d-blk mt-2">
        {isUpdate
          ? __(
              "Answers added here replace the question's current answers. Leave empty to keep them.",
              'bit-integrations'
            )
          : __(
              'Add each answer option and mark the correct ones. Empty answers are skipped.',
              'bit-integrations'
            )}
      </small>

      {answers.length > 0 && (
        <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
          <div className="txt-dp">
            <b>{__('Answer', 'bit-integrations')}</b>
          </div>
          <div className="txt-dp">
            <b>{__('Correct?', 'bit-integrations')}</b>
          </div>
        </div>
      )}

      {answers.map((answer, i) => (
        <div key={answer.id} className="flx mt-2 mb-2 btcbi-field-map">
          <div className="pos-rel flx">
            <div className="flx integ-fld-wrp">
              <select
                className="btcd-paper-inp mr-2"
                aria-label={sprintf(__('Answer %s value', 'bit-integrations'), i + 1)}
                value={answer.formField || ''}
                onChange={ev => setAnswerValue(answer.id, 'formField', ev.target.value)}>
                <option value="">{__('Select Field', 'bit-integrations')}</option>
                <optgroup label={__('Form Fields', 'bit-integrations')}>
                  {formFields?.map(f => (
                    <option key={`qm-answer-ff-${f.name}`} value={f.name}>
                      {f.label}
                    </option>
                  ))}
                </optgroup>
                <option value="custom">{__('Custom...', 'bit-integrations')}</option>
                <optgroup
                  label={sprintf(
                    __('General Smart Codes %s', 'bit-integrations'),
                    isPro ? '' : `(${__('Pro', 'bit-integrations')})`
                  )}>
                  {isPro &&
                    SmartTagField?.map(f => (
                      <option key={`qm-answer-st-${f.name}`} value={f.name}>
                        {f.label}
                      </option>
                    ))}
                </optgroup>
              </select>

              {answer.formField === 'custom' && (
                <TagifyInput
                  onChange={val => setAnswerValue(answer.id, 'customValue', val?.target?.value ?? val)}
                  label={__('Answer text', 'bit-integrations')}
                  className="mr-2"
                  type="text"
                  value={answer.customValue}
                  placeholder={__('Answer text', 'bit-integrations')}
                  formFields={formFields}
                />
              )}

              <select
                className="btcd-paper-inp"
                aria-label={sprintf(__('Answer %s correctness', 'bit-integrations'), i + 1)}
                value={answer.correct ?? '0'}
                onChange={ev => setAnswerValue(answer.id, 'correct', ev.target.value)}>
                {answerCorrectnessOptions.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => addAnswer(i + 1)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button"
              aria-label={__('Add answer below', 'bit-integrations')}>
              +
            </button>
            <button
              onClick={() => removeAnswer(i)}
              className="icn-btn sh-sm ml-1"
              type="button"
              aria-label={__('Remove answer', 'bit-integrations')}>
              <span className="btcd-icn icn-trash-2" />
            </button>
          </div>
        </div>
      ))}

      {answers.length === 0 && (
        <div className="txt-center btcbi-field-map-button mt-2">
          <button
            onClick={() => addAnswer(0)}
            className="icn-btn sh-sm tooltip"
            style={{ '--tooltip-txt': `'${__('Add Answer', 'bit-integrations')}'` }}
            type="button"
            aria-label={__('Add Answer', 'bit-integrations')}>
            +
          </button>
        </div>
      )}
    </div>
  )
}
