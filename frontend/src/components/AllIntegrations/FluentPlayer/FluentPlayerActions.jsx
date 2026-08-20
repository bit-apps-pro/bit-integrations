import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { endedOptions, postStatusOptions, viewTypeOptions } from './staticData'

export default function FluentPlayerActions({ fluentPlayerConf, setFluentPlayerConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const action = fluentPlayerConf?.mainAction

  const actionHandler = type => {
    setFluentPlayerConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
      })
    )

    setActionMdl({ show: type })
  }

  const clsActionMdl = () => setActionMdl({ show: false })

  const setAction = (val, name) => {
    setFluentPlayerConf(prevConf =>
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
      <div className="flx flx-between mt-2">
        <MultiSelect
          title={valueName}
          options={options}
          className="msl-wrp-options"
          singleSelect
          closeOnSelect
          defaultValue={fluentPlayerConf?.utilities?.[valueName] || undefined}
          onChange={val => setAction(val, valueName)}
        />
      </div>
    </ConfirmModal>
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
      {['create_media', 'update_media'].includes(action) && (
        <>
          <TableCheckBox
            checked={fluentPlayerConf?.utilities?.selected_post_status || false}
            onChange={() => actionHandler('post_status')}
            className="wdt-200 mt-4 mr-2"
            value="post_status"
            title={__('Status', 'bit-integrations')}
            subTitle={__('Set the media status', 'bit-integrations')}
          />
          {renderActionModal(
            'post_status',
            __('Status', 'bit-integrations'),
            postStatusOptions,
            'selected_post_status'
          )}

          <TableCheckBox
            checked={fluentPlayerConf?.utilities?.selected_view_type || false}
            onChange={() => actionHandler('view_type')}
            className="wdt-200 mt-4 mr-2"
            value="view_type"
            title={__('View Type', 'bit-integrations')}
            subTitle={__('Set the player view type', 'bit-integrations')}
          />
          {renderActionModal(
            'view_type',
            __('View Type', 'bit-integrations'),
            viewTypeOptions,
            'selected_view_type'
          )}
        </>
      )}

      {action === 'record_watch_progression' && (
        <>
          <TableCheckBox
            checked={fluentPlayerConf?.utilities?.selected_ended || false}
            onChange={() => actionHandler('ended')}
            className="wdt-200 mt-4 mr-2"
            value="ended"
            title={__('Ended', 'bit-integrations')}
            subTitle={__('Mark the video as played to the end', 'bit-integrations')}
          />
          {renderActionModal('ended', __('Ended', 'bit-integrations'), endedOptions, 'selected_ended')}
        </>
      )}
    </div>
  )
}
