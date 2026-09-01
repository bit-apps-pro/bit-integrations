import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import {
  activeStatusOptions,
  appointmentStatusOptions,
  notificationTypeOptions,
  orderStatusOptions,
  paymentMethodOptions,
  paymentStatusOptions
} from './staticData'

export default function RoxAppointmentBookingActions({
  roxAppointmentBookingConf,
  setRoxAppointmentBookingConf
}) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const clsActionMdl = () => setActionMdl({ show: false })

  const setAction = (val, name) => {
    setRoxAppointmentBookingConf(prevConf =>
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
          defaultValue={roxAppointmentBookingConf?.utilities?.[valueName] || undefined}
          onChange={val => setAction(val, valueName)}
        />
      </div>
    </ConfirmModal>
  )

  const utility = (type, title, subTitle, options, valueName) => (
    <>
      <TableCheckBox
        checked={roxAppointmentBookingConf?.utilities?.[valueName] || false}
        onChange={() => setActionMdl({ show: type })}
        className="wdt-200 mt-4 mr-2"
        value={type}
        title={title}
        subTitle={subTitle}
      />
      {renderActionModal(type, title, options, valueName)}
    </>
  )

  const { mainAction } = roxAppointmentBookingConf || {}

  return (
    <div className="pos-rel d-flx flx-wrp">
      {mainAction === 'create_agent' &&
        utility(
          'agent_status',
          __('Status', 'bit-integrations'),
          __('Set the agent status', 'bit-integrations'),
          activeStatusOptions,
          'selected_agent_status'
        )}

      {mainAction === 'create_service' &&
        utility(
          'service_status',
          __('Status', 'bit-integrations'),
          __('Set the service status', 'bit-integrations'),
          activeStatusOptions,
          'selected_service_status'
        )}

      {mainAction === 'create_appointment' && (
        <>
          {utility(
            'appointment_status',
            __('Appointment Status', 'bit-integrations'),
            __('Set the appointment status', 'bit-integrations'),
            appointmentStatusOptions,
            'selected_appointment_status'
          )}
          {utility(
            'payment_status',
            __('Payment Status', 'bit-integrations'),
            __('Set the payment status', 'bit-integrations'),
            paymentStatusOptions,
            'selected_payment_status'
          )}
        </>
      )}

      {mainAction === 'create_order' && (
        <>
          {utility(
            'order_status',
            __('Order Status', 'bit-integrations'),
            __('Set the order status', 'bit-integrations'),
            orderStatusOptions,
            'selected_order_status'
          )}
          {utility(
            'order_payment_status',
            __('Payment Status', 'bit-integrations'),
            __('Set the payment status', 'bit-integrations'),
            paymentStatusOptions,
            'selected_order_payment_status'
          )}
          {utility(
            'order_payment_method',
            __('Payment Method', 'bit-integrations'),
            __('Set the payment method', 'bit-integrations'),
            paymentMethodOptions,
            'selected_order_payment_method'
          )}
        </>
      )}

      {mainAction === 'create_payment' && (
        <>
          {utility(
            'payment_record_status',
            __('Payment Status', 'bit-integrations'),
            __('Set the payment status', 'bit-integrations'),
            paymentStatusOptions,
            'selected_payment_record_status'
          )}
          {utility(
            'payment_record_method',
            __('Payment Method', 'bit-integrations'),
            __('Set the payment method', 'bit-integrations'),
            paymentMethodOptions,
            'selected_payment_record_method'
          )}
        </>
      )}

      {mainAction === 'create_notification' &&
        utility(
          'notification_type',
          __('Type', 'bit-integrations'),
          __('Set the notification type', 'bit-integrations'),
          notificationTypeOptions,
          'selected_notification_type'
        )}
    </div>
  )
}
