/* eslint-disable no-param-reassign */

import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { refreshRestaurantReservationsStatuses } from './RestaurantReservationsCommonFunc'

export default function RestaurantReservationsActions({
  restaurantReservationsConf,
  setRestaurantReservationsConf
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false })

  const setAction = (val, name) => {
    setRestaurantReservationsConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )
  }

  const toggleCheckbox = name => {
    setRestaurantReservationsConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }

        if (draftConf.utilities[name] === 'true') {
          delete draftConf.utilities[name]
        } else {
          draftConf.utilities[name] = 'true'
        }
      })
    )
  }

  const openStatusModal = () => {
    setActionMdl({ show: 'status' })
    refreshRestaurantReservationsStatuses(setRestaurantReservationsConf, setIsLoading)
  }

  const clsActionMdl = () => setActionMdl({ show: false })

  const statusOptions = (restaurantReservationsConf?.allStatuses || []).map(status => ({
    label: status.label,
    value: status.value?.toString()
  }))

  const { mainAction, utilities } = restaurantReservationsConf
  const hasBookingOptions = ['create_booking', 'update_booking'].includes(mainAction)
  const canSendNotifications = ['create_booking', 'update_booking', 'change_booking_status'].includes(
    mainAction
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
      {hasBookingOptions && (
        <>
          <TableCheckBox
            checked={utilities?.selected_status || false}
            onChange={openStatusModal}
            className="wdt-200 mt-4 mr-2"
            value="status"
            title={__('Status', 'bit-integrations')}
            subTitle={
              mainAction === 'create_booking'
                ? __('Set the status. Without it, the plugin rules set the status.', 'bit-integrations')
                : __('Change the status of the booking', 'bit-integrations')
            }
          />
          <ConfirmModal
            className="custom-conf-mdl"
            mainMdlCls="o-v"
            btnClass="purple"
            btnTxt={__('Ok', 'bit-integrations')}
            show={actionMdl.show === 'status'}
            close={clsActionMdl}
            action={clsActionMdl}
            title={__('Status', 'bit-integrations')}>
            <div className="btcd-hr mt-2 mb-2" />
            <div className="mt-2">{__('Status', 'bit-integrations')}</div>
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
                  options={statusOptions}
                  className="msl-wrp-options"
                  singleSelect
                  closeOnSelect
                  defaultValue={utilities?.selected_status || undefined}
                  onChange={val => setAction(val, 'selected_status')}
                />
                <button
                  onClick={() =>
                    refreshRestaurantReservationsStatuses(setRestaurantReservationsConf, setIsLoading)
                  }
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
      )}

      {canSendNotifications && (
        <TableCheckBox
          checked={utilities?.send_notifications === 'true'}
          onChange={() => toggleCheckbox('send_notifications')}
          className="wdt-200 mt-4 mr-2"
          value="send_notifications"
          title={__('Send Notifications', 'bit-integrations')}
          subTitle={__('Send the plugin booking emails', 'bit-integrations')}
        />
      )}

      {mainAction === 'delete_bookings_by_email' && (
        <TableCheckBox
          checked={utilities?.delete_permanently === 'true'}
          onChange={() => toggleCheckbox('delete_permanently')}
          className="wdt-200 mt-4 mr-2"
          value="delete_permanently"
          title={__('Delete Permanently', 'bit-integrations')}
          subTitle={__(
            'Delete the bookings. Without it, the bookings move to the trash.',
            'bit-integrations'
          )}
        />
      )}
    </div>
  )
}
