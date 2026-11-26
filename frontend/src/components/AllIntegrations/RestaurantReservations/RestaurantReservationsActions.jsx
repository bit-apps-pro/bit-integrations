import { create } from 'mutative'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'

export default function RestaurantReservationsActions({
  restaurantReservationsConf,
  setRestaurantReservationsConf
}) {
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

  const { mainAction, utilities } = restaurantReservationsConf
  const canSendNotifications = ['create_booking', 'update_booking', 'change_booking_status'].includes(
    mainAction
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
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
