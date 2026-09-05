import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { refreshQuizAndSurveyMasterThemes } from './QuizAndSurveyMasterCommonFunc'
import { yesNoOptions } from './staticData'

export default function QuizAndSurveyMasterActions({
  quizAndSurveyMasterConf,
  setQuizAndSurveyMasterConf
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false })

  const actionHandler = (e, type) => {
    setActionMdl({ show: type })

    if (type === 'theme') {
      refreshQuizAndSurveyMasterThemes(setQuizAndSurveyMasterConf, setIsLoading)
    }
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setAction = (val, name) => {
    setQuizAndSurveyMasterConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )
  }

  const renderActionModal = (type, title, options, valueName) => (
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
            onChange={val => setAction(val, valueName)}
          />
        </div>
      )}
    </ConfirmModal>
  )

  const themeOptions = Array.isArray(quizAndSurveyMasterConf?.allThemes)
    ? quizAndSurveyMasterConf.allThemes.map(theme => ({
        label: theme.label,
        value: theme.value?.toString()
      }))
    : []

  return (
    <div className="pos-rel d-flx flx-wrp">
      {quizAndSurveyMasterConf?.mainAction === 'create_quiz' && (
        <>
          <TableCheckBox
            checked={quizAndSurveyMasterConf?.utilities?.selected_theme || false}
            onChange={e => actionHandler(e, 'theme')}
            className="wdt-200 mt-4 mr-2"
            value="theme"
            title={__('Theme', 'bit-integrations')}
            subTitle={__('Activate a theme on the new quiz', 'bit-integrations')}
          />
          {renderActionModal(
            'theme',
            __('Theme', 'bit-integrations'),
            themeOptions,
            'selected_theme'
          )}
        </>
      )}

      {quizAndSurveyMasterConf?.mainAction === 'duplicate_quiz' && (
        <>
          <TableCheckBox
            checked={quizAndSurveyMasterConf?.utilities?.selected_duplicate_questions || false}
            onChange={e => actionHandler(e, 'duplicate_questions')}
            className="wdt-200 mt-4 mr-2"
            value="duplicate_questions"
            title={__('Duplicate Questions', 'bit-integrations')}
            subTitle={__('Copy the questions into the new quiz', 'bit-integrations')}
          />
          {renderActionModal(
            'duplicate_questions',
            __('Duplicate Questions', 'bit-integrations'),
            yesNoOptions,
            'selected_duplicate_questions'
          )}
        </>
      )}

      {quizAndSurveyMasterConf?.mainAction === 'delete_quiz' && (
        <>
          <TableCheckBox
            checked={quizAndSurveyMasterConf?.utilities?.selected_delete_permanently || false}
            onChange={e => actionHandler(e, 'delete_permanently')}
            className="wdt-200 mt-4 mr-2"
            value="delete_permanently"
            title={__('Delete Permanently', 'bit-integrations')}
            subTitle={__('Remove the quiz instead of trashing it', 'bit-integrations')}
          />
          {renderActionModal(
            'delete_permanently',
            __('Delete Permanently', 'bit-integrations'),
            yesNoOptions,
            'selected_delete_permanently'
          )}

          <TableCheckBox
            checked={quizAndSurveyMasterConf?.utilities?.selected_delete_questions || false}
            onChange={e => actionHandler(e, 'delete_questions')}
            className="wdt-200 mt-4 mr-2"
            value="delete_questions"
            title={__('Delete Questions', 'bit-integrations')}
            subTitle={__('Remove the quiz questions as well', 'bit-integrations')}
          />
          {renderActionModal(
            'delete_questions',
            __('Delete Questions', 'bit-integrations'),
            yesNoOptions,
            'selected_delete_questions'
          )}
        </>
      )}

      {['create_question', 'update_question'].includes(quizAndSurveyMasterConf?.mainAction) && (
        <>
          <TableCheckBox
            checked={quizAndSurveyMasterConf?.utilities?.selected_required || false}
            onChange={e => actionHandler(e, 'required')}
            className="wdt-200 mt-4 mr-2"
            value="required"
            title={__('Required', 'bit-integrations')}
            subTitle={__('Make answering the question mandatory', 'bit-integrations')}
          />
          {renderActionModal(
            'required',
            __('Required', 'bit-integrations'),
            yesNoOptions,
            'selected_required'
          )}
        </>
      )}

      {quizAndSurveyMasterConf?.mainAction === 'delete_result' && (
        <>
          <TableCheckBox
            checked={quizAndSurveyMasterConf?.utilities?.selected_delete_permanently || false}
            onChange={e => actionHandler(e, 'delete_permanently')}
            className="wdt-200 mt-4 mr-2"
            value="delete_permanently"
            title={__('Delete Permanently', 'bit-integrations')}
            subTitle={__('Remove the result instead of trashing it', 'bit-integrations')}
          />
          {renderActionModal(
            'delete_permanently',
            __('Delete Permanently', 'bit-integrations'),
            yesNoOptions,
            'selected_delete_permanently'
          )}
        </>
      )}
    </div>
  )
}
