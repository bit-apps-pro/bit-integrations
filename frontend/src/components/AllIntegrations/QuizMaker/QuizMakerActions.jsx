import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { publishStatusOptions, questionTypeOptions } from './staticData'

export default function QuizMakerActions({ quizMakerConf, setQuizMakerConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const actionHandler = type => setActionMdl({ show: type })

  const clsActionMdl = () => setActionMdl({ show: false })

  const setAction = (val, name) => {
    setQuizMakerConf(prevConf =>
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
      <div className="flx flx-between mt-2">
        <MultiSelect
          options={options}
          className="msl-wrp-options"
          singleSelect
          defaultValue={quizMakerConf?.utilities?.[valueName] || undefined}
          onChange={val => setAction(val, valueName)}
        />
      </div>
    </ConfirmModal>
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
      <TableCheckBox
        checked={quizMakerConf?.utilities?.selected_published || false}
        onChange={() => actionHandler('published')}
        className="wdt-200 mt-4 mr-2"
        value="published"
        title={__('Publish Status', 'bit-integrations')}
        subTitle={__('Set the publish status', 'bit-integrations')}
      />
      {renderActionModal(
        'published',
        __('Publish Status', 'bit-integrations'),
        publishStatusOptions,
        'selected_published'
      )}

      {quizMakerConf?.mainAction === 'update_question' && (
        <>
          <TableCheckBox
            checked={quizMakerConf?.utilities?.selected_question_type || false}
            onChange={() => actionHandler('question_type')}
            className="wdt-200 mt-4 mr-2"
            value="question_type"
            title={__('Question Type', 'bit-integrations')}
            subTitle={__('Set the question type', 'bit-integrations')}
          />
          {renderActionModal(
            'question_type',
            __('Question Type', 'bit-integrations'),
            questionTypeOptions,
            'selected_question_type'
          )}
        </>
      )}
    </div>
  )
}
