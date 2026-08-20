import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { reviewStatusOptions } from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function BrilliantDirectoriesActions({
  brilliantDirectoriesConf,
  setBrilliantDirectoriesConf
}) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const actionHandler = (e, type, valueName) => {
    if (brilliantDirectoriesConf?.utilities?.[valueName]) {
      setBrilliantDirectoriesConf(prevConf =>
        create(prevConf, draftConf => {
          if (draftConf.utilities) delete draftConf.utilities[valueName]
        })
      )

      return
    }

    setActionMdl({ show: type })
  }

  const setAction = (val, name) => {
    setBrilliantDirectoriesConf(prevConf =>
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
      <div className="mt-2">{__('Select Review Status', 'bit-integrations')}</div>
      <div className="flx flx-between mt-2">
        <MultiSelect
          options={options}
          className="msl-wrp-options"
          singleSelect
          closeOnSelect
          defaultValue={brilliantDirectoriesConf?.utilities?.[valueName] || undefined}
          onChange={val => setAction(val, valueName)}
        />
      </div>
    </ConfirmModal>
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
      <TableCheckBox
        checked={brilliantDirectoriesConf?.utilities?.selected_review_status || false}
        onChange={e => actionHandler(e, 'review_status', 'selected_review_status')}
        className="wdt-200 mt-4 mr-2"
        value="review_status"
        title={__('Review Status', 'bit-integrations')}
        subTitle={__('Set the review approval state', 'bit-integrations')}
      />
      {renderActionModal(
        'review_status',
        __('Review Status', 'bit-integrations'),
        reviewStatusOptions,
        'selected_review_status'
      )}
    </div>
  )
}
