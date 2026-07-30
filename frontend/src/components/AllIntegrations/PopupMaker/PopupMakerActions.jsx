/* eslint-disable no-param-reassign */

import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import {
  animationOptions,
  consentOptions,
  forceDeleteOptions,
  sizeOptions,
  statusOptions
} from './staticData'

export default function PopupMakerActions({ popupMakerConf, setPopupMakerConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })

  const actionHandler = type => {
    setPopupMakerConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
      })
    )

    setActionMdl({ show: type })
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setAction = (val, name) => {
    setPopupMakerConf(prevConf =>
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
          options={options}
          className="msl-wrp-options"
          singleSelect
          closeOnSelect
          defaultValue={popupMakerConf?.utilities?.[valueName] || undefined}
          onChange={val => setAction(val, valueName)}
        />
      </div>
    </ConfirmModal>
  )

  const isPopupWrite = ['create_popup', 'update_popup'].includes(popupMakerConf?.mainAction)
  const isSubscriberWrite = ['create_subscriber', 'update_subscriber'].includes(
    popupMakerConf?.mainAction
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
      {isPopupWrite && (
        <>
          <TableCheckBox
            checked={popupMakerConf?.utilities?.selected_status || false}
            onChange={() => actionHandler('status')}
            className="wdt-200 mt-4 mr-2"
            value="status"
            title={__('Popup Status', 'bit-integrations')}
            subTitle={__('Set the popup status', 'bit-integrations')}
          />

          <TableCheckBox
            checked={popupMakerConf?.utilities?.selected_size || false}
            onChange={() => actionHandler('size')}
            className="wdt-200 mt-4 mr-2"
            value="size"
            title={__('Size', 'bit-integrations')}
            subTitle={__('Set the popup size', 'bit-integrations')}
          />

          <TableCheckBox
            checked={popupMakerConf?.utilities?.selected_animation_type || false}
            onChange={() => actionHandler('animation_type')}
            className="wdt-200 mt-4 mr-2"
            value="animation_type"
            title={__('Animation Type', 'bit-integrations')}
            subTitle={__('Set the popup animation', 'bit-integrations')}
          />

          {renderActionModal(
            'status',
            __('Popup Status', 'bit-integrations'),
            statusOptions,
            'selected_status'
          )}
          {renderActionModal('size', __('Size', 'bit-integrations'), sizeOptions, 'selected_size')}
          {renderActionModal(
            'animation_type',
            __('Animation Type', 'bit-integrations'),
            animationOptions,
            'selected_animation_type'
          )}
        </>
      )}

      {popupMakerConf?.mainAction === 'delete_popup' && (
        <>
          <TableCheckBox
            checked={popupMakerConf?.utilities?.selected_force_delete || false}
            onChange={() => actionHandler('force_delete')}
            className="wdt-200 mt-4 mr-2"
            value="force_delete"
            title={__('Force Delete', 'bit-integrations')}
            subTitle={__('Delete permanently instead of trashing', 'bit-integrations')}
          />

          {renderActionModal(
            'force_delete',
            __('Force Delete', 'bit-integrations'),
            forceDeleteOptions,
            'selected_force_delete'
          )}
        </>
      )}

      {isSubscriberWrite && (
        <>
          <TableCheckBox
            checked={popupMakerConf?.utilities?.selected_consent || false}
            onChange={() => actionHandler('consent')}
            className="wdt-200 mt-4 mr-2"
            value="consent"
            title={__('Consent', 'bit-integrations')}
            subTitle={__('Set the subscriber consent', 'bit-integrations')}
          />

          {renderActionModal(
            'consent',
            __('Consent', 'bit-integrations'),
            consentOptions,
            'selected_consent'
          )}
        </>
      )}
    </div>
  )
}
