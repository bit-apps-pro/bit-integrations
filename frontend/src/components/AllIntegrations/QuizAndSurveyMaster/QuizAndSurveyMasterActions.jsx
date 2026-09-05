import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { refreshQuizAndSurveyMasterThemes } from './QuizAndSurveyMasterCommonFunc'

export default function QuizAndSurveyMasterActions({
  quizAndSurveyMasterConf,
  setQuizAndSurveyMasterConf
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false })

  const setUtility = (name, value) => {
    setQuizAndSurveyMasterConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = value
      })
    )
  }

  const toggleUtility = (e, name) => setUtility(name, e.target.checked ? '1' : '0')

  const isChecked = name => quizAndSurveyMasterConf?.utilities?.[name] === '1'

  const openFetchable = (type, refresh) => {
    setActionMdl({ show: type })
    refresh(setQuizAndSurveyMasterConf, setIsLoading)
  }

  const clsActionMdl = () => setActionMdl({ show: false })

  const renderBoolean = (name, title, subTitle) => (
    <TableCheckBox
      checked={isChecked(name)}
      onChange={e => toggleUtility(e, name)}
      className="wdt-200 mt-4 mr-2"
      value={name}
      title={title}
      subTitle={subTitle}
    />
  )

  const renderFetchable = (type, title, subTitle, valueName, options, refresh) => (
    <>
      <TableCheckBox
        checked={!!quizAndSurveyMasterConf?.utilities?.[valueName]}
        onChange={() => openFetchable(type, refresh)}
        className="wdt-200 mt-4 mr-2"
        value={type}
        title={title}
        subTitle={subTitle}
      />
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === type}
        close={clsActionMdl}
        action={clsActionMdl}
        title={title}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{title}</div>
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <MultiSelect
              options={options}
              className="msl-wrp-options"
              singleSelect
              closeOnSelect
              defaultValue={quizAndSurveyMasterConf?.utilities?.[valueName] || undefined}
              onChange={val => setUtility(valueName, val)}
            />
            <button
              onClick={() => refresh(setQuizAndSurveyMasterConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>
    </>
  )

  const themeOptions = Array.isArray(quizAndSurveyMasterConf?.allThemes)
    ? quizAndSurveyMasterConf.allThemes.map(theme => ({
        label: theme.label,
        value: theme.value?.toString()
      }))
    : []

  const { mainAction } = quizAndSurveyMasterConf ?? {}

  return (
    <div className="pos-rel d-flx flx-wrp">
      {mainAction === 'create_quiz' &&
        renderFetchable(
          'theme',
          __('Theme', 'bit-integrations'),
          __('Activate a theme on the new quiz', 'bit-integrations'),
          'selected_theme',
          themeOptions,
          refreshQuizAndSurveyMasterThemes
        )}

      {mainAction === 'duplicate_quiz' &&
        renderBoolean(
          'selected_duplicate_questions',
          __('Duplicate Questions', 'bit-integrations'),
          __('Copy the questions into the new quiz', 'bit-integrations')
        )}

      {mainAction === 'delete_quiz' && (
        <>
          {renderBoolean(
            'selected_delete_permanently',
            __('Delete Permanently', 'bit-integrations'),
            __('Remove the quiz instead of trashing it', 'bit-integrations')
          )}
          {renderBoolean(
            'selected_delete_questions',
            __('Delete Questions', 'bit-integrations'),
            __('Remove the quiz questions as well', 'bit-integrations')
          )}
        </>
      )}

      {['create_question', 'update_question'].includes(mainAction) &&
        renderBoolean(
          'selected_required',
          __('Required', 'bit-integrations'),
          __('Make answering the question mandatory', 'bit-integrations')
        )}

      {mainAction === 'delete_result' &&
        renderBoolean(
          'selected_delete_permanently',
          __('Delete Permanently', 'bit-integrations'),
          __('Remove the result instead of trashing it', 'bit-integrations')
        )}
    </div>
  )
}
