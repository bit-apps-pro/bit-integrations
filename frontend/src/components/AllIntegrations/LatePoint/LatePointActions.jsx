import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import {
  bookingStatusOptions,
  fulfillmentStatusOptions,
  orderStatusOptions,
  paymentStatusOptions
} from './staticData'

/**
 * Optional status enums. These all have sensible LatePoint defaults, so they are
 * opt-in here rather than always-visible selects in the integration layout.
 */
export default function LatePointActions({ latePointConf, setLatePointConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const clsActionMdl = () => setActionMdl({ show: false })

  const setAction = (val, name) => {
    setLatePointConf(prevConf =>
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
          defaultValue={latePointConf?.utilities?.[valueName] || undefined}
          onChange={val => setAction(val, valueName)}
        />
      </div>
    </ConfirmModal>
  )

  const isBooking =
    latePointConf?.mainAction === 'create_booking' || latePointConf?.mainAction === 'update_booking'
  const isOrder = latePointConf?.mainAction === 'create_order'

  return (
    <div className="pos-rel d-flx flx-wrp">
      {isBooking && (
        <>
          <TableCheckBox
            checked={latePointConf?.utilities?.selected_booking_status || false}
            onChange={() => setActionMdl({ show: 'booking_status' })}
            className="wdt-200 mt-4 mr-2"
            value="booking_status"
            title={__('Booking Status', 'bit-integrations')}
            subTitle={__('Set the booking status', 'bit-integrations')}
          />
          {renderActionModal(
            'booking_status',
            __('Booking Status', 'bit-integrations'),
            bookingStatusOptions,
            'selected_booking_status'
          )}
        </>
      )}

      {(isBooking || isOrder) && (
        <>
          <TableCheckBox
            checked={latePointConf?.utilities?.selected_order_status || false}
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
            checked={latePointConf?.utilities?.selected_payment_status || false}
            onChange={() => setActionMdl({ show: 'payment_status' })}
            className="wdt-200 mt-4 mr-2"
            value="payment_status"
            title={__('Payment Status', 'bit-integrations')}
            subTitle={__('Set the payment status', 'bit-integrations')}
          />
          {renderActionModal(
            'payment_status',
            __('Payment Status', 'bit-integrations'),
            paymentStatusOptions,
            'selected_payment_status'
          )}

          <TableCheckBox
            checked={latePointConf?.utilities?.selected_fulfillment_status || false}
            onChange={() => setActionMdl({ show: 'fulfillment_status' })}
            className="wdt-200 mt-4 mr-2"
            value="fulfillment_status"
            title={__('Fulfillment Status', 'bit-integrations')}
            subTitle={__('Set the fulfillment status', 'bit-integrations')}
          />
          {renderActionModal(
            'fulfillment_status',
            __('Fulfillment Status', 'bit-integrations'),
            fulfillmentStatusOptions,
            'selected_fulfillment_status'
          )}
        </>
      )}
    </div>
  )
}
