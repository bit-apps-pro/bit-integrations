import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { orderStatusOptions, sendReceiptOptions } from './staticData'

export default function ProfilePressActions({ profilePressConf, setProfilePressConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const clsActionMdl = () => setActionMdl({ show: false })

  const setAction = (val, name) => {
    setProfilePressConf(prevConf =>
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
          defaultValue={profilePressConf?.utilities?.[valueName] || undefined}
          onChange={val => setAction(val, valueName)}
        />
      </div>
    </ConfirmModal>
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
      <TableCheckBox
        checked={profilePressConf?.utilities?.selected_order_status || false}
        onChange={() => setActionMdl({ show: 'order_status' })}
        className="wdt-200 mt-4 mr-2"
        value="order_status"
        title={__('Order Status', 'bit-integrations')}
        subTitle={__('Set the order status', 'bit-integrations')}
      />
      {renderActionModal(
        'order_status',
        __('Order Status', 'bit-integrations'),
        orderStatusOptions,
        'selected_order_status'
      )}

      <TableCheckBox
        checked={profilePressConf?.utilities?.selected_send_receipt || false}
        onChange={() => setActionMdl({ show: 'send_receipt' })}
        className="wdt-200 mt-4 mr-2"
        value="send_receipt"
        title={__('Send Receipt', 'bit-integrations')}
        subTitle={__('Email a receipt to the customer', 'bit-integrations')}
      />
      {renderActionModal(
        'send_receipt',
        __('Send Receipt', 'bit-integrations'),
        sendReceiptOptions,
        'selected_send_receipt'
      )}
    </div>
  )
}
